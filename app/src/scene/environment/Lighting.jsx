import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import useStore from '../../store/appStore'

/**
 * Lighting — All scene lights.
 * Key light rotates slowly. Spot lights pulse with scroll zone.
 * Point lights provide neon cyan/purple accent fills.
 */
const Lighting = () => {
  const dirRef = useRef()
  const sp1Ref = useRef()
  const sp2Ref = useRef()
  const sp3Ref = useRef()
  const sp4Ref = useRef()
  const scrollProgress = useStore((s) => s.scrollProgress)
  const currentZone    = useStore((s) => s.currentZone)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()

    // Directional key light slowly orbits
    if (dirRef.current) {
      dirRef.current.position.set(
        Math.sin(t * 0.15) * 10,
        8,
        Math.cos(t * 0.15) * 10
      )
    }

    // Spot light intensity based on zone
    const spIntensity = currentZone >= 3 ? 80 : 30
    if (sp1Ref.current) sp1Ref.current.intensity = spIntensity + Math.sin(t * 2) * 10
    if (sp2Ref.current) sp2Ref.current.intensity = spIntensity + Math.sin(t * 2 + 1) * 10
    if (sp3Ref.current) sp3Ref.current.intensity = spIntensity + Math.sin(t * 2 + 2) * 10
    if (sp4Ref.current) sp4Ref.current.intensity = spIntensity + Math.sin(t * 2 + 3) * 10
  })

  return (
    <>
      {/* Soft ambient fill */}
      <ambientLight intensity={0.25} color="#1a0a2e" />

      {/* Key light (slowly orbiting) */}
      <directionalLight
        ref={dirRef}
        position={[10, 8, 5]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Stage spot lights */}
      <spotLight ref={sp1Ref} position={[-8, 12, 2]}  angle={0.3} penumbra={0.6} intensity={50} color="#00d4ff" castShadow={false} />
      <spotLight ref={sp2Ref} position={[ 8, 12, 2]}  angle={0.3} penumbra={0.6} intensity={50} color="#7b2fff" castShadow={false} />
      <spotLight ref={sp3Ref} position={[-6, 10, -8]} angle={0.4} penumbra={0.8} intensity={30} color="#ff0080" castShadow={false} />
      <spotLight ref={sp4Ref} position={[ 6, 10, -8]} angle={0.4} penumbra={0.8} intensity={30} color="#00d4ff" castShadow={false} />

      {/* Neon point light accents */}
      <pointLight position={[0,  1, 5]}  intensity={20} color="#00d4ff" distance={12} decay={2} />
      <pointLight position={[0,  1, -5]} intensity={20} color="#7b2fff" distance={12} decay={2} />
      <pointLight position={[-4, 2, 0]}  intensity={15} color="#ff0080" distance={8}  decay={2} />
      <pointLight position={[ 4, 2, 0]}  intensity={15} color="#00d4ff" distance={8}  decay={2} />
    </>
  )
}

export default Lighting
