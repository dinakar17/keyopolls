'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { Image as ImageIcon, Info, Paperclip, Phone, Play, Upload, X } from 'lucide-react';

import {
  useKeyopollsChatsApiServicesCreateService,
  useKeyopollsChatsApiServicesUpdateService,
} from '@/api/default/default';
import { ServiceAttachmentSchema, ServiceItemSchema, ServiceTypeEnum } from '@/api/schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/toast';

const SERVICE_LABELS = {
  [ServiceTypeEnum.dm]: 'Direct Message',
  [ServiceTypeEnum.custom]: 'Custom Service',
  [ServiceTypeEnum.live_chat]: '1 vs 1 Live Chat',
  [ServiceTypeEnum.audio_call]: '1 vs 1 Audio Call',
  [ServiceTypeEnum.video_call]: '1 vs 1 Video Call',
  [ServiceTypeEnum.community_post]: 'Community Post',
  // [ServiceTypeEnum.group_chat]: 'Group Chat',
  // [ServiceTypeEnum.group_audio_call]: 'Group Audio Call',
  // [ServiceTypeEnum.group_video_call]: 'Group Video Call',
};

interface ServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingService?: ServiceItemSchema | null;
  communitySlug: string;
  accessToken: string | undefined;
}

const ServiceModal = ({
  isOpen,
  onClose,
  onSave,
  editingService,
  communitySlug,
  accessToken,
}: ServiceModalProps) => {
  // Form state
  const [formData, setFormData] = useState({
    service_type: 'dm',
    name: '',
    description: '',
    price: '',
    duration_minutes: 10,
    is_duration_based: false,
    status: 'active',
    max_messages_a_day: 10,
    reply_time: 1,
    attachments_required: true, // Default true for custom services
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<ServiceAttachmentSchema[]>([]);
  const [previewImage, setPreviewImage] = useState<File | null>(null);

  // API hooks
  const { mutate: createService, isPending: isCreatingService } =
    useKeyopollsChatsApiServicesCreateService({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  const { mutate: updateService, isPending: isUpdatingService } =
    useKeyopollsChatsApiServicesUpdateService({
      request: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });

  // Check if service will be auto-broadcasted
  const willBeBroadcasted = useCallback((serviceType: string) => {
    const broadcastableTypes = [
      'group_chat',
      'group_audio_call',
      'group_video_call',
      'community_post',
    ];
    return broadcastableTypes.includes(serviceType);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      service_type: 'dm',
      name: '',
      description: '',
      price: '',
      duration_minutes: 10,
      is_duration_based: false,
      status: 'active',
      max_messages_a_day: 10,
      reply_time: 1,
      attachments_required: true,
    });
    setSelectedFiles([]);
    setExistingAttachments([]);
    setPreviewImage(null);
  }, []);

  // Initialize form data when editing
  useEffect(() => {
    if (editingService) {
      setFormData({
        service_type: editingService.service_type,
        name: editingService.name,
        description: editingService.description,
        price: editingService.price.toString(),
        duration_minutes: editingService.duration_minutes,
        is_duration_based: editingService.is_duration_based,
        status: editingService.status,
        max_messages_a_day: editingService.max_messages_a_day || 10,
        reply_time: editingService.reply_time || 1,
        attachments_required:
          editingService.attachments_required ||
          (editingService.service_type === 'custom' ? true : false),
      });

      // Load existing attachments
      setExistingAttachments(editingService.attachments || []);
    } else {
      resetForm();
    }
  }, [editingService, resetForm]);

  // Update attachments_required when service type changes
  useEffect(() => {
    if (formData.service_type === 'custom') {
      setFormData((prev) => ({ ...prev, attachments_required: true }));
    } else if (formData.service_type === 'community_post') {
      setFormData((prev) => ({ ...prev, attachments_required: false }));
    }
  }, [formData.service_type]);

  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: string | number | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files || []);

      if (files.length === 0) return;

      // Check if adding these files would exceed the limit (including existing attachments)
      const totalAttachments = existingAttachments.length + selectedFiles.length + files.length;
      if (totalAttachments > 10) {
        toast.error(
          `Cannot add ${files.length} files. Maximum 10 files allowed total (currently have ${existingAttachments.length + selectedFiles.length})`
        );
        return;
      }

      const invalidFiles = files.filter((file) => file.size > 50 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast.error('Some files are too large. Maximum size is 50MB per file');
        return;
      }

      // Add new files to existing ones
      setSelectedFiles((prev) => [...prev, ...files]);

      // Clear the input so the same file can be selected again if needed
      event.target.value = '';
    },
    [selectedFiles.length, existingAttachments.length]
  );

  const handlePreviewImageSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Preview image must be smaller than 10MB');
      return;
    }

    setPreviewImage(file);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // CRUD operations
  const handleCreateService = useCallback(() => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in name and description');
      return;
    }

    // If price is empty or 0, treat as free service (0.00)
    const servicePrice =
      formData.price === '' || parseFloat(formData.price) <= 0 ? 0 : parseFloat(formData.price);

    const serviceData = {
      community_slug: communitySlug,
      service_type: formData.service_type,
      name: formData.name,
      description: formData.description,
      price: servicePrice,
      duration_minutes: formData.duration_minutes,
      is_duration_based: formData.is_duration_based,
      status: formData.status,
      ...(formData.service_type === 'dm' && {
        max_messages_a_day: formData.max_messages_a_day,
        reply_time: formData.reply_time,
      }),
      ...(formData.service_type === 'custom' && {
        attachments_required: formData.attachments_required,
        max_messages_a_day: formData.max_messages_a_day,
        reply_time: formData.reply_time,
      }),
    };

    createService(
      {
        data: {
          data: serviceData,
          attachments: selectedFiles.length > 0 ? selectedFiles : undefined,
          preview_image: previewImage || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Service created successfully!');
          onSave();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to create service');
        },
      }
    );
  }, [formData, selectedFiles, previewImage, communitySlug, createService, onSave]);

  const handleUpdateService = useCallback(() => {
    if (!editingService) return;

    // If price is empty or 0, treat as free service (0.00)
    const servicePrice =
      formData.price === '' || parseFloat(formData.price) <= 0 ? 0 : parseFloat(formData.price);

    const updateData = {
      name: formData.name,
      description: formData.description,
      price: servicePrice,
      duration_minutes: formData.duration_minutes,
      is_duration_based: formData.is_duration_based,
      status: formData.status,
      ...(formData.service_type === 'dm' && {
        max_messages_a_day: formData.max_messages_a_day,
        reply_time: formData.reply_time,
      }),
      ...(formData.service_type === 'custom' && {
        attachments_required: formData.attachments_required,
        max_messages_a_day: formData.max_messages_a_day,
        reply_time: formData.reply_time,
      }),
    };

    updateService(
      {
        serviceId: editingService.id,
        data: {
          data: updateData,
          attachments: selectedFiles.length > 0 ? selectedFiles : undefined,
          preview_image: previewImage || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success('Service updated successfully!');
          onSave();
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to update service');
        },
      }
    );
  }, [editingService, formData, selectedFiles, previewImage, updateService, onSave]);

  const removeExistingAttachment = useCallback((attachmentId: string) => {
    setExistingAttachments((prev) => prev.filter((att) => att.id !== attachmentId));
  }, []);

  const getAttachmentIcon = useCallback((attachmentType: string) => {
    switch (attachmentType) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />;
      case 'video':
        return <Play className="h-4 w-4" />;
      case 'audio':
        return <Phone className="h-4 w-4" />;
      default:
        return <Paperclip className="h-4 w-4" />;
    }
  }, []);

  const renderAttachmentPreview = useCallback(
    (file: File, index: number) => {
      const fileType = file.type.split('/')[0];

      return (
        <div key={index} className="bg-surface-elevated flex items-center gap-2 rounded-md p-2">
          {/* Attachment preview */}
          <div className="flex-shrink-0">
            {fileType === 'image' ? (
              <div className="relative">
                <Image
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="h-8 w-8 rounded object-cover"
                  width={32}
                  height={32}
                />
              </div>
            ) : fileType === 'video' ? (
              <div className="relative flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                <Play className="h-3 w-3 text-gray-600" />
              </div>
            ) : (
              <div className="text-primary">{getAttachmentIcon(fileType)}</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-text truncate text-xs">{file.name}</p>
            <p className="text-text-muted text-xs">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
          </div>

          <button
            onClick={() => {
              setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
            }}
            className="text-text-muted hover:text-error transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    },
    [getAttachmentIcon]
  );

  const renderExistingAttachmentPreview = useCallback(
    (attachment: ServiceAttachmentSchema) => {
      return (
        <div
          key={attachment.id}
          className="bg-surface-elevated flex items-center gap-2 rounded-md p-2"
        >
          {/* Existing attachment preview */}
          <div className="flex-shrink-0">
            {attachment.attachment_type === 'image' ? (
              <div className="relative">
                <Image
                  src={attachment.file_url}
                  alt={attachment.file_name}
                  className="h-8 w-8 rounded object-cover"
                  width={32}
                  height={32}
                />
              </div>
            ) : attachment.attachment_type === 'video' ? (
              <div className="relative flex h-8 w-8 items-center justify-center rounded bg-gray-100">
                <Play className="h-3 w-3 text-gray-600" />
              </div>
            ) : (
              <div className="text-primary">{getAttachmentIcon(attachment.attachment_type)}</div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-text truncate text-xs">{attachment.file_name}</p>
            <p className="text-text-muted text-xs">
              {(attachment.file_size / 1024 / 1024).toFixed(1)} MB
            </p>
          </div>

          <button
            onClick={() => removeExistingAttachment(attachment.id)}
            className="text-text-muted hover:text-error transition-colors"
            title="Remove attachment"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      );
    },
    [getAttachmentIcon, removeExistingAttachment]
  );

  if (!isOpen) return null;

  const isBroadcastable = willBeBroadcasted(formData.service_type);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background border-border max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg border">
        {/* Modal Header */}
        <div className="border-border flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-text text-lg font-semibold">
            {editingService ? 'Edit Service' : 'Create Service'}
          </h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text rounded-full p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="space-y-4 p-4">
          {/* Service Type */}
          <div>
            <label className="text-text mb-1 block text-sm font-medium">Service Type</label>
            <Select
              value={formData.service_type}
              onValueChange={(value) => handleInputChange('service_type', value)}
              disabled={!!editingService}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Broadcast Information */}
          {isBroadcastable && (
            <div className="bg-primary/5 border-primary/20 rounded-md border p-3">
              <div className="flex items-start gap-2">
                <Info className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
                <div>
                  <p className="text-primary text-sm font-medium">
                    This service will be broadcasted
                  </p>
                  <p className="text-primary/80 mt-1 text-xs">
                    This service type will automatically be made available to all community members
                    once created.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Service Name */}
          <div>
            <label className="text-text mb-1 block text-sm font-medium">Service Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter service name"
              className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-text mb-1 block text-sm font-medium">Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what this service provides"
              rows={3}
              className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full resize-none rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
          </div>

          {/* Price */}
          <div>
            <label className="text-text mb-1 block text-sm font-medium">Price (Credits)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.00 (Free)"
              className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
            <p className="text-text-muted mt-1 text-xs">
              Leave empty or set to 0 for free services
            </p>
          </div>

          {/* Custom Service Specific Fields */}
          {formData.service_type === 'custom' && (
            <div className="border-border space-y-4 border-t pt-4">
              <h3 className="text-text text-sm font-medium">Custom Service Settings</h3>

              {/* Attachments Required - Always checked and disabled for custom services */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="attachments_required"
                  checked={true}
                  disabled={true}
                  className="border-border text-primary focus:ring-primary/20 h-4 w-4 rounded opacity-50"
                />
                <label htmlFor="attachments_required" className="text-text text-sm">
                  Require file attachments from users
                </label>
              </div>
              <p className="text-text-muted ml-6 text-xs">
                Custom services always require file attachments (PDF, images, videos, etc.) from
                users when purchasing this service.
              </p>

              {/* Max Messages per Day */}
              <div>
                <label className="text-text mb-1 block text-sm font-medium">
                  Max Messages per Day
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_messages_a_day}
                  onChange={(e) =>
                    handleInputChange('max_messages_a_day', parseInt(e.target.value) || 1)
                  }
                  placeholder="10"
                  className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                />
                <p className="text-text-muted mt-1 text-xs">
                  Maximum number of custom service requests you want to accept per day
                </p>
              </div>

              {/* Reply Time */}
              <div>
                <label className="text-text mb-1 block text-sm font-medium">
                  Reply Time (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.reply_time}
                  onChange={(e) => handleInputChange('reply_time', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                />
                <p className="text-text-muted mt-1 text-xs">
                  Expected delivery time in days for custom service requests
                </p>
              </div>
            </div>
          )}

          {/* DM Service Specific Fields */}
          {formData.service_type === 'dm' && (
            <div className="border-border space-y-4 border-t pt-4">
              <h3 className="text-text text-sm font-medium">Direct Message Settings</h3>

              {/* Max Messages per Day */}
              <div>
                <label className="text-text mb-1 block text-sm font-medium">
                  Max Messages per Day
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_messages_a_day}
                  onChange={(e) =>
                    handleInputChange('max_messages_a_day', parseInt(e.target.value) || 1)
                  }
                  placeholder="10"
                  className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                />
                <p className="text-text-muted mt-1 text-xs">
                  Maximum number of messages you want to accept per day
                </p>
              </div>

              {/* Reply Time */}
              <div>
                <label className="text-text mb-1 block text-sm font-medium">
                  Reply Time (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.reply_time}
                  onChange={(e) => handleInputChange('reply_time', parseInt(e.target.value) || 1)}
                  placeholder="1"
                  className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                />
                <p className="text-text-muted mt-1 text-xs">
                  Expected reply time in days for messages
                </p>
              </div>
            </div>
          )}

          {/* Duration Settings */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_duration_based"
                checked={formData.is_duration_based}
                onChange={(e) => handleInputChange('is_duration_based', e.target.checked)}
                className="border-border text-primary focus:ring-primary/20 h-4 w-4 rounded"
              />
              <label htmlFor="is_duration_based" className="text-text text-sm">
                This service has a time limit
              </label>
            </div>

            {formData.is_duration_based && (
              <div>
                <label className="text-text mb-1 block text-sm font-medium">
                  Duration (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.duration_minutes}
                  onChange={(e) =>
                    handleInputChange('duration_minutes', parseInt(e.target.value) || 10)
                  }
                  className="border-border focus:border-primary bg-background text-text focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <label className="text-text mb-1 block text-sm font-medium">Status</label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Preview Image */}
          <div>
            <label className="text-text mb-1 block text-sm font-medium">Preview Image</label>
            <div className="border-border rounded-md border-2 border-dashed p-4 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handlePreviewImageSelect}
                className="hidden"
                id="preview-image-upload"
              />
              <label
                htmlFor="preview-image-upload"
                className="flex cursor-pointer flex-col items-center gap-2"
              >
                <ImageIcon className="text-text-muted h-6 w-6" />
                <span className="text-text-secondary text-sm">Click to upload preview image</span>
                <span className="text-text-muted text-xs">Max 10MB. JPG, PNG, GIF supported.</span>
              </label>
            </div>

            {/* Preview Image Preview */}
            {previewImage && (
              <div className="mt-2">
                <div className="relative">
                  <Image
                    src={URL.createObjectURL(previewImage)}
                    alt="Preview"
                    className="h-24 w-full rounded-md object-cover"
                    width={300}
                    height={96}
                  />
                  <button
                    onClick={() => setPreviewImage(null)}
                    className="bg-error text-background hover:bg-error/80 absolute -top-1 -right-1 rounded-full p-1 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <p className="text-text-muted mt-1 text-xs">
                  {previewImage.name} - {(previewImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {/* Show existing preview image when editing */}
            {editingService?.preview_image && !previewImage && (
              <div className="mt-2">
                <p className="text-text mb-1 text-xs">Current preview:</p>
                <Image
                  src={editingService.preview_image}
                  alt="Current preview"
                  className="h-24 w-full rounded-md object-cover"
                  width={300}
                  height={96}
                />
              </div>
            )}
          </div>

          {/* File Attachments */}
          <div>
            <label className="text-text mb-1 block text-sm font-medium">Attachments</label>
            <div className="border-border rounded-md border-2 border-dashed p-4 text-center">
              <input
                type="file"
                multiple
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer flex-col items-center gap-2"
              >
                <Upload className="text-text-muted h-6 w-6" />
                <span className="text-text-secondary text-sm">
                  {selectedFiles.length > 0 ? 'Click to add more files' : 'Click to upload files'}
                </span>
                <span className="text-text-muted text-xs">
                  Max {10 - (existingAttachments.length + selectedFiles.length)} more files, 50MB
                  each. Images, videos, audio, documents.
                </span>
              </label>
            </div>

            {/* Existing Attachments (when editing) */}
            {existingAttachments.length > 0 && (
              <div className="mt-2">
                <p className="text-text mb-2 text-xs font-medium">Current attachments:</p>
                <div className="space-y-1">
                  {existingAttachments.map((attachment) =>
                    renderExistingAttachmentPreview(attachment)
                  )}
                </div>
              </div>
            )}

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedFiles.map((file, index) => renderAttachmentPreview(file, index))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-border flex justify-end gap-2 border-t px-4 py-3">
          <button
            onClick={handleClose}
            className="border-border text-text hover:bg-surface-elevated rounded-md border px-3 py-2 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={editingService ? handleUpdateService : handleCreateService}
            disabled={isCreatingService || isUpdatingService}
            className="bg-primary text-background rounded-md px-3 py-2 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isCreatingService || isUpdatingService
              ? editingService
                ? 'Updating...'
                : 'Creating...'
              : editingService
                ? 'Update'
                : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
