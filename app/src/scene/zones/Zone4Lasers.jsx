import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Line } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/appStore'
import { mapRange } from '../../utils/math'

useGLTF.preload('/models/laser.glb')
useGLTF.preload('/models/spotlight.glb')

/**
 * Zone4Lasers — Lasers, spotlights, and volumetric fog plane.
 * Visible: scroll 0.65 → 0.92
 */
const Zone4Lasers = () => {
  const laser     = useGLTF('/models/laser.glb')
  const spotlight = useGLTF('/models/spotlight.glb')
  const groupRef  = useRef()
  const fogRef    = useRef()
  const scrollProgress = useStore((s) => s.scrollProgress)

  // Apply emissive glow to lasers
  if (laser.scene) {
    laser.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone()
        child.material.emissive = new THREE.Color('#00ff88')
        child.material.emissiveIntensity = 2.0
      }
    })
  }

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (!groupRef.current) return

    // Laser sweep rotation
    if (laser.scene) {
      laser.scene.rotation.y = Math.sin(t * 0.8) * 0.4
    }

    // Fog plane opacity pulse
    if (fogRef.current) {
      fogRef.current.material.opacity = 0.08 + Math.sin(t * 0.4) * 0.04
    }

    // Fade in/out
    const opacity = mapRange(scrollProgress, 0.65, 0.72, 0, 1) *
                    mapRange(scrollProgress, 0.87, 0.94, 1, 0)
    groupRef.current.traverse((child) => {
      if (child.isMesh && child.material && child !== fogRef.current) {
        child.material.opacity     = opacity
        child.material.transparent = true
      }
    })
  })

  // Laser beam lines (procedural local to group at [0, 0, -12.5])
  const laserLines = [
    { start: [-3, 5, 1.5], end: [2, -2.5, 4.5],  color: '#00d4ff' },
    { start: [ 3, 5, 1.5], end: [-2, -2.5, 4.5], color: '#ff0080' },
    { start: [-3, 5, 1.5], end: [0, -2.5, 3.0],  color: '#7b2fff' },
    { start: [ 3, 5, 1.5], end: [0, -2.5, 3.0],  color: '#00d4ff' },
  ]

  return (
    <group ref={groupRef} position={[0, 0, -12.5]}>
      {/* Volumetric fog plane */}
      <mesh ref={fogRef} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 20]} />
        <meshBasicMaterial color="#5533ff" transparent opacity={0.08} depthWrite={false} />
      </mesh>

      {/* Laser lines */}
      {laserLines.map((line, i) => (
        <Line key={i}
          points={[line.start, line.end]}
          color={line.color}
          lineWidth={1.5}
          transparent
          opacity={0.8}
        />
      ))}

      {/* Models */}
      <primitive object={laser.scene.clone()}
        scale={[2.5, 2.5, 2.5]} position={[-3, 5, 1.5]} />
      <primitive object={laser.scene.clone()}
        scale={[2.5, 2.5, 2.5]} position={[ 3, 5, 1.5]} rotation={[0, Math.PI, 0]} />
      <primitive object={spotlight.scene.clone()}
        scale={[2.5, 2.5, 2.5]} position={[0, 6, 0.5]} />
    </group>
  )
}

export default Zone4Lasers
