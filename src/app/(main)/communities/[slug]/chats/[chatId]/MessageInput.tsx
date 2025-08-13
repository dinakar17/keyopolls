import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
  Camera,
  FileText,
  Image as ImageIcon,
  Loader2,
  Mic,
  Paperclip,
  Send,
  Video,
  X,
} from 'lucide-react';

import { useKeyopollsChatsApiMessagesCreateTimelineItem } from '@/api/chat-messages/chat-messages';
import { CreateTimelineItemSchema } from '@/api/schemas';
import { useProfileStore } from '@/stores/useProfileStore';

interface MessageInputProps {
  chatId: string;
  onMessageSent: () => void;
}

const MessageInput = ({ chatId, onMessageSent }: MessageInputProps) => {
  const { accessToken } = useProfileStore();

  const [messageInput, setMessageInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messageInputRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Create timeline item mutation
  const { mutate: createTimelineItem, isPending: isCreating } =
    useKeyopollsChatsApiMessagesCreateTimelineItem({
      request: {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
      mutation: {
        onSuccess: () => {
          setMessageInput('');
          setSelectedFile(null);
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
      if ((!messageInput.trim() && !selectedFile && type !== 'audio') || isCreating) return;

      try {
        let messageData: CreateTimelineItemSchema;

        if (type === 'audio') {
          messageData = {
            chat_id: String(chatId),
            item_type: 'audio',
            content: `Audio message (${formatAudioDuration(duration || 0)})`,
            // audio_duration: duration,
          };
        } else {
          messageData = {
            chat_id: String(chatId),
            item_type: selectedFile ? getFileType(selectedFile) : 'text',
            content: messageInput.trim() || null,
          };
        }

        if (selectedFile && type !== 'audio') {
          await createTimelineItem({
            data: {
              data: messageData,
              file: selectedFile,
            },
          });
        } else {
          await createTimelineItem({
            data: {
              data: messageData,
              file: undefined, // No file for text messages
            },
          });
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    },
    [
      messageInput,
      selectedFile,
      chatId,
      createTimelineItem,
      isCreating,
      getFileType,
      formatAudioDuration,
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

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, []);

  const handleStopRecording = useCallback(() => {
    setIsRecording(false);
    handleSendMessage('audio', recordingDuration);
  }, [recordingDuration, handleSendMessage]);

  return (
    <>
      <div className="border-border bg-surface border-t p-4">
        {/* File preview */}
        {selectedFile && (
          <div className="bg-surface-elevated mb-3 flex items-center gap-3 rounded-lg p-3">
            <div className="bg-primary/10 rounded-lg p-2">
              {getFileType(selectedFile) === 'image' ? (
                <ImageIcon className="text-primary h-5 w-5" />
              ) : getFileType(selectedFile) === 'video' ? (
                <Video className="text-primary h-5 w-5" />
              ) : (
                <FileText className="text-primary h-5 w-5" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{selectedFile.name}</p>
              <p className="text-text-secondary text-xs">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-text-secondary hover:text-text rounded-full p-1 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attachment button */}
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
          {messageInput.trim() || selectedFile ? (
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
          ) : (
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

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

      {/* Click outside handler for dropdowns */}
      {showAttachmentMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setShowAttachmentMenu(false)} />
      )}
    </>
  );
};

export default MessageInput;
