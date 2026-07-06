import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/appStore'
import { mapRange } from '../../utils/math'

useGLTF.preload('/models/crowd.glb')
useGLTF.preload('/models/stage.glb')

/**
 * Zone3Crowd — Crowd + stage with dancing animation (staggered Y displacement).
 * Visible: scroll 0.50 → 0.80
 */
const Zone3Crowd = () => {
  const crowd = useGLTF('/models/crowd.glb')
  const stage = useGLTF('/models/stage.glb')
  const groupRef = useRef()
  const crowdRef = useRef()
  const scrollProgress = useStore((s) => s.scrollProgress)

  // Apply crowd emissive
  if (crowd.scene) {
    crowd.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone()
        child.material.emissive = new THREE.Color('#220033')
        child.material.emissiveIntensity = 0.3
      }
    })
  }
  if (stage.scene) {
    stage.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone()
        child.material.emissive = new THREE.Color('#7b2fff')
        child.material.emissiveIntensity = 0.5
      }
    })
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!groupRef.current) return

    // Crowd dance animation — Y oscillation (simulated by moving whole group)
    if (crowdRef.current) {
      crowdRef.current.position.y = Math.sin(t * 2.5) * 0.04
    }

    // Fade in/out
    const opacity = mapRange(scrollProgress, 0.50, 0.57, 0, 1) *
                    mapRange(scrollProgress, 0.73, 0.82, 1, 0)
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.opacity     = opacity
        child.material.transparent = true
      }
    })
  })

  return (
    <group ref={groupRef} position={[0, -2.5, -11.0]}>
      <primitive object={stage.scene.clone()} scale={[3, 3, 3]} />
      <primitive object={crowd.scene.clone()} ref={crowdRef}
        scale={[2.5, 2.5, 2.5]} position={[0, 1.2, 1.8]} />
    </group>
  )
}

export default Zone3Crowd
