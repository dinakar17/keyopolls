import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { CommunityDetails } from '@/api/schemas';

interface CommunityStore {
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
    }),
    {
      name: 'community-storage', // unique name for localStorage key
    }
  )
);
