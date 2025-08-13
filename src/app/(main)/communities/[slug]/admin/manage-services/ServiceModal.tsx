'use client';

import React, { useCallback, useEffect, useState } from 'react';

import Image from 'next/image';

import { Image as ImageIcon, Paperclip, Phone, Play, Upload, X } from 'lucide-react';

import {
  useKeyopollsChatsApiServicesCreateService,
  useKeyopollsChatsApiServicesUpdateService,
} from '@/api/default/default';
import { ServiceItemSchema, ServiceTypeEnum } from '@/api/schemas';
import { toast } from '@/components/ui/toast';

const SERVICE_LABELS = {
  [ServiceTypeEnum.dm]: 'Direct Message',
  [ServiceTypeEnum.live_chat]: 'Live Chat',
  [ServiceTypeEnum.audio_call]: 'Audio Call',
  [ServiceTypeEnum.video_call]: 'Video Call',
  [ServiceTypeEnum.custom]: 'Custom Service',
  [ServiceTypeEnum.group_chat]: 'Group Chat',
  [ServiceTypeEnum.group_audio_call]: 'Group Audio Call',
  [ServiceTypeEnum.group_video_call]: 'Group Video Call',
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
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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

  const resetForm = useCallback(() => {
    setFormData({
      service_type: 'dm',
      name: '',
      description: '',
      price: '',
      duration_minutes: 10,
      is_duration_based: false,
      status: 'active',
    });
    setSelectedFiles([]);
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
      });
    } else {
      resetForm();
    }
  }, [editingService, resetForm]);

  const handleInputChange = useCallback(
    (field: keyof typeof formData, value: string | number | boolean) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    []
  );

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    if (files.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }

    const invalidFiles = files.filter((file) => file.size > 50 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error('Some files are too large. Maximum size is 50MB per file');
      return;
    }

    setSelectedFiles(files);
  }, []);

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
    if (!formData.name || !formData.description || !formData.price) {
      toast.error('Please fill in all required fields');
      return;
    }

    const serviceData = {
      community_slug: communitySlug,
      service_type: formData.service_type,
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration_minutes: formData.duration_minutes,
      is_duration_based: formData.is_duration_based,
      status: formData.status,
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

    const updateData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      duration_minutes: formData.duration_minutes,
      is_duration_based: formData.is_duration_based,
      status: formData.status,
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

  if (!isOpen) return null;

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
            <select
              value={formData.service_type}
              onChange={(e) => handleInputChange('service_type', e.target.value)}
              disabled={!!editingService}
              className="border-border focus:border-primary bg-background text-text focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none disabled:opacity-50"
            >
              {Object.entries(SERVICE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

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
            <label className="text-text mb-1 block text-sm font-medium">Price (Credits) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="0.00"
              className="border-border focus:border-primary bg-background text-text placeholder-text-muted focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            />
          </div>

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
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="border-border focus:border-primary bg-background text-text focus:ring-primary/20 w-full rounded-md border px-3 py-2 text-sm focus:ring-1 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
            </select>
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
                <span className="text-text-secondary text-sm">Click to upload files</span>
                <span className="text-text-muted text-xs">
                  Max 10 files, 50MB each. Images, videos, audio, documents.
                </span>
              </label>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="bg-surface-elevated flex items-center gap-2 rounded-md p-2"
                  >
                    <div className="text-primary">{getAttachmentIcon(file.type.split('/')[0])}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-text truncate text-xs">{file.name}</p>
                      <p className="text-text-muted text-xs">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
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
                ))}
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
