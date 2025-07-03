'use client';

import React, { useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  Briefcase,
  Camera,
  ChefHat,
  Coffee,
  Film,
  Gamepad2,
  Globe,
  GraduationCap,
  GripVertical,
  Hammer,
  Heart,
  Home,
  Laptop,
  Microscope,
  Music,
  Palette,
  Plane,
  Save,
  TreePine,
  Trophy,
  Users,
  Vote,
} from 'lucide-react';

import {
  type Category,
  getUserOrderedCategories,
  saveUserCategoriesOrder,
} from '@/constants/categories';

// Icon mapping
const iconMap = {
  Home,
  Laptop,
  Gamepad2,
  Trophy,
  Film,
  Coffee,
  GraduationCap,
  Briefcase,

  Heart,
  Palette,
  Microscope,
  Vote,
  ChefHat,
  Plane,
  Camera,
  Music,
  BookOpen,
  TreePine,
  Hammer,
  Globe,
  Users,
  AlertCircle,
};

const EditCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isReordering, setIsReordering] = useState(false);

  // Ref for drag and drop
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  // Load categories from localStorage or use defaults
  useEffect(() => {
    const orderedCategories = getUserOrderedCategories();
    setCategories(orderedCategories);
  }, []);

  // Save categories order to localStorage
  const saveCategoriesOrder = () => {
    saveUserCategoriesOrder(categories);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, index: number) => {
    dragItem.current = index;
    e.dataTransfer.effectAllowed = 'move';
  };

  // Handle drag over
  const handleDragEnter = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    dragOverItem.current = index;
  };

  // Handle drag end (reordering)
  const handleDragEnd = () => {
    if (
      dragItem.current !== null &&
      dragOverItem.current !== null &&
      dragItem.current !== dragOverItem.current
    ) {
      const newCategories = [...categories];
      const draggedItem = newCategories[dragItem.current];

      // Remove dragged item and insert at new position
      newCategories.splice(dragItem.current, 1);
      newCategories.splice(dragOverItem.current, 0, draggedItem);

      setCategories(newCategories);
    }

    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // Toggle reordering mode
  const toggleReordering = () => {
    if (isReordering) {
      // Save when exiting reorder mode
      saveCategoriesOrder();
    }
    setIsReordering(!isReordering);
  };

  // Handle save and exit
  const handleSaveAndExit = () => {
    saveCategoriesOrder();
    // Navigate back or show success message
    window.history.back();
  };

  // Get icon component
  const getIconComponent = (iconName: string, color: string, size: number = 18) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? (
      <IconComponent size={size} style={{ color }} />
    ) : (
      <Home size={size} style={{ color }} />
    );
  };

  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Header */}
      <header className="bg-background border-border sticky top-0 z-10 border-b">
        <div className="mx-auto max-w-2xl px-4">
          <div className="flex h-14 items-center justify-between">
            <div className="flex items-center">
              <Link href="/">
                <button className="text-text-muted hover:bg-surface-elevated hover:text-text -ml-2 rounded-full p-2 transition-colors">
                  <ArrowLeft size={20} />
                </button>
              </Link>
              <h1 className="text-text ml-2 text-lg font-semibold">Edit Categories</h1>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={toggleReordering}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  isReordering
                    ? 'bg-primary text-background hover:opacity-90'
                    : 'bg-surface-elevated text-text hover:bg-border'
                }`}
              >
                {isReordering ? 'Done' : 'Reorder'}
              </button>

              <button
                onClick={handleSaveAndExit}
                className="bg-success text-background flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
              >
                <Save size={14} className="mr-1.5" />
                Save
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-4">
        {/* Instructions */}
        <div className="bg-surface-elevated border-primary mb-4 rounded-lg border-l-4 p-3">
          <p className="text-text-secondary text-sm">
            {isReordering
              ? 'Drag categories to reorder them. Your changes will be saved when you tap "Done".'
              : 'Tap "Reorder" to change the order of your categories.'}
          </p>
        </div>

        {/* Categories List */}
        <div className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-text text-lg font-medium">Categories</h2>
            <span className="text-text-muted text-sm">{categories.length} categories</span>
          </div>

          <div className="space-y-1">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className={`border-border-subtle flex items-center border-b px-4 py-3 transition-colors ${
                  isReordering
                    ? 'hover:bg-surface-elevated cursor-grab active:cursor-grabbing'
                    : 'cursor-default'
                }`}
                draggable={isReordering}
                onDragStart={isReordering ? (e) => handleDragStart(e, index) : undefined}
                onDragEnter={isReordering ? (e) => handleDragEnter(e, index) : undefined}
                onDragEnd={isReordering ? handleDragEnd : undefined}
                onDragOver={isReordering ? handleDragOver : undefined}
              >
                {/* Drag Handle */}
                {isReordering && (
                  <div className="mr-3 cursor-grab active:cursor-grabbing">
                    <GripVertical size={16} className="text-text-muted" />
                  </div>
                )}

                {/* Order Number */}
                <div className="bg-surface-elevated text-text-secondary mr-3 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium">
                  {index + 1}
                </div>

                {/* Category Icon */}
                <div className="bg-surface-elevated mr-3 flex h-7 w-7 items-center justify-center rounded-full">
                  {getIconComponent(category.icon, category.icon_color, 16)}
                </div>

                {/* Category Info */}
                <div className="min-w-0 flex-1">
                  <div className="text-text truncate text-sm font-medium">{category.name}</div>
                  <div className="text-text-muted truncate text-xs">{category.description}</div>
                </div>

                {/* Category Type Badge */}
                <div
                  className={`ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                    category.category_type === 'feed'
                      ? 'bg-accent/20 text-accent'
                      : 'bg-surface-elevated text-text-muted'
                  }`}
                >
                  {category.category_type === 'feed' ? 'Feed' : 'News'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-surface-elevated border-border rounded-lg border p-3">
          <p className="text-text-muted text-xs leading-relaxed">
            The order you set here will be reflected in your main navigation. Changes are saved
            locally on your device.
          </p>
        </div>
      </main>
    </div>
  );
};

export default EditCategoriesPage;
