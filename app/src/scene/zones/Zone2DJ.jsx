import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/appStore'
import { mapRange } from '../../utils/math'

useGLTF.preload('/models/dj_booth.glb')
useGLTF.preload('/models/mixer.glb')
useGLTF.preload('/models/headphones.glb')
useGLTF.preload('/models/wave.glb')

/**
 * Zone2DJ — Wave tunnel transition followed by the DJ mixer setup.
 * Wave tunnel visible: 0.10 → 0.38
 * DJ Deck visible: 0.26 → 0.54
 */
const Zone2DJ = () => {
  const booth      = useGLTF('/models/dj_booth.glb')
  const mixer      = useGLTF('/models/mixer.glb')
  const headphones = useGLTF('/models/headphones.glb')
  const wave       = useGLTF('/models/wave.glb')

  const waveRef    = useRef()
  const boothRef   = useRef()
  const mixerRef   = useRef()
  const hpRef      = useRef()
  const scrollProgress  = useStore((s) => s.scrollProgress)
  const scrollVelocity  = useStore((s) => s.scrollVelocity)

  const applyEmissive = (scene, color, intensity = 0.4) => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone()
        child.material.emissive = new THREE.Color(color)
        child.material.emissiveIntensity = intensity
      }
    })
  }

  if (booth.scene)      applyEmissive(booth.scene, '#0066ff', 0.5)
  if (mixer.scene)      applyEmissive(mixer.scene, '#7b2fff', 0.3)
  if (headphones.scene) applyEmissive(headphones.scene, '#ff0080', 0.2)
  if (wave.scene)       applyEmissive(wave.scene, '#9b30ff', 1.8)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // 1. Wave Tunnel animation
    if (waveRef.current) {
      waveRef.current.rotation.y = t * 0.15
      // Wave tunnel visible early
      const waveOpacity = mapRange(scrollProgress, 0.10, 0.18, 0, 1) *
                          mapRange(scrollProgress, 0.28, 0.38, 1, 0)
      waveRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity     = waveOpacity
          child.material.transparent = true
        }
      })
    }

    // 2. DJ Booth animation
    if (boothRef.current) {
      // Turntable spin on mixer
      if (mixerRef.current) {
        mixerRef.current.rotation.y += 0.008
      }

      // Headphones slow bob
      if (hpRef.current) {
        hpRef.current.position.y = 1.8 + Math.sin(t * 0.8) * 0.05
        hpRef.current.rotation.y = Math.sin(t * 0.4) * 0.1
      }

      // DJ booth visible late
      const djOpacity = mapRange(scrollProgress, 0.26, 0.34, 0, 1) *
                        mapRange(scrollProgress, 0.46, 0.54, 1, 0)
      boothRef.current.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.opacity     = djOpacity
          child.material.transparent = true
        }
      })

      // EQ-bar-like emissive pulse driven by velocity
      const eqPulse = 0.3 + scrollVelocity * 0.1 + Math.sin(t * 6) * 0.2
      boothRef.current.traverse((child) => {
        if (child.isMesh && child.material?.emissive) {
          child.material.emissiveIntensity = eqPulse
        }
      })
    }
  })

  return (
    <group>
      {/* Wave Tunnel (camera passes directly through) */}
      <primitive
        ref={waveRef}
        object={wave.scene.clone()}
        position={[0, 1.0, 3.5]}
        scale={[1.8, 1.8, 4.0]}
        rotation={[0, Math.PI / 2, 0]}
      />

      {/* DJ Mixer Setup */}
      <group ref={boothRef} position={[0, -1.8, -5.5]}>
        <primitive object={booth.scene.clone()} scale={[2.5, 2.5, 2.5]} />
        <primitive object={mixer.scene.clone()} ref={mixerRef}
          scale={[2, 2, 2]} position={[0, 1.5, 0]} />
        <primitive object={headphones.scene.clone()} ref={hpRef}
          scale={[1.5, 1.5, 1.5]} position={[1.8, 1.8, 0.5]} />
      </group>
    </group>
  )
}

export default Zone2DJ
