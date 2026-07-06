import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/appStore'
import { mapRange, damp } from '../../utils/math'

useGLTF.preload('/models/speaker.glb')
useGLTF.preload('/models/amplifier.glb')

/**
 * Zone1Speaker — Speaker & amplifier with bass-pulse animation.
 * Visible: scroll 0.00 → 0.30
 */
const Zone1Speaker = () => {
  const speaker   = useGLTF('/models/speaker.glb')
  const amplifier = useGLTF('/models/amplifier.glb')
  const groupRef  = useRef()
  const ampRef    = useRef()
  const scrollProgress = useStore((s) => s.scrollProgress)

  // Configure shadows and basic material settings without overwriting colors
  const setupMaterials = (scene) => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
        if (child.material) {
          child.material = child.material.clone()
          child.material.transparent = true
        }
      }
    })
  }

  // Set up materials on first load
  if (speaker.scene)   setupMaterials(speaker.scene)
  if (amplifier.scene) setupMaterials(amplifier.scene)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!groupRef.current) return

    // Bass pulse — scale Y oscillates
    const pulse = 1 + Math.abs(Math.sin(t * 8)) * 0.03
    groupRef.current.scale.y = pulse

    // Fade out opacity based on scroll (starts fully visible at scrollProgress = 0)
    const opacity = mapRange(scrollProgress, 0.25, 0.35, 1, 0)
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.opacity = opacity
      }
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, 5]}>
      {/* Local lighting to illuminate the detailed 3D models */}
      <pointLight position={[0, 1.2, 1.8]} intensity={12} color="#ffffff" distance={5} decay={1.5} />
      <pointLight position={[-2.5, 0.5, 1.0]} intensity={8} color="#00d4ff" distance={4} decay={1.5} />
      <pointLight position={[2.5, 0.5, 1.0]} intensity={8} color="#7b2fff" distance={4} decay={1.5} />

      {/* Main amplifier stack — centre */}
      <primitive
        object={amplifier.scene.clone()}
        position={[0, -0.2, 0]}
        scale={[4.5, 4.5, 4.5]}
        rotation={[0.1, 0.3, 0]}
      />
      {/* Left speaker */}
      <primitive
        object={speaker.scene.clone()}
        position={[-3.5, -0.6, -1.0]}
        scale={[1.8, 1.8, 1.8]}
        rotation={[0, 0.3, 0]}
      />
      {/* Right speaker */}
      <primitive
        object={speaker.scene.clone()}
        ref={ampRef}
        position={[3.5, -0.6, -1.0]}
        scale={[1.8, 1.8, 1.8]}
        rotation={[0, -0.3, 0]}
      />
    </group>
  )
}

export default Zone1Speaker
