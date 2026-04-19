import { create } from 'zustand';

interface ProfileState {
  selectedEmployeeId: string | null;
  isOpen: boolean;
  openProfile: (id: string) => void;
  closeProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  selectedEmployeeId: null,
  isOpen: false,
  openProfile: (id) => set({ selectedEmployeeId: id, isOpen: true }),
  closeProfile: () => set({ selectedEmployeeId: null, isOpen: false }),
}));
