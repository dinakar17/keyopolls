'use client';

import React, { useMemo } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Calendar,
  FileText,
  Instagram,
  Linkedin,
  MessageCircle,
  Phone,
  Share2,
  Twitter,
  UserPlus,
  Video,
  Youtube,
} from 'lucide-react';

import { useKeyopollsChatsApiServicesGetServices } from '@/api/default/default';
import { useKeyopollsProfileApiGeneralGetProfileInfo } from '@/api/profile-general/profile-general';
import { ServiceItemSchema } from '@/api/schemas';
import toast from '@/components/ui/toast';
import { formatDate } from '@/utils';

interface SocialLinks {
  linkedin?: string;
  twitter?: string;
  substack?: string;
  instagram?: string;
  youtube?: string;
}

const PublicProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();

  // Fetch profile info
  const {
    data: profileInfo,
    isLoading: profileLoading,
    error: profileError,
  } = useKeyopollsProfileApiGeneralGetProfileInfo(slug, {
    query: {
      enabled: !!slug,
    },
  });

  const profile = profileInfo?.data;

  // Fetch user's services
  const { data: servicesData, isLoading: servicesLoading } =
    useKeyopollsChatsApiServicesGetServices(
      {
        creator_id: profile?.id,
        status: 'active',
        per_page: 50,
      },
      {
        query: {
          enabled: !!profile?.id,
        },
      }
    );

  const services = servicesData?.data?.services || [];

  // Organize services by type - only the specified types
  const organizedServices = useMemo(() => {
    type ServiceItem = (typeof services)[number];
    const result: {
      dm: ServiceItem | null;
      audio_call: ServiceItem | null;
      video_call: ServiceItem | null;
      live_chat: ServiceItem | null;
      custom: ServiceItem[];
    } = {
      dm: null,
      audio_call: null,
      video_call: null,
      live_chat: null,
      custom: [],
    };

    services.forEach((service) => {
      switch (service.service_type) {
        case 'dm':
        case 'audio_call':
        case 'video_call':
        case 'live_chat':
          result[service.service_type] = service;
          break;
        case 'custom':
          result.custom.push(service);
          break;
        // Ignore community_post, group_chat, group_audio_call, group_video_call
      }
    });

    return result;
  }, [services]);

  const hasMainServices =
    organizedServices.dm ||
    organizedServices.audio_call ||
    organizedServices.video_call ||
    organizedServices.live_chat;
  const hasCustomServices = organizedServices.custom.length > 0;

  // Get social link icon
  const getSocialIcon = (platform: keyof SocialLinks) => {
    const icons = {
      linkedin: <Linkedin size={18} />,
      twitter: <Twitter size={18} />,
      substack: <FileText size={18} />,
      instagram: <Instagram size={18} />,
      youtube: <Youtube size={18} />,
    };
    return icons[platform];
  };

  // Format social link URL
  const formatSocialUrl = (platform: keyof SocialLinks, value: string) => {
    if (!value) return '';
    const baseUrls = {
      linkedin: 'https://linkedin.com/in/',
      twitter: 'https://twitter.com/',
      substack: 'https://',
      instagram: 'https://instagram.com/',
      youtube: 'https://youtube.com/@',
    };
    if (value.startsWith('http')) return value;
    return baseUrls[platform] + value;
  };

  // Handle service actions
  const handleServiceAction = (service: ServiceItemSchema | null, actionType: string) => {
    // TODO: Implement service action logic
    console.log('Service action:', actionType, service);
  };

  const handleFollow = () => {
    toast.info('Follow feature coming soon!');
    // TODO: Implement follow logic
    console.log('Follow user');
  };

  // const handleSubscribe = () => {
  //   // TODO: Implement subscribe logic (coming soon)
  //   console.log('Subscribe to user - Coming soon');
  // };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile?.display_name || profile?.username}'s Profile`,
          text:
            profile?.headline ||
            `Check out ${profile?.display_name || profile?.username}'s profile`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  if (profileLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-md">
          <div className="animate-pulse">
            <div className="mb-2 h-16 bg-green-600"></div>
            <div className="bg-white">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <div className="mb-4 h-6 rounded bg-gray-200"></div>
                <div className="mb-2 h-4 rounded bg-gray-200"></div>
                <div className="h-4 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold text-gray-900">Profile not found</h2>
          <p className="text-gray-600">The profile you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const socialLinks: SocialLinks = {
    linkedin: profile.linkedin ?? undefined,
    twitter: profile.twitter ?? undefined,
    substack: profile.substack ?? undefined,
    instagram: profile.instagram ?? undefined,
    youtube: profile.youtube ?? undefined,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md">
        {/* WhatsApp-style Header */}
        <div className="flex items-center gap-4 bg-green-600 px-4 py-4 text-white shadow-sm">
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 transition-colors hover:bg-white/10"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-medium">{profile.display_name || profile.username}</h1>
            <p className="text-sm opacity-90">@{profile.username}</p>
          </div>
          <button
            onClick={handleShare}
            className="rounded-full p-2 transition-colors hover:bg-white/10"
          >
            <Share2 size={20} />
          </button>
        </div>

        {/* Profile Card */}
        <div className="mx-2 mt-2 rounded-lg bg-white shadow-sm">
          {/* Banner */}
          <div className="relative h-40 overflow-hidden rounded-t-lg">
            {profile.banner ? (
              <Image
                src={profile.banner}
                alt="Banner"
                className="h-full w-full object-cover"
                width={400}
                height={160}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-green-400 to-blue-500"></div>
            )}
          </div>

          {/* Profile Info */}
          <div className="relative px-4 pb-6">
            {/* Avatar */}
            <div className="absolute -top-24 left-4">
              <div className="h-24 w-24 rounded-full border-4 border-white bg-white">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.display_name}
                    className="h-full w-full rounded-full object-cover"
                    width={96}
                    height={96}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-2xl font-bold text-white">
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="mt-16">
              <div className="mb-3">
                <h2 className="text-xl font-bold text-gray-900">
                  {profile.display_name || profile.username}
                </h2>
                <p className="text-gray-600">@{profile.username}</p>
              </div>

              {profile.headline && (
                <div className="mb-3">
                  <p className="font-medium text-gray-800">{profile.headline}</p>
                </div>
              )}

              {profile.about && (
                <div className="mb-3">
                  <p className="text-sm leading-relaxed text-gray-700">{profile.about}</p>
                </div>
              )}

              {/* Member since */}
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                <Calendar size={14} />
                <span>Member since {formatDate(profile.created_at)}</span>
              </div>

              {/* Social Links */}
              {Object.entries(socialLinks).some(([, value]) => value) && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(socialLinks).map(([platform, value]) => {
                      if (!value) return null;
                      return (
                        <a
                          key={platform}
                          href={formatSocialUrl(platform as keyof SocialLinks, value)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 rounded-full border border-green-200 px-3 py-1.5 text-green-600 transition-colors hover:bg-green-50"
                        >
                          {getSocialIcon(platform as keyof SocialLinks)}
                          <span className="text-sm font-medium capitalize">{platform}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Follow, Subscribe and Share Row - Only show when hasMainServices */}
        {hasMainServices && (
          <div className="mx-2 mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={handleFollow}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 py-3 text-white transition-colors hover:bg-green-700"
            >
              <UserPlus size={18} />
              <span className="font-medium">Follow</span>
            </button>
            {/* <button
              onClick={handleSubscribe}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-white transition-colors hover:bg-blue-700"
            >
              <Bell size={18} />
              <span className="font-medium">Subscribe</span>
            </button> */}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 rounded-lg bg-gray-100 py-3 text-gray-700 transition-colors hover:bg-gray-200"
            >
              <Share2 size={18} />
              <span className="font-medium">Share</span>
            </button>
          </div>
        )}

        {/* Main Services Row (DM, Audio, Video, Live Chat) */}
        {hasMainServices && (
          <div className="mx-2 mt-2 rounded-lg bg-white p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {/* DM */}
              {organizedServices.dm && (
                <button
                  onClick={() => handleServiceAction(organizedServices.dm, 'dm')}
                  className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <MessageCircle size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Message</span>
                  <span className="text-xs font-medium text-green-600">
                    {organizedServices.dm.price === 0
                      ? 'Free'
                      : `${organizedServices.dm.price} credits`}
                  </span>
                </button>
              )}

              {/* Audio Call */}
              {organizedServices.audio_call && (
                <button
                  onClick={() => handleServiceAction(organizedServices.audio_call, 'audio')}
                  className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <Phone size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Audio Call</span>
                  <span className="text-xs font-medium text-green-600">
                    {organizedServices.audio_call.price === 0
                      ? 'Free'
                      : `${organizedServices.audio_call.price} credits`}
                  </span>
                </button>
              )}

              {/* Video Call */}
              {organizedServices.video_call && (
                <button
                  onClick={() => handleServiceAction(organizedServices.video_call, 'video')}
                  className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                    <Video size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Video Call</span>
                  <span className="text-xs font-medium text-green-600">
                    {organizedServices.video_call.price === 0
                      ? 'Free'
                      : `${organizedServices.video_call.price} credits`}
                  </span>
                </button>
              )}

              {/* Live Chat */}
              {organizedServices.live_chat && (
                <button
                  onClick={() => handleServiceAction(organizedServices.live_chat, 'live_chat')}
                  className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50"
                >
                  <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                    <MessageCircle size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-900">Live Chat</span>
                  <span className="text-xs font-medium text-green-600">
                    {organizedServices.live_chat.price === 0
                      ? 'Free'
                      : `${organizedServices.live_chat.price} credits`}
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Custom Services List */}
        {hasCustomServices && (
          <div className="mx-2 mt-2 rounded-lg bg-white p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-gray-900">Custom Services</h3>
            <div className="space-y-3">
              {organizedServices.custom.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceAction(service, 'custom')}
                  className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 rounded-full bg-gray-100 p-2 text-gray-600">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{service.name}</h4>
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-600">
                        {service.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3 text-xs">
                        <span className="font-medium text-green-600">
                          {service.price === 0 ? 'Free' : `${service.price} credits`}
                        </span>
                        {service.max_messages_a_day && (
                          <span className="text-gray-500">
                            Max {service.max_messages_a_day}/day
                          </span>
                        )}
                        {service.reply_time && (
                          <span className="text-gray-500">{service.reply_time}d delivery</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No Services Message */}
        {!hasMainServices && !hasCustomServices && (
          <div className="mx-2 mt-2 rounded-lg bg-white p-6 text-center shadow-sm">
            <div className="mb-2 text-gray-400">
              <MessageCircle size={32} className="mx-auto" />
            </div>
            <p className="text-sm text-gray-600">No services available yet</p>
          </div>
        )}

        {/* Bottom spacing */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
