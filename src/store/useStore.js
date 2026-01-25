import { create } from 'zustand';

const useStore = create((set) => ({
  // User state
  user: null,
  isAuthenticated: false,
  
  // Login action
  login: (userData) => set({ 
    user: userData, 
    isAuthenticated: true 
  }),
  
  // Logout action
  logout: () => set({ 
    user: null, 
    isAuthenticated: false 
  }),
  
  // Update user profile
  updateUser: (userData) => set((state) => ({
    user: { ...state.user, ...userData }
  })),

  // Home page state
  activeTab: 'info',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Personal info section
  showPersonalInfo: true,
  togglePersonalInfo: () => set((state) => ({ 
    showPersonalInfo: !state.showPersonalInfo 
  })),

  // Form data
  formData: {
    fullName: 'Nguyễn Công Trình',
    age: '18'
  },
  updateFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),

  // Search state
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Modal state
  selectedPerson: null,
  showModal: false,
  openModal: (person) => set({ 
    selectedPerson: person, 
    showModal: true 
  }),
  closeModal: () => set({ 
    selectedPerson: null, 
    showModal: false 
  }),
}));

export default useStore;
