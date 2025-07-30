import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CommunityDetails } from '@/api/schemas';

interface CommunityStore {
  folderId: string | null;
  setFolderId: (id: string | null) => void;
  clearFolderId: () => void;
  communityDetails: CommunityDetails | null;
  setCommunityDetails: (community: CommunityDetails | null) => void;
  clearCommunityDetails: () => void;
}

export const useCommunityStore = create<CommunityStore>()(
  persist(
    (set) => ({
      communityDetails: null,
      setCommunityDetails: (community) => set({ communityDetails: community }),
      clearCommunityDetails: () => set({ communityDetails: null }),
      folderId: null,
      setFolderId: (id) => set({ folderId: id }),
      clearFolderId: () => set({ folderId: null }),
    }),
    {
      name: 'community-storage', // unique name for localStorage key
    }
  )
);
