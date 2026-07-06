// Zone breakpoints (scroll 0→1)
export const ZONES = [
  { id: 1, enter: 0.00, peak: 0.10, exit: 0.30, label: 'Speaker' },
  { id: 2, enter: 0.15, peak: 0.35, exit: 0.50, label: 'DJ Deck' },
  { id: 3, enter: 0.50, peak: 0.60, exit: 0.80, label: 'Crowd'   },
  { id: 4, enter: 0.65, peak: 0.78, exit: 0.92, label: 'Lasers'  },
  { id: 5, enter: 0.85, peak: 0.95, exit: 1.00, label: 'Contact' },
]

// CatmullRom camera path control points [x, y, z]
export const CAMERA_POINTS = [
  [0, 1.2, 8.5],    // Zone 1 — start close to amp
  [0, 1.5, 6.0],    // Zone 1 exit / Wave entry
  [0, 1.0, 1.0],    // Zone 2 — inside the wave tunnel
  [0, 2.2, -3.2],   // Zone 3 — look down at DJ mixer
  [0, 0.8, -8.5],   // Zone 4 — behind crowd looking at stage
  [0, 1.8, -10.5],  // Zone 4 exit / Laser tilt up
  [0, 1.2, -14.0],  // Zone 5 — settle on table
]

// Camera look-at targets per zone
export const LOOK_AT_POINTS = [
  [0, 0.9, 5.0],    // Look at Zone 1 (amp)
  [0, 1.0, 2.0],    // Look ahead through tunnel
  [0, 1.0, -2.0],   // Look through tunnel
  [0, 0.8, -5.5],   // Look down at DJ deck
  [0, 2.2, -13.0],  // Look up at stage/lights
  [0, 4.5, -14.0],  // Look up at lasers
  [0, 0.7, -16.0],  // Look at table / logo
]

// Color tokens
export const COLORS = {
  neonCyan:      '#00d4ff',
  electricPurple:'#7b2fff',
  hotPink:       '#ff0080',
  deepBlack:     '#050508',
  darkGrey:      '#0d0d15',
  lightGrey:     '#8888aa',
  gold:          '#d9a619',
}

// Particle counts by device tier
export const PARTICLE_COUNTS = {
  desktop: 2000,
  tablet:  1000,
  mobile:  500,
  lowEnd:  300,
}

// Post-processing presets
export const PP_PRESETS = {
  desktop: { bloom: true, fxaa: true, dof: true },
  tablet:  { bloom: true, fxaa: true, dof: false },
  mobile:  { bloom: true, fxaa: false, dof: false },
  lowEnd:  { bloom: false, fxaa: false, dof: false },
}
