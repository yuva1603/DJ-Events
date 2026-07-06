import { Suspense } from 'react'
import { Stars } from '@react-three/drei'
import Lighting       from './environment/Lighting'
import Postprocessing from './environment/Postprocessing'
import Particles      from './effects/Particles'
import CameraController from './camera/CameraController'
import Zone1Speaker   from './zones/Zone1Speaker'
import Zone2DJ        from './zones/Zone2DJ'
import Zone3Crowd     from './zones/Zone3Crowd'
import Zone4Lasers    from './zones/Zone4Lasers'
import Zone5Contact   from './zones/Zone5Contact'

/**
 * Scene — Top-level 3D scene assembly. All zones rendered simultaneously;
 * each manages its own scroll-driven opacity/visibility.
 */
const Scene = () => {
  return (
    <>
      {/* Camera */}
      <CameraController />

      {/* Environment */}
      <Lighting />
      <fog attach="fog" args={['#050508', 20, 60]} />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

      {/* GPU Particles (always present) */}
      <Particles />

      {/* Zones (scroll-driven opacity) */}
      <Suspense fallback={null}>
        <Zone1Speaker />
        <Zone2DJ />
        <Zone3Crowd />
        <Zone4Lasers />
        <Zone5Contact />
      </Suspense>

      {/* Post-processing */}
      <Postprocessing />
    </>
  )
}

export default Scene
