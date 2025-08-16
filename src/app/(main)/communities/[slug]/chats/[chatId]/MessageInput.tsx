import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useParams } from 'next/navigation';

import {
  Camera,
  Clock,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageCircle,
  Mic,
  Paperclip,
  Reply,
  Send,
  Upload,
  Video,
  X,
} from 'lucide-react';

import { useKeyopollsChatsApiMessagesCreateTimelineItem } from '@/api/chat-messages/chat-messages';
import { useKeyopollsChatsApiServicesGetServices } from '@/api/default/default';
import { CreateTimelineItemSchema, MentorDetails, ServiceItemSchema } from '@/api/schemas';
import { useProfileStore } from '@/stores/useProfileStore';

interface MessageInputProps {
  chatId: string;
  onMessageSent: () => void;
  mentorData?: MentorDetails; // Optional mentor data for additional features
}

const MessageInput = ({ chatId, onMessageSent, mentorData }: MessageInputProps) => {
  const { accessToken, profileData } = useProfileStore();
  const { slug } = useParams<{ slug: string }>();

  const isMentor = profileData?.id === mentorData?.id;

  const [messageInput, setMessageInput] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Scroll behavior state
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Service selection states
  const [selectedService, setSelectedService] = useState<ServiceItemSchema | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);

  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch mentor's services (only for non-mentors)
  const { data: servicesData, isLoading: isLoadingServices } =
    useKeyopollsChatsApiServicesGetServices(
      {
        community_slug: slug as string,
        creator_id: mentorData?.id,
        service_types: 'dm,custom_services',
      },
      {
        request: {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
        query: {
          enabled: !!mentorData?.id && !isMentor && !!slug,
        },
      }
    );

  // Services are already filtered by backend - just use them directly
  const availableServices = React.useMemo(() => {
    return servicesData?.data?.services || [];
  }, [servicesData]);

  // Auto-select DM service by default
  useEffect(() => {
    if (availableServices.length > 0 && !selectedService) {
      const dmService = availableServices.find((service) => service.service_type === 'dm');
      if (dmService) {
        setSelectedService(dmService);
      } else {
        setSelectedService(availableServices[0]);
      }
    }
  }, [availableServices, selectedService]);

  // Scroll behavior effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = currentScrollY - lastScrollY;

      // Only hide if scrolling up and moved more than 10px
      if (scrollDifference < -10 && currentScrollY > 100) {
        setIsVisible(false);
      }
      // Show if scrolling down or near top
      else if (scrollDifference > 10 || currentScrollY <= 100) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, [lastScrollY]);

  // Create timeline item mutation
  const { mutate: createTimelineItem, isPending: isCreating } =
    useKeyopollsChatsApiMessagesCreateTimelineItem({
      request: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      mutation: {
        onSuccess: () => {
          setMessageInput('');
          setSelectedFiles([]);
          onMessageSent();
        },
        onError: (error) => {
          console.error('Failed to send message:', error);
          alert('Failed to send message. Please try again.');
        },
      },
    });

  // Auto-resize textarea
  useEffect(() => {
    if (messageInputRef.current) {
      messageInputRef.current.style.height = 'auto';
      messageInputRef.current.style.height = `${messageInputRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  // Handle typing indicator
  useEffect(() => {
    if (messageInput.trim() && !isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, isTyping]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [isRecording]);

  const formatFileSize = useCallback((bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatAudioDuration = useCallback((seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  }, []);

  const getFileType = useCallback((file: File) => {
    if (!file || !file.type) return 'document';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('audio/')) return 'audio';
    return 'document';
  }, []);

  const handleSendMessage = useCallback(
    async (type: 'text' | 'image' | 'video' | 'audio', duration?: number) => {
      if ((!messageInput.trim() && selectedFiles.length === 0 && type !== 'audio') || isCreating)
        return;

      try {
        let messageData: CreateTimelineItemSchema;

        if (type === 'audio') {
          messageData = {
            chat_id: String(chatId),
            item_type: 'audio',
            content: `Audio message (${formatAudioDuration(duration || 0)})`,
            service_item_id: !isMentor && selectedService ? selectedService.id : undefined,
          };
        } else {
          messageData = {
            chat_id: String(chatId),
            item_type: selectedFiles.length > 0 ? getFileType(selectedFiles[0]) : 'text',
            content: messageInput.trim() || null,
            service_item_id: !isMentor && selectedService ? selectedService.id : undefined,
          };
        }

        if (selectedFiles.length > 0 && type !== 'audio') {
          createTimelineItem({
            data: {
              data: messageData,
              attachments: selectedFiles,
            },
          });
        } else {
          createTimelineItem({
            data: {
              data: messageData,
              attachments: undefined,
            },
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [
      messageInput,
      selectedFiles,
      chatId,
      createTimelineItem,
      isCreating,
      getFileType,
      formatAudioDuration,
      isMentor,
      selectedService,
    ]
  );

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage('text');
      }
    },
    [handleSendMessage]
  );

  const handleAttachment = useCallback(
    (type: string) => {
      setShowAttachmentMenu(false);

      switch (type) {
        case 'camera':
          console.log('Opening camera...');
          break;
        case 'gallery':
          if (fileInputRef?.current) {
            fileInputRef.current.accept = 'image/*,video/*';
            fileInputRef.current.click();
          }
          break;
        case 'document':
          if (fileInputRef?.current) {
            fileInputRef.current.accept = '.pdf,.doc,.docx,.txt,.xlsx,.ppt,.pptx';
            fileInputRef.current.click();
          }
          break;
        case 'audio':
          setIsRecording(!isRecording);
          break;
      }
    },
    [isRecording]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      // For mentors, allow multiple files up to 10
      if (isMentor) {
        const totalFiles = selectedFiles.length + files.length;
        if (totalFiles > 10) {
          alert(
            `Cannot add ${files.length} files. Maximum 10 files allowed total (currently have ${selectedFiles.length})`
          );
          return;
        }
      } else {
        // For non-mentors with DM service, only allow single file and only for custom services requiring input
        if (selectedService?.service_type === 'dm') {
          alert('File attachments are not allowed for Direct Message services');
          e.target.value = '';
          return;
        }

        if (selectedFiles.length + files.length > 1) {
          alert('Only one file allowed for this service');
          e.target.value = '';
          return;
        }
      }

      // Validate file sizes
      const invalidFiles = files.filter((file) => file.size > 50 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        alert('Some files are too large. Maximum size is 50MB per file');
        return;
      }

      setSelectedFiles((prev) => [...prev, ...files]);
      e.target.value = '';
    },
    [selectedFiles, isMentor, selectedService]
  );

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    handleSendMessage('audio', recordingDuration);
  }, [recordingDuration, handleSendMessage]);

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleServiceSelect = useCallback((service: ServiceItemSchema) => {
    setSelectedService(service);
    setShowServiceModal(true);
  }, []);

  const handleServiceConfirm = useCallback(() => {
    setShowServiceModal(false);
    // Clear files if switching to DM service
    if (selectedService?.service_type === 'dm') {
      setSelectedFiles([]);
    }
  }, [selectedService]);

  // Loading skeleton component for service cards
  const ServiceSkeleton = () => (
    <div
      className="flex-shrink-0 animate-pulse rounded-lg bg-gray-300"
      style={{ minWidth: '200px', maxWidth: '240px', height: '72px' }}
    ></div>
  );

  // Check if attachments are allowed based on current service
  const attachmentsAllowed =
    isMentor ||
    (selectedService?.service_type === 'custom' && selectedService?.attachments_required);
  const audioAllowed = isMentor || selectedService?.service_type !== 'dm';

  return (
    <>
      {/* Container with scroll-based visibility and smooth transitions */}
      <div
        className={`fixed right-0 bottom-0 left-0 z-40 transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Service Selection (only for non-mentors) */}
        {!isMentor && (isLoadingServices || availableServices.length > 0) && (
          <div className="border-border bg-surface-elevated border-t p-4">
            <h4 className="text-text mb-3 text-sm font-medium">
              {isLoadingServices ? (
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300"></div>
              ) : (
                'Select Service'
              )}
            </h4>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {isLoadingServices ? (
                // Show 3 skeleton cards while loading
                <>
                  <ServiceSkeleton />
                  <ServiceSkeleton />
                  <ServiceSkeleton />
                </>
              ) : (
                availableServices.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className={`flex-shrink-0 rounded-lg border px-3 py-2 text-left transition-colors ${
                      selectedService?.id === service.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-surface hover:bg-surface-elevated text-text'
                    }`}
                    style={{ minWidth: '200px', maxWidth: '240px' }}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{service.name}</span>
                      {service.service_type === 'dm' && (
                        <MessageCircle className="h-3 w-3 flex-shrink-0" />
                      )}
                      {service.service_type === 'custom' && service.attachments_required && (
                        <Upload className="h-3 w-3 flex-shrink-0" />
                      )}
                    </div>
                    <div className="text-text-secondary flex items-center gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <span>{service.price === 0 ? 'Free' : `${service.price} credits`}</span>
                      </div>
                      {service.service_type === 'dm' && service.reply_time && (
                        <div className="flex items-center gap-1">
                          <Reply className="h-3 w-3" />
                          <span>{service.reply_time}d</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        <div className="border-border bg-surface border-t p-4">
          {/* File previews */}
          {selectedFiles.length > 0 && (
            <div className="mb-3 space-y-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="bg-surface-elevated flex items-center gap-3 rounded-lg p-3"
                >
                  <div className="bg-primary/10 rounded-lg p-2">
                    {getFileType(file) === 'image' ? (
                      <ImageIcon className="text-primary h-5 w-5" />
                    ) : getFileType(file) === 'video' ? (
                      <Video className="text-primary h-5 w-5" />
                    ) : (
                      <FileText className="text-primary h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-text-secondary text-xs">{formatFileSize(file.size)}</p>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-text-secondary hover:text-text rounded-full p-1 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            {/* Attachment button */}
            {attachmentsAllowed && (
              <div className="relative">
                <button
                  onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                  className="text-text-secondary hover:text-primary hover:bg-surface-elevated rounded-full p-2 transition-colors"
                  disabled={isCreating}
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                {/* Attachment menu */}
                {showAttachmentMenu && (
                  <div className="bg-surface border-border absolute bottom-full left-0 z-20 mb-2 w-48 rounded-lg border shadow-lg">
                    <button
                      onClick={() => handleAttachment('camera')}
                      className="hover:bg-surface-elevated flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
                    >
                      <Camera className="text-primary h-5 w-5" />
                      Camera
                    </button>
                    <button
                      onClick={() => handleAttachment('gallery')}
                      className="hover:bg-surface-elevated flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
                    >
                      <ImageIcon className="text-success h-5 w-5" />
                      Photo & Video
                    </button>
                    <button
                      onClick={() => handleAttachment('document')}
                      className="hover:bg-surface-elevated flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors"
                    >
                      <FileText className="text-warning h-5 w-5" />
                      Document
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Message input */}
            <div className="border-border bg-surface-elevated flex-1 rounded-2xl border">
              <textarea
                ref={messageInputRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="text-text placeholder-text-muted w-full resize-none bg-transparent px-4 py-3 text-sm focus:outline-none"
                rows={1}
                style={{
                  minHeight: '44px',
                  maxHeight: '120px',
                }}
                disabled={isCreating}
              />
            </div>

            {/* Send/Record button */}
            {messageInput.trim() || selectedFiles.length > 0 ? (
              <button
                onClick={() => handleSendMessage('text')}
                disabled={isCreating}
                className="bg-primary hover:bg-primary/90 flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors disabled:opacity-50"
              >
                {isCreating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            ) : audioAllowed ? (
              <button
                onClick={() => handleAttachment('audio')}
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors ${
                  isRecording
                    ? 'bg-error text-white'
                    : 'text-text-secondary hover:text-primary hover:bg-surface-elevated'
                }`}
              >
                <Mic className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex h-11 w-11 items-center justify-center">
                {/* Empty space when audio not allowed */}
              </div>
            )}
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="bg-error/10 border-error/20 mt-3 flex items-center gap-3 rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <div className="bg-error h-3 w-3 animate-pulse rounded-full" />
                <span className="text-error text-sm font-medium">
                  Recording... {formatAudioDuration(recordingDuration)}
                </span>
              </div>
              <div className="ml-auto flex gap-2">
                <button
                  onClick={() => setIsRecording(false)}
                  className="text-text-secondary hover:text-text rounded-full p-1 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <button
                  onClick={handleStopRecording}
                  className="bg-error hover:bg-error/90 rounded-full p-1 text-white transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isTyping && <div className="text-text-secondary mt-2 text-xs">You are typing...</div>}
        </div>
      </div>

      {/* Service Details Modal */}
      {showServiceModal && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border-border w-full max-w-md rounded-lg border">
            <div className="border-border flex items-center justify-between border-b px-4 py-3">
              <h3 className="text-text text-lg font-semibold">{selectedService.name}</h3>
              <button
                onClick={() => setShowServiceModal(false)}
                className="text-text-muted hover:text-text rounded-full p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <p className="text-text-secondary text-sm">{selectedService.description}</p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {selectedService.price === 0 ? 'Free' : `${selectedService.price} credits`}
                  </span>
                </div>

                {selectedService.service_type === 'dm' && selectedService.reply_time && (
                  <div className="flex items-center gap-1">
                    <Reply className="text-text-secondary h-4 w-4" />
                    <span className="text-text-secondary">
                      {selectedService.reply_time} day reply
                    </span>
                  </div>
                )}

                {selectedService.is_duration_based && (
                  <div className="flex items-center gap-1">
                    <Clock className="text-text-secondary h-4 w-4" />
                    <span className="text-text-secondary">{selectedService.duration_minutes}m</span>
                  </div>
                )}
              </div>

              {selectedService.service_type === 'dm' && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm text-blue-800">
                    This is a direct message service. You can send text messages only.
                  </p>
                </div>
              )}

              {selectedService.service_type === 'custom' &&
                selectedService.attachments_required && (
                  <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <p className="text-sm text-orange-800">
                      This service requires file attachments. Please include relevant files with
                      your message.
                    </p>
                  </div>
                )}
            </div>

            <div className="border-border flex justify-end gap-2 border-t px-4 py-3">
              <button
                onClick={() => setShowServiceModal(false)}
                className="border-border text-text hover:bg-surface-elevated rounded-md border px-3 py-2 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleServiceConfirm}
                className="bg-primary text-background rounded-md px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Use This Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={isMentor}
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Click outside handlers */}
      {showAttachmentMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowAttachmentMenu(false)} />
      )}
    </>
  );
};

export default MessageInput;
