import * as THREE from 'three'

/** Linear interpolation */
export const lerp = (a, b, t) => a + (b - a) * t

/** Clamp value between min and max */
export const clamp = (val, min, max) => Math.max(min, Math.min(max, val))

/** Smooth damp (exponential easing) */
export const damp = (current, target, smoothing, dt) => {
  return lerp(current, target, 1 - Math.exp(-smoothing * dt))
}

/** Ease in-out cubic */
export const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/** Ease out cubic */
export const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/** Ease in cubic */
export const easeInCubic = (t) => t * t * t

/** Map a value from one range to another, clamped */
export const mapRange = (val, inMin, inMax, outMin, outMax) => {
  const t = clamp((val - inMin) / (inMax - inMin), 0, 1)
  return lerp(outMin, outMax, t)
}

/** Lerp between two THREE.Vector3 instances */
export const lerpVector3 = (a, b, t, out = new THREE.Vector3()) => {
  out.set(
    lerp(a.x, b.x, t),
    lerp(a.y, b.y, t),
    lerp(a.z, b.z, t)
  )
  return out
}

/** Smooth random float */
export const randFloat = (min, max) => Math.random() * (max - min) + min

/** Smooth noise helper (seeded from index) */
export const noise1D = (t, freq = 1) =>
  Math.sin(t * freq * 6.2831) * 0.5 + 0.5
