import { defineStore } from 'pinia';

export type NavSection = 'home' | 'subscriptions' | 'search' | 'journal' | 'settings';
export type RightTab = 'search' | 'plugins' | 'settings';

export const useLayoutStore = defineStore('layout', {
  state: () => ({
    leftOpen: true,
    rightOpen: true,
    activeNav: 'home' as NavSection,
    rightTab: 'search' as RightTab,
  }),
  actions: {
    toggleLeft() { this.leftOpen = !this.leftOpen; },
    toggleRight() { this.rightOpen = !this.rightOpen; },
    setNav(n: NavSection) { this.activeNav = n; },
    setRightTab(t: RightTab) { this.rightTab = t; this.rightOpen = true; },
  },
});





