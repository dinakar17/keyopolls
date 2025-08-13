import React, { useCallback, useState } from 'react';

import Image from 'next/image';

import {
  Check,
  CheckCheck,
  Circle,
  Download,
  FileText,
  Image as ImageIcon,
  Info,
  Phone,
  Play,
  Video,
  X,
} from 'lucide-react';

import { useKeyopollsChatsApiMessagesDeleteTimelineItem } from '@/api/chat-messages/chat-messages';
import { TimelineItemSchema } from '@/api/schemas';
import { useProfileStore } from '@/stores/useProfileStore';

interface MessageItemProps {
  timelineItem: TimelineItemSchema;
  onRefresh: () => void;
}

const MessageItem = ({ timelineItem, onRefresh }: MessageItemProps) => {
  const { accessToken, profileData } = useProfileStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState(false);

  const { mutate: deleteTimelineItem } = useKeyopollsChatsApiMessagesDeleteTimelineItem({
    request: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    mutation: {
      onSuccess: () => {
        onRefresh();
      },
      onError: (error) => {
        console.error('Failed to delete message:', error);
        alert('Failed to delete message');
      },
    },
  });

  const formatTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, []);

  const formatCallDuration = useCallback((seconds: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // const formatAudioDuration = useCallback((seconds: number) => {
  //   if (!seconds) return '0:00';
  //   const mins = Math.floor(seconds / 60);
  //   const remainingSecs = seconds % 60;
  //   return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  // }, []);

  const getMessageStatusIcon = useCallback(
    (item: TimelineItemSchema) => {
      // Only show status for messages sent by current user
      if (item.sender.id !== profileData?.id) return null;

      if (item.is_read) {
        return <CheckCheck className="text-primary h-4 w-4" />;
      } else if (item.is_delivered) {
        return <CheckCheck className="text-text-secondary h-4 w-4" />;
      } else {
        return <Check className="text-text-secondary h-4 w-4" />;
      }
    },
    [profileData?.id]
  );

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Only allow delete for messages sent by current user
    if (timelineItem.sender.id === profileData?.id) {
      if (window.confirm('Delete this message?')) {
        deleteTimelineItem({ itemId: timelineItem.id });
      }
    }
  };

  const handlePlayAudio = () => {
    setPlayingAudio(!playingAudio);
    // Simulate audio ending after duration
    if (!playingAudio) {
      setTimeout(() => setPlayingAudio(false), 3000);
    }
  };

  const isMyMessage = timelineItem.sender.id === profileData?.id;

  return (
    <>
      <div
        className={`mb-3 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
        onContextMenu={handleContextMenu}
      >
        <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
          {/* Text message */}
          {timelineItem.item_type === 'text' && (
            <div
              className={`rounded-lg px-3 py-2 ${
                isMyMessage ? 'bg-primary text-white' : 'bg-surface border-border border'
              }`}
            >
              <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                {timelineItem.content}
              </p>
              <div
                className={`mt-1 flex items-center justify-end gap-1 ${
                  isMyMessage ? 'text-white/70' : 'text-text-secondary'
                }`}
              >
                <span className="text-xs">{formatTime(timelineItem.created_at)}</span>
                {getMessageStatusIcon(timelineItem)}
              </div>
            </div>
          )}

          {/* Image message */}
          {timelineItem.item_type === 'image' && (
            <div
              className={`overflow-hidden rounded-lg ${
                isMyMessage ? 'bg-primary' : 'bg-surface border-border border'
              }`}
            >
              <div className="relative">
                {timelineItem.file_url ? (
                  <Image
                    src={timelineItem.file_url}
                    alt="Shared image"
                    className="h-auto w-full cursor-pointer"
                    width={300}
                    height={200}
                    onClick={() => setSelectedImage(timelineItem.file_url || null)}
                  />
                ) : (
                  <div className="bg-surface-elevated flex h-32 w-48 items-center justify-center">
                    <ImageIcon className="text-text-secondary h-8 w-8" />
                  </div>
                )}
                <div
                  className={`absolute right-2 bottom-2 flex items-center gap-1 rounded px-2 py-1 ${
                    isMyMessage ? 'bg-black/30 text-white' : 'text-text-secondary bg-white/80'
                  }`}
                >
                  <span className="text-xs">{formatTime(timelineItem.created_at)}</span>
                  {getMessageStatusIcon(timelineItem)}
                </div>
              </div>
            </div>
          )}

          {/* Video message */}
          {timelineItem.item_type === 'video' && (
            <div
              className={`overflow-hidden rounded-lg ${
                isMyMessage ? 'bg-primary' : 'bg-surface border-border border'
              }`}
            >
              <div className="relative">
                {timelineItem.file_url ? (
                  <video
                    src={timelineItem.file_url}
                    className="h-auto w-full"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <div className="bg-surface-elevated flex h-32 w-48 items-center justify-center">
                    <Video className="text-text-secondary h-8 w-8" />
                  </div>
                )}
                <div
                  className={`absolute right-2 bottom-2 flex items-center gap-1 rounded px-2 py-1 ${
                    isMyMessage ? 'bg-black/30 text-white' : 'text-text-secondary bg-white/80'
                  }`}
                >
                  <span className="text-xs">{formatTime(timelineItem.created_at)}</span>
                  {getMessageStatusIcon(timelineItem)}
                </div>
              </div>
            </div>
          )}

          {/* Document message */}
          {timelineItem.item_type === 'document' && (
            <div
              className={`rounded-lg p-3 ${
                isMyMessage ? 'bg-primary text-white' : 'bg-surface border-border border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    isMyMessage ? 'bg-white/20' : 'bg-surface-elevated'
                  }`}
                >
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {timelineItem.file_name || 'Document'}
                  </p>
                  <p className={`text-xs ${isMyMessage ? 'text-white/70' : 'text-text-secondary'}`}>
                    {timelineItem.file_size
                      ? formatFileSize(timelineItem.file_size)
                      : 'Unknown size'}
                  </p>
                </div>
                {timelineItem.file_url && (
                  <a
                    href={timelineItem.file_url}
                    download={timelineItem.file_name}
                    className={`rounded-full p-1 transition-colors ${
                      isMyMessage ? 'hover:bg-white/20' : 'hover:bg-surface-elevated'
                    }`}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div
                className={`mt-2 flex items-center justify-end gap-1 ${
                  isMyMessage ? 'text-white/70' : 'text-text-secondary'
                }`}
              >
                <span className="text-xs">{formatTime(timelineItem.created_at)}</span>
                {getMessageStatusIcon(timelineItem)}
              </div>
            </div>
          )}

          {/* Audio message */}
          {timelineItem.item_type === 'audio' && (
            <div
              className={`rounded-lg p-3 ${
                isMyMessage ? 'bg-primary text-white' : 'bg-surface border-border border'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePlayAudio}
                  className={`rounded-full p-2 transition-colors ${
                    isMyMessage
                      ? 'bg-white/20 hover:bg-white/30'
                      : 'bg-surface-elevated hover:bg-surface'
                  }`}
                >
                  {playingAudio ? (
                    <Circle className="h-4 w-4 fill-current" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </button>
                <div className="flex-1">
                  <div
                    className={`mb-1 h-1 rounded-full ${
                      isMyMessage ? 'bg-white/30' : 'bg-surface-elevated'
                    }`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isMyMessage ? 'bg-white' : 'bg-primary'
                      } ${playingAudio ? 'w-2/3' : 'w-1/3'}`}
                    />
                  </div>
                  <p className={`text-xs ${isMyMessage ? 'text-white/70' : 'text-text-secondary'}`}>
                    {/* {formatAudioDuration(timelineItem.audio_duration || 0)} */}
                  </p>
                </div>
              </div>
              <div
                className={`mt-2 flex items-center justify-end gap-1 ${
                  isMyMessage ? 'text-white/70' : 'text-text-secondary'
                }`}
              >
                <span className="text-xs">{formatTime(timelineItem.created_at)}</span>
                {getMessageStatusIcon(timelineItem)}
              </div>
            </div>
          )}

          {/* Call message */}
          {(timelineItem.item_type === 'voice_call' || timelineItem.item_type === 'video_call') && (
            <div
              className={`rounded-lg border-l-4 p-3 ${
                timelineItem.call_status === 'answered'
                  ? 'border-success bg-success/10'
                  : timelineItem.call_status === 'missed'
                    ? 'border-error bg-error/10'
                    : 'border-warning bg-warning/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2 ${
                    timelineItem.call_status === 'answered'
                      ? 'bg-success/20'
                      : timelineItem.call_status === 'missed'
                        ? 'bg-error/20'
                        : 'bg-warning/20'
                  }`}
                >
                  {timelineItem.item_type === 'voice_call' ? (
                    <Phone className="h-4 w-4" />
                  ) : (
                    <Video className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-text text-sm font-medium">
                    {timelineItem.item_type === 'voice_call' ? 'Voice call' : 'Video call'}
                  </p>
                  <p className="text-text-secondary text-xs">
                    {timelineItem.call_status === 'answered' && timelineItem.call_duration
                      ? `Duration: ${formatCallDuration(timelineItem.call_duration)}`
                      : timelineItem.call_status === 'missed'
                        ? 'Missed call'
                        : timelineItem.call_status === 'initiated'
                          ? 'Call initiated'
                          : 'Call ended'}
                  </p>
                </div>
              </div>
              <div className="text-text-secondary mt-2 flex items-center justify-end gap-1">
                <span className="text-xs">{formatTime(timelineItem.created_at)}</span>
                {getMessageStatusIcon(timelineItem)}
              </div>
            </div>
          )}

          {/* Broadcast message */}
          {timelineItem.is_broadcast && (
            <div className="bg-info/10 border-info/20 rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <div className="bg-info/20 rounded-full p-2">
                  <Info className="text-info h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-info text-sm font-medium">Broadcast</p>
                  <p className="text-text text-sm leading-relaxed">{timelineItem.content}</p>
                </div>
              </div>
              <div className="text-text-secondary mt-2 flex items-center justify-end">
                <span className="text-xs">{formatTime(timelineItem.created_at)}</span>
              </div>
            </div>
          )}

          {/* Service message */}
          {timelineItem.item_type === 'service' && timelineItem.service_item && (
            <div
              className={`rounded-lg p-3 ${
                isMyMessage ? 'bg-primary text-white' : 'bg-surface border-border border'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`rounded-lg p-2 ${
                    isMyMessage ? 'bg-white/20' : 'bg-surface-elevated'
                  }`}
                >
                  <Info className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{timelineItem.service_item.name}</p>
                  <p className={`text-xs ${isMyMessage ? 'text-white/70' : 'text-text-secondary'}`}>
                    ${timelineItem.service_item.price}
                    {timelineItem.service_item.is_duration_based &&
                      ` • ${timelineItem.service_item.duration_minutes} minutes`}
                  </p>
                  {timelineItem.content && <p className="mt-1 text-sm">{timelineItem.content}</p>}
                </div>
              </div>
              <div
                className={`mt-2 flex items-center justify-end gap-1 ${
                  isMyMessage ? 'text-white/70' : 'text-text-secondary'
                }`}
              >
                <span className="text-xs">{formatTime(timelineItem.created_at)}</span>
                {getMessageStatusIcon(timelineItem)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-6 w-6" />
          </button>
          <Image
            src={selectedImage}
            alt="Preview"
            className="max-h-full max-w-full object-contain"
            width={800}
            height={600}
          />
        </div>
      )}
    </>
  );
};

export default MessageItem;
