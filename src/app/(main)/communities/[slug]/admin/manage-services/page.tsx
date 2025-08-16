'use client';

import React, { useCallback, useMemo, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Clock,
  Edit,
  Eye,
  FileText,
  MessageCircle,
  Paperclip,
  Phone,
  Plus,
  Reply,
  Trash2,
  Upload,
  Video,
  Wifi,
} from 'lucide-react';

import {
  useKeyopollsChatsApiServicesDeleteService,
  useKeyopollsChatsApiServicesGetServices,
} from '@/api/default/default';
import { ServiceItemSchema, ServiceTypeEnum } from '@/api/schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

import ServiceAttachmentsViewer from './ServiceAttachmentsViewer';
import ServiceModal from './ServiceModal';

// Service type icons mapping
const SERVICE_ICONS = {
  dm: MessageCircle,
  live_chat: MessageCircle,
  audio_call: Phone,
  video_call: Video,
  custom: FileText,
  community_post: FileText, // Use FileText as a generic post/document icon
  group_chat: MessageCircle,
  group_audio_call: Phone,
  group_video_call: Video,
};

// Service type labels
const SERVICE_LABELS = {
  [ServiceTypeEnum.dm]: 'Direct Message',
  [ServiceTypeEnum.live_chat]: 'Live Chat',
  [ServiceTypeEnum.audio_call]: 'Audio Call',
  [ServiceTypeEnum.video_call]: 'Video Call',
  [ServiceTypeEnum.custom]: 'Custom Service',
  [ServiceTypeEnum.group_chat]: 'Group Chat',
  [ServiceTypeEnum.community_post]: 'Community Post',
  [ServiceTypeEnum.group_audio_call]: 'Group Audio Call',
  [ServiceTypeEnum.group_video_call]: 'Group Video Call',
};

const ManageServices = () => {
  const { accessToken, profileData } = useProfileStore();
  const { slug: communitySlug } = useParams<{ slug: string }>();
  const router = useRouter();

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItemSchema | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');

  // Helper function to determine service_type for API based on filter
  const getServiceTypeForAPI = useCallback((filter: string) => {
    if (filter === 'all') return undefined;
    if (filter === 'community_posts') return 'community_post';
    if (filter === 'custom_services') return 'custom';
    return filter;
  }, []);

  // API hooks
  const {
    data: servicesData,
    isLoading: isLoadingServices,
    error: servicesError,
    refetch: refetchServices,
  } = useKeyopollsChatsApiServicesGetServices(
    {
      community_slug: communitySlug,
      search: searchQuery || undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      creator_id: profileData?.id,
      service_type: getServiceTypeForAPI(serviceTypeFilter),
    },
    {
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      query: {
        enabled: !!communitySlug,
      },
    }
  );

  // Filter services on the frontend for specific subcategories
  const filteredServices = useMemo(() => {
    const allServices = servicesData?.data?.services || [];

    if (serviceTypeFilter === 'community_posts') {
      return allServices.filter((service) => service.service_type === 'community_post');
    }

    if (serviceTypeFilter === 'custom_services') {
      return allServices.filter((service) => service.service_type === 'custom');
    }

    return allServices;
  }, [servicesData, serviceTypeFilter]);

  const { mutate: deleteService, isPending: isDeletingService } =
    useKeyopollsChatsApiServicesDeleteService({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  const handleDeleteService = useCallback(
    (service: ServiceItemSchema) => {
      if (
        !confirm(`Are you sure you want to delete "${service.name}"? This action cannot be undone.`)
      ) {
        return;
      }

      deleteService(
        {
          serviceId: service.id,
        },
        {
          onSuccess: () => {
            toast.success('Service deleted successfully!');
            refetchServices();
          },
          onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to delete service');
          },
        }
      );
    },
    [deleteService, refetchServices]
  );

  const handleEditService = useCallback((service: ServiceItemSchema) => {
    setEditingService(service);
    setIsModalOpen(true);
  }, []);

  const handleCreateService = useCallback(() => {
    setEditingService(null);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingService(null);
  }, []);

  const handleServiceSaved = useCallback(() => {
    refetchServices();
    handleModalClose();
  }, [refetchServices, handleModalClose]);

  // Filtered services
  const services = useMemo(() => {
    return filteredServices;
  }, [filteredServices]);

  const getServiceIcon = useCallback((serviceType: ServiceTypeEnum) => {
    const IconComponent = SERVICE_ICONS[serviceType] || FileText;
    return <IconComponent className="h-4 w-4" />;
  }, []);

  // Check if service should show non-default status badge
  const shouldShowStatusBadge = useCallback((status: string) => {
    return status !== 'active';
  }, []);

  if (!communitySlug) {
    return (
      <div className="bg-background min-h-screen p-6">
        <div className="text-center">
          <h2 className="text-text mb-2 text-xl font-semibold">No Community Selected</h2>
          <p className="text-text-secondary">Please select a community to manage services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="mb-5">
            <button
              onClick={() => router.back()}
              className="text-text-muted hover:text-text flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1">
            <h1 className="text-text mb-1 text-2xl font-bold">Services</h1>
            <p className="text-text-secondary text-sm">Create and manage your community services</p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 space-y-3">
          {/* Search */}
          <div className="w-full">
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
          </div>

          {/* Filters and Create Button */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>

              {/* Service Type Filter */}
              <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="dm">Direct Message</SelectItem>
                  <SelectItem value="live_chat">1 vs 1 Live Chat</SelectItem>
                  <SelectItem value="audio_call">1 vs 1 Audio Call</SelectItem>
                  <SelectItem value="video_call">1 vs 1 Video Call</SelectItem>
                  <SelectItem value="community_posts">Community Posts</SelectItem>
                  <SelectItem value="custom_services">Custom Services</SelectItem>
                  {/* <SelectItem value="group_chat">Group Chat</SelectItem> */}
                  {/* <SelectItem value="group_audio_call">Group Audio Call</SelectItem> */}
                  {/* <SelectItem value="group_video_call">Group Video Call</SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateService}
              className="bg-primary text-background flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Create Service
            </button>
          </div>
        </div>

        {/* Services List */}
        {isLoadingServices ? (
          <div className="space-y-3">
            {/* Service Loading Skeletons */}
            {[...Array(3)].map((_, index) => (
              <div key={index} className="border-border-subtle -mx-4 rounded-lg border-b p-4 pb-4">
                {/* Service Header Skeleton */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {/* Icon Skeleton */}
                    <div className="h-10 w-10 flex-shrink-0 animate-pulse rounded-lg bg-gray-200"></div>
                    <div className="min-w-0 flex-1">
                      {/* Title and badges skeleton */}
                      <div className="mb-1 flex items-center gap-2">
                        <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200"></div>
                      </div>
                      {/* Metadata skeleton */}
                      <div className="flex items-center gap-4">
                        <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                        <div className="h-3 w-12 animate-pulse rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </div>
                  {/* Actions skeleton */}
                  <div className="flex items-center gap-1">
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                    <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
                  </div>
                </div>

                {/* Description skeleton */}
                <div className="mb-3 space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200"></div>
                </div>

                {/* Preview image skeleton */}
                <div className="mb-3 h-32 w-full animate-pulse rounded-lg bg-gray-200"></div>

                {/* Stats skeleton */}
                <div className="flex items-center gap-6">
                  <div className="h-3 w-20 animate-pulse rounded bg-gray-200"></div>
                  <div className="h-3 w-16 animate-pulse rounded bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : servicesError ? (
          <div className="py-8 text-center">
            <p className="text-error mb-3 text-sm">Failed to load services</p>
            <button
              onClick={() => refetchServices()}
              className="bg-primary text-background rounded-md px-4 py-2 text-sm font-medium"
            >
              Try Again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="py-12 text-center">
            <div className="bg-surface-elevated mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <MessageCircle className="text-text-muted h-6 w-6" />
            </div>
            <h3 className="text-text mb-2 font-medium">No services yet</h3>
            <p className="text-text-secondary mb-4 text-sm">
              Create your first service to start monetizing your expertise
            </p>
            <button
              onClick={handleCreateService}
              className="bg-primary text-background inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
            >
              <Plus className="h-4 w-4" />
              Create Your First Service
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="border-border-subtle hover:bg-surface-elevated/30 -mx-4 rounded-lg border-b p-4 pb-4 transition-colors"
              >
                {/* Service Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <div className="bg-primary/10 text-primary flex-shrink-0 rounded-lg p-2">
                      {getServiceIcon(service.service_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h3 className="text-text truncate text-sm font-medium">{service.name}</h3>
                        <div className="flex gap-1">
                          {service.is_broadcasted && (
                            <span className="bg-success/10 text-success flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium">
                              <Wifi className="h-3 w-3" />
                              Broadcasted
                            </span>
                          )}
                          {shouldShowStatusBadge(service.status) && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                service.status === 'inactive'
                                  ? 'bg-error/10 text-error'
                                  : 'bg-warning/10 text-warning'
                              }`}
                            >
                              {service.status}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-text-secondary flex items-center gap-4 text-xs">
                        <span>{SERVICE_LABELS[service.service_type]}</span>
                        <div className="flex items-center gap-1">
                          <span>{service.price === 0 ? 'Free' : `${service.price} credits`}</span>
                        </div>
                        {service.is_duration_based && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration_minutes}m</span>
                          </div>
                        )}
                        {(service.service_type === 'dm' || service.service_type === 'custom') &&
                          service.max_messages_a_day && (
                            <div className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              <span>{service.max_messages_a_day}/day</span>
                            </div>
                          )}
                        {(service.service_type === 'dm' || service.service_type === 'custom') &&
                          service.reply_time && (
                            <div className="flex items-center gap-1">
                              <Reply className="h-3 w-3" />
                              <span>{service.reply_time}d reply</span>
                            </div>
                          )}
                        {service.service_type === 'custom' && service.attachments_required && (
                          <div className="flex items-center gap-1">
                            <Upload className="h-3 w-3" />
                            <span>Files required</span>
                          </div>
                        )}
                        {service.attachments && service.attachments?.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            <span>{service.attachments.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditService(service)}
                      className="text-text-muted hover:text-text hover:bg-surface-elevated rounded-full p-2 transition-colors"
                      title="Edit service"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteService(service)}
                      disabled={isDeletingService}
                      className="text-text-muted hover:text-error hover:bg-error/10 rounded-full p-2 transition-colors disabled:opacity-50"
                      title="Delete service"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {service.description && (
                  <p className="text-text-secondary mb-3 line-clamp-2 text-sm leading-relaxed">
                    {service.description}
                  </p>
                )}

                {/* Preview Image */}
                {service.preview_image && (
                  <div className="mb-3">
                    <Image
                      src={service.preview_image}
                      alt={service.name}
                      className="border-border h-32 w-full rounded-lg border object-cover"
                      width={500}
                      height={128}
                    />
                  </div>
                )}

                {/* Service Attachments */}
                {service.attachments && service.attachments.length > 0 && (
                  <div className="mb-3">
                    <ServiceAttachmentsViewer
                      attachments={service.attachments}
                      maxHeight="150px"
                      className="text-xs"
                    />
                  </div>
                )}

                {/* Stats */}
                <div className="text-text-secondary flex items-center gap-6 text-xs">
                  {service.price === 0 ? (
                    <div className="flex items-center gap-1">
                      <span className="text-success font-medium">Free Service</span>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{service.total_purchases || 0} purchases</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-success font-medium">
                          ${service.total_revenue || 0}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Service Modal */}
        {isModalOpen && (
          <ServiceModal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            onSave={handleServiceSaved}
            editingService={editingService}
            communitySlug={communitySlug}
            accessToken={accessToken}
          />
        )}
      </div>
    </div>
  );
};

export default ManageServices;
