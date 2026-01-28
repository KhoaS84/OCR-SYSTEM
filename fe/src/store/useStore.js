import { create } from 'zustand';

const useStore = create((set) => ({
  // ================= AUTH =================
  user: null,
  isAuthenticated: false,
  authLoading: true, // ✅ THÊM

  login: (userData) =>
    set({
      user: userData,
      isAuthenticated: true,
    }),

  logout: () => {
    localStorage.removeItem('taskflow_user');
    localStorage.removeItem('token');
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  setAuthLoading: (value) => set({ authLoading: value }), // ✅ THÊM

  // ================= UI =================
  activeTab: 'info',
  setActiveTab: (tab) => set({ activeTab: tab }),

  showPersonalInfo: true,
  togglePersonalInfo: () =>
    set((state) => ({ showPersonalInfo: !state.showPersonalInfo })),

  // ================= FORM =================
  formData: {
    fullName: 'Nguyễn Công Trình',
    age: '18',
  },
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  // ================= SEARCH =================
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // ================= MODAL =================
  selectedPerson: null,
  showModal: false,
  openModal: (person) =>
    set({
      selectedPerson: person,
      showModal: true,
    }),
  closeModal: () =>
    set({
      selectedPerson: null,
      showModal: false,
    }),
}));

export default useStore;
