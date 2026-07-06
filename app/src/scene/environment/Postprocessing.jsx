import { Suspense } from 'react'
import { EffectComposer, Bloom, FXAA, DepthOfField } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'
import useStore from '../../store/appStore'

/**
 * Postprocessing — Bloom + FXAA always; Depth-of-Field on desktop Zone 5 only.
 * Mobile: bloom only for performance.
 */
const Postprocessing = () => {
  const isMobile    = useStore((s) => s.isMobile)
  const isTablet    = useStore((s) => s.isTablet)
  const currentZone = useStore((s) => s.currentZone)

  const showDOF = !isMobile && !isTablet && currentZone === 5

  return (
    <EffectComposer>
      <Bloom
        intensity={isMobile ? 0.5 : 0.8}
        kernelSize={isMobile ? KernelSize.SMALL : KernelSize.MEDIUM}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.9}
        blendFunction={BlendFunction.ADD}
      />
      {!isMobile && <FXAA />}
      {showDOF && (
        <DepthOfField
          focusDistance={0.02}
          focalLength={0.5}
          bokehScale={2}
        />
      )}
    </EffectComposer>
  )
}

export default Postprocessing
