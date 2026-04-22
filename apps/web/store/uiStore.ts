import { create } from 'zustand';

interface UIState {
  isCreateTicketModalOpen: boolean;
  isSidebarCollapsed: boolean;
  openCreateTicketModal: () => void;
  closeCreateTicketModal: () => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCreateTicketModalOpen: false,
  isSidebarCollapsed: false,
  openCreateTicketModal: () => set({ isCreateTicketModalOpen: true }),
  closeCreateTicketModal: () => set({ isCreateTicketModalOpen: false }),
  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),
}));
