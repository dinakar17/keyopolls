'use client';

import React from 'react';

import GifPicker, { TenorImage } from 'gif-picker-react';
import { X } from 'lucide-react';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';

interface GifSelectorProps {
  onSelect: (gif: TenorImage) => void;
  onClose: () => void;
}

const GifSelector = ({ onSelect, onClose }: GifSelectorProps) => {
  return (
    <Drawer open={true} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="bg-surface border-border h-[100dvh] max-h-none border-t">
        <DrawerHeader className="border-border-subtle flex items-center border-b px-4 py-3">
          <DrawerClose asChild>
            <button
              type="button"
              className="text-text-muted hover:bg-surface-elevated mr-3 rounded-full p-2 transition-colors"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </DrawerClose>
          <DrawerTitle className="text-text text-lg font-semibold">Select a GIF</DrawerTitle>
        </DrawerHeader>

        <div className="bg-background flex-1 overflow-auto p-4">
          <GifPicker
            tenorApiKey={process.env.NEXT_PUBLIC_TENOR_API_KEY || ''}
            onGifClick={onSelect}
            width="100%"
            height="calc(100dvh - 120px)"
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default GifSelector;
