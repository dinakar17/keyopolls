import React, { useEffect, useState } from 'react';

import Image from 'next/image';

import { Eye, Folder, Image as ImageIcon, List, Lock, Save, Upload, Users, X } from 'lucide-react';

import {
  useKeyopollsPollsApiListsCreatePollList,
  useKeyopollsPollsApiListsUpdatePollList,
} from '@/api/poll-lists/poll-lists';
import { PollListDetailsSchema } from '@/api/schemas';
import toast from '@/components/ui/toast';
import { useProfileStore } from '@/stores/useProfileStore';

interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: PollListDetailsSchema | null;
  parentId?: number | null;
  communitySlug: string;
}

const CreateEditModal: React.FC<CreateEditModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editItem,
  parentId,
  communitySlug,
}) => {
  const { accessToken } = useProfileStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    list_type: 'list',
    visibility: 'public',
    is_collaborative: false,
    max_polls: '',
    image: null as File | null,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { mutate: createList, isPending: isCreating } = useKeyopollsPollsApiListsCreatePollList({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: () => {
        onSuccess();
        toast.success('Poll list created successfully');
        onClose();
        resetForm();
      },
      onError: (error) => {
        toast.error(`${error.response?.data?.message || 'An unexpected error occurred'}`);
      },
    },
  });

  const { mutate: updateList, isPending: isUpdating } = useKeyopollsPollsApiListsUpdatePollList({
    request: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    mutation: {
      onSuccess: () => {
        onSuccess();
        toast.success('Poll list updated successfully');
        onClose();
        resetForm();
      },
      onError: (error) => {
        toast.error(`${error.response?.data?.message || 'An unexpected error occurred'}`);
      },
    },
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title,
        description: editItem.description,
        list_type: editItem.list_type,
        visibility: editItem.visibility,
        is_collaborative: editItem.is_collaborative,
        max_polls: editItem.max_polls?.toString() || '',
        image: null,
      });
      // If editing and has existing image, you might want to show it
    } else {
      resetForm();
    }
  }, [editItem, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      list_type: 'list',
      visibility: 'public',
      is_collaborative: false,
      max_polls: '',
      image: null,
    });
    setImagePreview(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      parent_id: parentId || null,
      max_polls: formData.max_polls ? parseInt(formData.max_polls) : null,
    };

    if (editItem) {
      updateList({
        listId: editItem.id,
        data: {
          data: submitData,
          image: formData.image || undefined,
        },
      });
    } else {
      createList({
        data: {
          data: { ...submitData, community_slug: communitySlug },
          image: formData.image || undefined,
        },
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border-border max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border">
        <div className="border-border flex items-center justify-between border-b p-6">
          <h2 className="text-text text-xl font-semibold">
            {editItem ? 'Edit' : 'Create'}{' '}
            {formData.list_type === 'folder' ? 'Folder' : 'Poll List'}
          </h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text rounded-lg p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          {/* Type Selection */}
          <div>
            <label className="text-text mb-3 block text-sm font-medium">Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, list_type: 'folder' }))}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  formData.list_type === 'folder'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-border-hover'
                }`}
              >
                <Folder className="mb-2 h-5 w-5" />
                <div className="font-medium">Folder</div>
                <div className="text-text-secondary text-xs">Contains poll lists</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, list_type: 'list' }))}
                className={`rounded-lg border p-4 text-left transition-colors ${
                  formData.list_type === 'list'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-border-hover'
                }`}
              >
                <List className="mb-2 h-5 w-5" />
                <div className="font-medium">Poll List</div>
                <div className="text-text-secondary text-xs">Contains polls</div>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-text mb-2 block text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              className="border-border focus:border-primary bg-surface-elevated w-full rounded-lg border px-3 py-2 focus:outline-none"
              placeholder={`Enter ${formData.list_type} title...`}
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-text mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="border-border focus:border-primary bg-surface-elevated h-24 w-full resize-none rounded-lg border px-3 py-2 focus:outline-none"
              placeholder={`Describe this ${formData.list_type}...`}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="text-text mb-2 block text-sm font-medium">
              {formData.list_type === 'folder' ? 'Folder' : 'List'} Image
            </label>
            <div className="border-border rounded-lg border-2 border-dashed p-6">
              {imagePreview ? (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-full rounded-lg object-cover"
                    width={256}
                    height={128}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="text-text-secondary mx-auto mb-2 h-8 w-8" />
                  <p className="text-text-secondary mb-2 text-sm">
                    Upload an image for your {formData.list_type}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-primary hover:bg-primary/90 text-background inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Choose Image
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div>
            <label className="text-text mb-3 block text-sm font-medium">Visibility</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'public', icon: Eye, label: 'Public', desc: 'Anyone can see' },
                { value: 'unlisted', icon: Users, label: 'Unlisted', desc: 'Link only' },
                { value: 'private', icon: Lock, label: 'Private', desc: 'Only you' },
              ].map(({ value, icon: Icon, label, desc }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, visibility: value }))}
                  className={`rounded-lg border p-3 text-center transition-colors ${
                    formData.visibility === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-border-hover'
                  }`}
                >
                  <Icon className="mx-auto mb-1 h-4 w-4" />
                  <div className="text-xs font-medium">{label}</div>
                  <div className="text-text-secondary text-xs">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-text text-sm font-medium">Collaborative</div>
                <div className="text-text-secondary text-xs">Allow others to add content</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, is_collaborative: !prev.is_collaborative }))
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.is_collaborative ? 'bg-primary' : 'bg-surface-subtle'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.is_collaborative ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {formData.list_type === 'list' && (
              <div>
                <label className="text-text mb-2 block text-sm font-medium">
                  Max Polls (Optional)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_polls}
                  onChange={(e) => setFormData((prev) => ({ ...prev, max_polls: e.target.value }))}
                  className="border-border focus:border-primary bg-surface-elevated w-full rounded-lg border px-3 py-2 focus:outline-none"
                  placeholder="No limit"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="border-border flex items-center gap-3 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="border-border hover:bg-surface-elevated text-text flex-1 rounded-lg border px-4 py-2 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isCreating || isUpdating || !formData.title.trim()}
              className="bg-primary hover:bg-primary/90 text-background flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCreating || isUpdating ? (
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editItem ? 'Update' : 'Create'} {formData.list_type === 'folder' ? 'Folder' : 'List'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditModal;
