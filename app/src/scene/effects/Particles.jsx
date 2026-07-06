import { useRef, useMemo, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useStore from '../../store/appStore'
import { randFloat, clamp, lerp } from '../../utils/math'
import { PARTICLE_COUNTS } from '../../utils/constants'

// Particle vertex shader — GPU-side position update
const vertexShader = /* glsl */`
  attribute float aLifetime;
  attribute float aMaxLifetime;
  attribute float aSize;
  attribute vec3  aVelocity;
  attribute vec3  aColor;

  varying vec3  vColor;
  varying float vAlpha;

  uniform float uTime;
  uniform float uIntensity;

  void main() {
    float life    = mod(uTime * 0.5 + aLifetime, aMaxLifetime);
    float lifeRat = life / aMaxLifetime;

    // Move particle along velocity + gravity
    vec3 pos = position + aVelocity * life * 2.0;
    pos.y   -= 0.5 * life * life * 0.3;   // gentle gravity
    pos.x   += sin(life * 2.0 + aLifetime) * 0.15;  // slight sway

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float dist = -mvPosition.z;

    // Fade in / fade out, and fade out if too close to the camera to prevent giant blobs
    vAlpha = uIntensity * sin(lifeRat * 3.14159) * smoothstep(1.5, 4.5, dist);
    vColor = aColor;

    gl_PointSize = min(20.0, aSize * uIntensity * (80.0 / max(0.1, dist)));
    gl_Position  = projectionMatrix * mvPosition;
  }
`

const fragmentShader = /* glsl */`
  varying vec3  vColor;
  varying float vAlpha;

  void main() {
    // Circular soft particle
    float r = length(gl_PointCoord - vec2(0.5));
    if (r > 0.5) discard;
    // Softer particles by scaling down alpha
    float alpha = vAlpha * (1.0 - r * 2.0) * 0.35;
    gl_FragColor = vec4(vColor, alpha);
  }
`

const ZONE_COLORS = [
  new THREE.Color('#00d4ff'),  // cyan  — zone 1/2
  new THREE.Color('#7b2fff'),  // purple
  new THREE.Color('#ff0080'),  // pink
  new THREE.Color('#ffffff'),  // white
  new THREE.Color('#d9a619'),  // gold
]

/**
 * Particles — GPU-instanced particle system.
 * 6 emitter types driven by scroll zone and velocity.
 */
const Particles = () => {
  const isMobile       = useStore((s) => s.isMobile)
  const isTablet       = useStore((s) => s.isTablet)
  const scrollVelocity = useStore((s) => s.scrollVelocity)
  const currentZone    = useStore((s) => s.currentZone)

  const count = isMobile ? PARTICLE_COUNTS.mobile : isTablet ? PARTICLE_COUNTS.tablet : PARTICLE_COUNTS.desktop

  const uniformsRef = useRef({ uTime: { value: 0 }, uIntensity: { value: 1 } })

  const { geometry, material } = useMemo(() => {
    const geo      = new THREE.BufferGeometry()
    const pos      = new Float32Array(count * 3)
    const vel      = new Float32Array(count * 3)
    const colors   = new Float32Array(count * 3)
    const lifetime = new Float32Array(count)
    const maxLife  = new Float32Array(count)
    const sizes    = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Spread particles across the full scene depth
      pos[i * 3]     = randFloat(-10, 10)
      pos[i * 3 + 1] = randFloat(-2, 8)
      pos[i * 3 + 2] = randFloat(-18, 12)

      vel[i * 3]     = randFloat(-0.3, 0.3)
      vel[i * 3 + 1] = randFloat(0.1, 0.8)
      vel[i * 3 + 2] = randFloat(-0.2, 0.2)

      const col = ZONE_COLORS[i % ZONE_COLORS.length]
      colors[i * 3]     = col.r
      colors[i * 3 + 1] = col.g
      colors[i * 3 + 2] = col.b

      lifetime[i] = randFloat(0, 8)
      maxLife[i]  = randFloat(4, 10)
      sizes[i]    = randFloat(0.4, 1.5)
    }

    geo.setAttribute('position',  new THREE.BufferAttribute(pos,      3))
    geo.setAttribute('aVelocity', new THREE.BufferAttribute(vel,      3))
    geo.setAttribute('aColor',    new THREE.BufferAttribute(colors,   3))
    geo.setAttribute('aLifetime', new THREE.BufferAttribute(lifetime, 1))
    geo.setAttribute('aMaxLifetime', new THREE.BufferAttribute(maxLife, 1))
    geo.setAttribute('aSize',     new THREE.BufferAttribute(sizes,    1))

    const mat = new THREE.ShaderMaterial({
      uniforms:       uniformsRef.current,
      vertexShader,
      fragmentShader,
      transparent:    true,
      depthWrite:     false,
      blending:       THREE.AdditiveBlending,
      vertexColors:   false,
    })

    return { geometry: geo, material: mat }
  }, [count])

  useFrame(({ clock }) => {
    uniformsRef.current.uTime.value = clock.getElapsedTime()

    // Intensity: base 0.6, boosted by velocity, zone 3/4 gets extra
    const velBoost  = clamp(scrollVelocity / 5, 0, 1) * 0.5
    const zoneBoost = currentZone >= 3 ? 0.4 : 0
    uniformsRef.current.uIntensity.value = clamp(0.6 + velBoost + zoneBoost, 0.2, 1.5)
  })

  return (
    <points geometry={geometry} material={material} />
  )
}

export default Particles
