import React, { useCallback, useState } from 'react';

import Image from 'next/image';

import {
  Check,
  CheckCheck,
  Circle,
  Download,
  FileText,
  Image as ImageIcon,
  Phone,
  Play,
  Video,
} from 'lucide-react';

import { useKeyopollsChatsApiMessagesDeleteTimelineItem } from '@/api/chat-messages/chat-messages';
import { TimelineItemSchema } from '@/api/schemas';
import { useProfileStore } from '@/stores/useProfileStore';

interface MessageItemProps {
  timelineItem: TimelineItemSchema;
  onRefresh: () => void;
  onAttachmentClick: (attachmentIndex: number, messageId: string) => void;
}

const MessageItem = ({ timelineItem, onRefresh, onAttachmentClick }: MessageItemProps) => {
  const { accessToken, profileData } = useProfileStore();
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

  // Get attachments from either timeline attachments or service item attachments
  const attachments = timelineItem.service_item
    ? timelineItem.service_item.attachments || []
    : timelineItem.attachments || [];

  const renderAttachments = () => {
    if (attachments.length === 0) return null;

    const attachmentCount = attachments.length;

    // Dynamic sizing based on attachment count
    const getAttachmentSize = () => {
      if (attachmentCount === 1) {
        return { width: 'w-64', height: 'h-48', maxWidth: 'max-w-sm' }; // Large single attachment
      } else if (attachmentCount === 2) {
        return { width: 'w-40', height: 'h-32', maxWidth: 'max-w-xs' }; // Medium for two
      } else {
        return { width: 'w-28', height: 'h-24', maxWidth: 'max-w-xs' }; // Smaller for 3+
      }
    };

    const { width, height, maxWidth } = getAttachmentSize();

    return (
      <div className="mt-3">
        <div
          className={`flex gap-2 overflow-x-auto pb-2 ${attachmentCount <= 2 ? 'justify-start' : ''}`}
        >
          {attachments.map((attachment, index) => {
            const isImage = attachment.attachment_type === 'image';
            const isVideo = attachment.attachment_type === 'video';
            const isDocument = attachment.attachment_type === 'document';

            return (
              <div
                key={attachment.id}
                className={`flex-shrink-0 cursor-pointer ${maxWidth}`}
                onClick={() => onAttachmentClick(index, timelineItem.id)}
              >
                {isImage && (
                  <div className={`relative ${width} ${height} group overflow-hidden rounded-lg`}>
                    <Image
                      src={attachment.file_url}
                      alt={attachment.file_name}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      width={attachmentCount === 1 ? 300 : attachmentCount === 2 ? 200 : 150}
                      height={attachmentCount === 1 ? 200 : attachmentCount === 2 ? 150 : 120}
                    />
                    {/* Image overlay with file name for better context */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <div className="absolute right-2 bottom-2 left-2">
                        <p className="truncate text-xs font-medium text-white">
                          {attachment.file_name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isVideo && (
                  <div
                    className={`relative ${width} ${height} group overflow-hidden rounded-lg bg-black`}
                  >
                    <video
                      src={attachment.file_url}
                      className="h-full w-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors duration-200 group-hover:bg-black/40">
                      <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                        <Play
                          className={`${attachmentCount === 1 ? 'h-8 w-8' : 'h-6 w-6'} text-white`}
                        />
                      </div>
                    </div>
                    {/* Video duration overlay */}
                    <div className="absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5">
                      <span className="text-xs font-medium text-white">Video</span>
                    </div>
                    {/* Video title overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                      <div className="absolute right-8 bottom-2 left-2">
                        <p className="truncate text-xs font-medium text-white">
                          {attachment.file_name}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {isDocument && (
                  <div
                    className={`bg-surface-elevated border-border border ${width} ${height} hover:bg-surface group flex flex-col items-center justify-center rounded-lg p-3 transition-colors duration-200`}
                  >
                    <FileText
                      className={`${attachmentCount === 1 ? 'h-10 w-10' : 'h-8 w-8'} text-text-secondary group-hover:text-text transition-colors duration-200`}
                    />
                    <span
                      className={`text-text-secondary group-hover:text-text mt-2 truncate ${attachmentCount === 1 ? 'text-sm' : 'text-xs'} font-medium transition-colors duration-200`}
                    >
                      {attachment.file_name.split('.').pop()?.toUpperCase()}
                    </span>
                    {attachmentCount === 1 && (
                      <span className="text-text-secondary mt-1 max-w-full truncate px-1 text-xs">
                        {attachment.file_name}
                      </span>
                    )}
                    {/* File size indicator */}
                    {attachment.file_size && (
                      <span className="text-text-secondary mt-1 text-xs">
                        {formatFileSize(attachment.file_size)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Attachment count indicator for multiple attachments */}
        {attachmentCount > 1 && (
          <div className="mt-1 flex justify-end">
            <span className="text-text-secondary text-xs">
              {attachmentCount} attachment{attachmentCount > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`mb-3 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
      onContextMenu={handleContextMenu}
    >
      <div className={`max-w-sm lg:max-w-lg xl:max-w-xl ${isMyMessage ? 'order-2' : 'order-1'}`}>
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
            {renderAttachments()}
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
              {attachments.length > 0 && attachments[0].file_url ? (
                <Image
                  src={attachments[0].file_url}
                  alt="Shared image"
                  className="h-auto w-full cursor-pointer transition-opacity duration-200 hover:opacity-95"
                  width={300}
                  height={200}
                  onClick={() => onAttachmentClick(0, timelineItem.id)}
                />
              ) : (
                <div className="bg-surface-elevated flex h-32 w-48 items-center justify-center">
                  <ImageIcon className="text-text-secondary h-8 w-8" />
                </div>
              )}
              <div
                className={`absolute right-2 bottom-2 flex items-center gap-1 rounded px-2 py-1 backdrop-blur-sm ${
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
            <div className="group relative">
              {attachments.length > 0 && attachments[0].file_url ? (
                <video
                  src={attachments[0].file_url}
                  className="h-auto w-full cursor-pointer"
                  preload="metadata"
                  onClick={() => onAttachmentClick(0, timelineItem.id)}
                />
              ) : (
                <div className="bg-surface-elevated flex h-32 w-48 items-center justify-center">
                  <Video className="text-text-secondary h-8 w-8" />
                </div>
              )}
              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="rounded-full bg-black/50 p-3 backdrop-blur-sm">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
              <div
                className={`absolute right-2 bottom-2 flex items-center gap-1 rounded px-2 py-1 backdrop-blur-sm ${
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
            className={`rounded-lg p-3 transition-shadow duration-200 hover:shadow-md ${
              isMyMessage ? 'bg-primary text-white' : 'bg-surface border-border border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`rounded-lg p-2 ${isMyMessage ? 'bg-white/20' : 'bg-surface-elevated'}`}
              >
                <FileText className="h-6 w-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {attachments.length > 0 ? attachments[0].file_name : 'Document'}
                </p>
                <p className={`text-xs ${isMyMessage ? 'text-white/70' : 'text-text-secondary'}`}>
                  {attachments.length > 0 && attachments[0].file_size
                    ? formatFileSize(attachments[0].file_size)
                    : 'Unknown size'}
                </p>
              </div>
              {attachments.length > 0 && attachments[0].file_url && (
                <a
                  href={attachments[0].file_url}
                  download={attachments[0].file_name}
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

        {/* Service message */}
        {timelineItem.item_type === 'service' && timelineItem.service_item && (
          <div
            className={`rounded-lg p-3 ${
              isMyMessage ? 'bg-primary text-white' : 'bg-surface border-border border'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{timelineItem.service_item.name}</p>
                <p className="mt-1 text-sm">{timelineItem.service_item.description}</p>
                {timelineItem.content && <p className="mt-1 text-sm">{timelineItem.content}</p>}
              </div>
            </div>
            {renderAttachments()}
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
  );
};

export default MessageItem;
