import { create } from 'zustand'

/**
 * appStore — Single source of truth for scroll state, UI, audio, and device info.
 * All 3D scene components read from here; only scroll/device hooks write to it.
 */
const useStore = create((set) => ({
  // ── Scroll ───────────────────────────────────────────────────────────────
  scrollProgress: 0,      // 0 → 1 (top → bottom)
  scrollVelocity: 0,      // pixels / ms (abs)
  currentZone: 1,         // 1–5

  // ── Audio ────────────────────────────────────────────────────────────────
  audioMuted: true,
  audioVolume: 0.7,
  hasInteracted: false,   // browser autoplay gate

  // ── UI ───────────────────────────────────────────────────────────────────
  preloaderDone: false,
  contactFormOpen: false,
  activeNavItem: null,

  // ── Device ───────────────────────────────────────────────────────────────
  isMobile: false,
  isTablet: false,
  devicePixelRatio: 1,
  prefersReducedMotion: false,

  // ── Actions ──────────────────────────────────────────────────────────────
  setScrollProgress:    (p) => set({ scrollProgress: p }),
  setScrollVelocity:    (v) => set({ scrollVelocity: v }),
  setCurrentZone:       (z) => set({ currentZone: z }),

  toggleAudio: () => set((s) => ({ audioMuted: !s.audioMuted, hasInteracted: true })),
  setAudioVolume: (v) => set({ audioVolume: v }),

  setPreloaderDone:    () => set({ preloaderDone: true }),
  openContactForm:     () => set({ contactFormOpen: true }),
  closeContactForm:    () => set({ contactFormOpen: false }),
  setActiveNavItem:    (item) => set({ activeNavItem: item }),

  setDevice: (data) => set(data),
}))

export default useStore
