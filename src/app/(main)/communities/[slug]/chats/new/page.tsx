'use client';

import React, { useEffect } from 'react';

import { useParams, useRouter, useSearchParams } from 'next/navigation';

import { MessageCircle, Users, X } from 'lucide-react';

import { useKeyopollsChatsApiGetOrCreateChatEndpoint } from '@/api/chats/chats';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

const NewChatPage = () => {
  const { accessToken } = useProfileStore();
  const searchParams = useSearchParams();
  const { slug: communitySlug } = useParams<{ slug: string }>();
  const router = useRouter();

  const userId = searchParams.get('userId');
  const communityId = searchParams.get('communityId');

  const {
    mutate: createChat,
    isPending: isLoading,
    error,
  } = useKeyopollsChatsApiGetOrCreateChatEndpoint({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  // Create chat on component mount
  useEffect(() => {
    if (!userId || !communityId || !accessToken) {
      toast.error('Missing required information to create chat');
      router.back();
      return;
    }

    // Convert userId and communityId to numbers
    const userIdNum = parseInt(userId);
    const communityIdNum = parseInt(communityId);

    if (isNaN(userIdNum) || isNaN(communityIdNum)) {
      toast.error('Invalid user or community ID');
      router.back();
      return;
    }

    createChat(
      {
        data: {
          community_id: communityIdNum,
          mentor_id: userIdNum,
        },
      },
      {
        onSuccess: (response) => {
          const chatId = response.data.chat_id;
          // Redirect to the created chat
          router.replace(`/communities/${communitySlug}/chats/${chatId}`);
        },
        onError: (error) => {
          console.error('Failed to create chat:', error);
          toast.error(error.response?.data?.message || 'Failed to create chat. Please try again.');
          // Go back to chats list on error
          router.replace(`/communities/${communitySlug}/chats`);
        },
      }
    );
  }, [userId, communityId, accessToken, createChat, router, communitySlug]);

  // Show loading state while creating chat
  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="bg-surface-elevated mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <MessageCircle className="text-primary h-8 w-8" />
          </div>
          <div className="mb-4">
            <div className="border-primary mx-auto h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
          </div>
          <h3 className="text-text mb-2 text-lg font-semibold">Creating chat...</h3>
          <p className="text-text-secondary text-sm">Setting up your conversation</p>
        </div>
      </div>
    );
  }

  // Show error state if something went wrong
  if (error) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="bg-surface-elevated mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <X className="text-error h-8 w-8" />
          </div>
          <h3 className="text-text mb-2 text-lg font-semibold">Failed to create chat</h3>
          <p className="text-text-secondary mb-4 text-sm">
            There was an error starting your conversation. Please try again.
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="bg-surface border-border text-text hover:bg-surface-elevated rounded-md border px-4 py-2 text-sm font-medium transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => {
                // Retry creating chat
                if (userId && communityId) {
                  const userIdNum = parseInt(userId);
                  const communityIdNum = parseInt(communityId);

                  createChat({
                    data: {
                      community_id: communityIdNum,
                      mentor_id: userIdNum,
                    },
                  });
                }
              }}
              className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // This shouldn't render since we redirect immediately, but just in case
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="bg-surface-elevated mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
          <Users className="text-text-secondary h-8 w-8" />
        </div>
        <h3 className="text-text mb-2 text-lg font-semibold">Preparing chat...</h3>
        <p className="text-text-secondary text-sm">Please wait while we set up your conversation</p>
      </div>
    </div>
  );
};

export default NewChatPage;
