'use client';

import React, { useCallback, useMemo, useState } from 'react';

import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import {
  ArrowLeft,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileText,
  MessageCircle,
  Paperclip,
  Phone,
  Plus,
  Radio,
  Trash2,
  Video,
} from 'lucide-react';

import {
  useKeyopollsChatsApiServicesBroadcastService,
  useKeyopollsChatsApiServicesDeleteService,
  useKeyopollsChatsApiServicesGetServices,
} from '@/api/default/default';
import { ServiceItemSchema, ServiceTypeEnum } from '@/api/schemas';
import { toast } from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

import ServiceModal from './ServiceModal';

// Service type icons mapping
const SERVICE_ICONS = {
  dm: MessageCircle,
  live_chat: MessageCircle,
  audio_call: Phone,
  video_call: Video,
  custom: FileText,
  group_chat: MessageCircle,
  group_audio_call: Phone,
  group_video_call: Video,
};

// Service type labels
export const SERVICE_LABELS = {
  [ServiceTypeEnum.dm]: 'Direct Message',
  [ServiceTypeEnum.live_chat]: 'Live Chat',
  [ServiceTypeEnum.audio_call]: 'Audio Call',
  [ServiceTypeEnum.video_call]: 'Video Call',
  [ServiceTypeEnum.custom]: 'Custom Service',
  [ServiceTypeEnum.group_chat]: 'Group Chat',
  [ServiceTypeEnum.group_audio_call]: 'Group Audio Call',
  [ServiceTypeEnum.group_video_call]: 'Group Video Call',
};

const ManageServices = () => {
  const { accessToken } = useProfileStore();
  const { slug: communitySlug } = useParams<{ slug: string }>();
  const router = useRouter();

  // State management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItemSchema | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [broadcastFilter, setBroadcastFilter] = useState('all');

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
      is_broadcasted: broadcastFilter !== 'all' ? broadcastFilter === 'broadcasted' : undefined,
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

  const { mutate: broadcastService, isPending: isBroadcasting } =
    useKeyopollsChatsApiServicesBroadcastService({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  const { mutate: deleteService, isPending: isDeletingService } =
    useKeyopollsChatsApiServicesDeleteService({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  // Broadcast/Unbroadcast service
  const handleBroadcastToggle = useCallback(
    (service: ServiceItemSchema) => {
      const action = service.is_broadcasted ? 'unbroadcast' : 'broadcast';
      const actionText = service.is_broadcasted ? 'unbroadcast' : 'broadcast';

      if (!confirm(`Are you sure you want to ${actionText} "${service.name}"?`)) {
        return;
      }

      broadcastService(
        {
          serviceId: service.id,
          action: action,
        },
        {
          onSuccess: () => {
            toast.success(`Service ${actionText}ed successfully!`);
            refetchServices();
          },
          onError: (error) => {
            toast.error(error.response?.data?.message || `Failed to ${actionText} service`);
          },
        }
      );
    },
    [broadcastService, refetchServices]
  );

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
    return servicesData?.data?.services || [];
  }, [servicesData]);

  const getServiceIcon = useCallback((serviceType: ServiceTypeEnum) => {
    const IconComponent = SERVICE_ICONS[serviceType] || FileText;
    return <IconComponent className="h-4 w-4" />;
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
        <div className="mb-6">
          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="text-text-muted hover:text-text flex items-center gap-2 text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
          <h1 className="text-text mb-1 text-2xl font-bold">Services</h1>
          <p className="text-text-secondary text-sm">Create and manage your community services</p>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            {/* Search */}
            <div className="max-w-xs flex-1">
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
              />
            </div>

            {/* Filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border-border focus:border-primary bg-background text-text focus:ring-primary/20 rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>

            <select
              value={broadcastFilter}
              onChange={(e) => setBroadcastFilter(e.target.value)}
              className="border-border focus:border-primary bg-background text-text focus:ring-primary/20 rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="all">All</option>
              <option value="broadcasted">Live</option>
              <option value="not_broadcasted">Draft</option>
            </select>
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

        {/* Services List */}
        {isLoadingServices ? (
          <div className="py-8 text-center">
            <div className="border-primary mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent"></div>
            <p className="text-text-secondary text-sm">Loading services...</p>
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
                            <span className="bg-success/10 text-success rounded-full px-2 py-0.5 text-xs font-medium">
                              Live
                            </span>
                          )}
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              service.status === 'active'
                                ? 'bg-success/10 text-success'
                                : service.status === 'inactive'
                                  ? 'bg-error/10 text-error'
                                  : 'bg-warning/10 text-warning'
                            }`}
                          >
                            {service.status}
                          </span>
                        </div>
                      </div>
                      <div className="text-text-secondary flex items-center gap-4 text-xs">
                        <span>{SERVICE_LABELS[service.service_type]}</span>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{service.price}</span>
                        </div>
                        {service.is_duration_based && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{service.duration_minutes}m</span>
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
                      onClick={() => handleBroadcastToggle(service)}
                      disabled={isBroadcasting}
                      className={`rounded-full p-2 transition-colors disabled:opacity-50 ${
                        service.is_broadcasted
                          ? 'text-warning hover:text-warning hover:bg-warning/10'
                          : 'text-text-muted hover:text-success hover:bg-success/10'
                      }`}
                      title={service.is_broadcasted ? 'Unbroadcast service' : 'Broadcast service'}
                    >
                      <Radio className="h-4 w-4" />
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

                {/* Stats */}
                <div className="text-text-secondary flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{service.total_purchases || 0} purchases</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-success font-medium">${service.total_revenue || 0}</span>
                  </div>
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
