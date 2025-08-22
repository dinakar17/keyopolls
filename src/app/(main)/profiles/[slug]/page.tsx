'use client';

import React, { useMemo } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Calendar,
  Edit3,
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
import { useProfileStore } from '@/stores/useProfileStore';
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
  const { profileData } = useProfileStore();

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

  // Check if current user is viewing their own profile
  const isOwnProfile = profileData?.id && profile?.id && profileData.id === profile.id;

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

  // Organize services by type
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
      linkedin: <Linkedin size={16} />,
      twitter: <Twitter size={16} />,
      substack: <FileText size={16} />,
      instagram: <Instagram size={16} />,
      youtube: <Youtube size={16} />,
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
    console.log('Service action:', actionType, service);
  };

  const handleFollow = () => {
    toast.info('Follow feature coming soon!');
    console.log('Follow user');
  };

  const handleEditProfile = () => {
    router.push('/account/edit-profile');
  };

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
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (profileLoading || servicesLoading) {
    return (
      <div className="bg-background min-h-screen">
        <div className="mx-auto max-w-md">
          <div className="animate-pulse">
            <div className="bg-primary mb-2 h-14"></div>
            <div className="bg-surface">
              <div className="bg-surface-elevated h-40"></div>
              <div className="p-6">
                <div className="bg-surface-elevated mb-4 h-6 rounded"></div>
                <div className="bg-surface-elevated mb-2 h-4 rounded"></div>
                <div className="bg-surface-elevated h-4 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (profileError || !profile) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-text mb-2 text-xl font-bold">Profile not found</h2>
          <p className="text-text-secondary">The profile you're looking for doesn't exist.</p>
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
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-md">
        {/* Header */}
        <div className="bg-primary text-background flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="hover:bg-background/10 rounded-full p-2 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-medium">
              {profile.display_name || profile.username}
            </h1>
            <p className="truncate text-sm opacity-90">@{profile.username}</p>
          </div>
          <button
            onClick={handleShare}
            className="hover:bg-background/10 rounded-full p-2 transition-colors"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="p-4">
          {/* Banner and Avatar */}
          <div className="relative mb-6">
            <div className="relative h-32 overflow-hidden rounded-xl">
              {profile.banner ? (
                <Image
                  src={profile.banner}
                  alt="Banner"
                  className="h-full w-full object-cover"
                  width={400}
                  height={128}
                />
              ) : (
                <div className="from-primary to-secondary h-full w-full bg-gradient-to-br"></div>
              )}
            </div>

            {/* Avatar */}
            <div className="absolute -bottom-8 left-4">
              <div className="border-background bg-surface h-16 w-16 rounded-full border-4">
                {profile.avatar ? (
                  <Image
                    src={profile.avatar}
                    alt={profile.display_name}
                    className="h-full w-full rounded-full object-cover"
                    width={64}
                    height={64}
                  />
                ) : (
                  <div className="bg-primary text-background flex h-full w-full items-center justify-center rounded-full text-lg font-bold">
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="mt-4">
            <div className="mb-3">
              <h2 className="text-text text-xl font-bold">
                {profile.display_name || profile.username}
              </h2>
              <p className="text-text-secondary">@{profile.username}</p>
            </div>

            {profile.headline && (
              <div className="mb-3">
                <p className="text-text font-medium">{profile.headline}</p>
              </div>
            )}

            {profile.about && (
              <div className="mb-3">
                <p className="text-text-secondary text-sm leading-relaxed">{profile.about}</p>
              </div>
            )}

            {/* Member since */}
            <div className="text-text-muted mb-4 flex items-center gap-2 text-sm">
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
                        className="border-border text-primary hover:bg-surface-elevated flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors"
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

          {/* Action Buttons */}
          {!isOwnProfile && hasMainServices && (
            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                onClick={handleFollow}
                className="bg-primary text-background flex items-center justify-center gap-2 rounded-lg py-3 transition-colors hover:opacity-90"
              >
                <UserPlus size={16} />
                <span className="font-medium">Follow</span>
              </button>
              <button
                onClick={handleShare}
                className="border-border text-text hover:bg-surface-elevated flex items-center justify-center gap-2 rounded-lg border py-3 transition-colors"
              >
                <Share2 size={16} />
                <span className="font-medium">Share</span>
              </button>
            </div>
          )}

          {/* Edit Profile Button for Own Profile */}
          {isOwnProfile && (
            <div className="mb-4">
              <button
                onClick={handleEditProfile}
                className="border-border text-text hover:bg-surface-elevated flex w-full items-center justify-center gap-2 rounded-lg border py-3 transition-colors"
              >
                <Edit3 size={16} />
                <span className="font-medium">Edit Profile</span>
              </button>
            </div>
          )}

          {/* Main Services */}
          {hasMainServices && (
            <div className="mb-4">
              <h3 className="text-text mb-3 text-lg font-semibold">Services</h3>
              <div className="grid grid-cols-2 gap-3">
                {organizedServices.dm && (
                  <button
                    onClick={() => handleServiceAction(organizedServices.dm, 'dm')}
                    className="border-border hover:bg-surface-elevated flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors"
                  >
                    <div className="bg-primary/10 text-primary rounded-full p-2">
                      <MessageCircle size={18} />
                    </div>
                    <span className="text-text text-sm font-medium">Message</span>
                    <span className="text-success text-xs font-medium">
                      {organizedServices.dm.price === 0
                        ? 'Free'
                        : `${organizedServices.dm.price} credits`}
                    </span>
                  </button>
                )}

                {organizedServices.audio_call && (
                  <button
                    onClick={() => handleServiceAction(organizedServices.audio_call, 'audio')}
                    className="border-border hover:bg-surface-elevated flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors"
                  >
                    <div className="bg-success/10 text-success rounded-full p-2">
                      <Phone size={18} />
                    </div>
                    <span className="text-text text-sm font-medium">Audio Call</span>
                    <span className="text-success text-xs font-medium">
                      {organizedServices.audio_call.price === 0
                        ? 'Free'
                        : `${organizedServices.audio_call.price} credits`}
                    </span>
                  </button>
                )}

                {organizedServices.video_call && (
                  <button
                    onClick={() => handleServiceAction(organizedServices.video_call, 'video')}
                    className="border-border hover:bg-surface-elevated flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors"
                  >
                    <div className="bg-accent/10 text-accent rounded-full p-2">
                      <Video size={18} />
                    </div>
                    <span className="text-text text-sm font-medium">Video Call</span>
                    <span className="text-success text-xs font-medium">
                      {organizedServices.video_call.price === 0
                        ? 'Free'
                        : `${organizedServices.video_call.price} credits`}
                    </span>
                  </button>
                )}

                {organizedServices.live_chat && (
                  <button
                    onClick={() => handleServiceAction(organizedServices.live_chat, 'live_chat')}
                    className="border-border hover:bg-surface-elevated flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors"
                  >
                    <div className="bg-warning/10 text-warning rounded-full p-2">
                      <MessageCircle size={18} />
                    </div>
                    <span className="text-text text-sm font-medium">Live Chat</span>
                    <span className="text-success text-xs font-medium">
                      {organizedServices.live_chat.price === 0
                        ? 'Free'
                        : `${organizedServices.live_chat.price} credits`}
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Custom Services */}
          {hasCustomServices && (
            <div className="mb-4">
              <h3 className="text-text mb-3 text-lg font-semibold">Custom Services</h3>
              <div className="space-y-3">
                {organizedServices.custom.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceAction(service, 'custom')}
                    className="border-border hover:bg-surface-elevated w-full rounded-lg border p-4 text-left transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="bg-surface-elevated text-text-muted flex-shrink-0 rounded-full p-2">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-text text-sm font-medium">{service.name}</h4>
                        <p className="text-text-secondary mt-1 line-clamp-2 text-xs leading-relaxed">
                          {service.description}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs">
                          <span className="text-success font-medium">
                            {service.price === 0 ? 'Free' : `${service.price} credits`}
                          </span>
                          {service.max_messages_a_day && (
                            <span className="text-text-muted">
                              Max {service.max_messages_a_day}/day
                            </span>
                          )}
                          {service.reply_time && (
                            <span className="text-text-muted">{service.reply_time}d delivery</span>
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
            <div className="border-border rounded-lg border p-6 text-center">
              <div className="text-text-muted mb-2">
                <MessageCircle size={28} className="mx-auto" />
              </div>
              <p className="text-text-secondary text-sm">No services available yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;
