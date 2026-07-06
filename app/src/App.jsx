import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import useStore from './store/appStore'
import useScroll from './hooks/useScroll'
import useScrollVelocity from './hooks/useScrollVelocity'
import useDevice from './hooks/useDevice'
import Scene from './scene/Scene'
import Preloader from './components/Preloader'
import ErrorBoundary from './components/ErrorBoundary'
import { NavBar, AudioToggle, ScrollIndicator, ZoneOverlay } from './components/UI/Overlay'
import ContactForm from './components/UI/ContactForm'
import Footer from './components/UI/Footer'
import './styles/globals.css'

/**
 * App — Root component.
 * Layout: fixed Canvas (3D background) + fixed UI layer (HTML overlay) + scrollable Footer.
 */
const App = () => {
  // Activate global hooks
  useScroll()
  useScrollVelocity()
  useDevice()

  const devicePixelRatio = useStore((s) => s.devicePixelRatio)
  const prefersReducedMotion = useStore((s) => s.prefersReducedMotion)

  return (
    <>
      {/* Skip-to-content for accessibility */}
      <a href="#contact" className="sr-only focus:not-sr-only" style={{
        position: 'absolute', top: 8, left: 8, zIndex: 200,
        padding: '0.5rem 1rem', background: 'var(--cyan)',
        color: '#000', borderRadius: '4px', fontWeight: 600,
        opacity: 0, transform: 'translateY(-100%)',
        transition: 'opacity 0.2s, transform 0.2s',
      }}
      onFocus={(e) => { e.target.style.opacity = 1; e.target.style.transform = 'translateY(0)' }}
      onBlur={(e)  => { e.target.style.opacity = 0; e.target.style.transform = 'translateY(-100%)' }}
      >
        Skip to booking form
      </a>

      {/* 3D Canvas — fixed background */}
      <div id="canvas-container" aria-hidden="true">
        <ErrorBoundary>
          <Canvas
            camera={{ position: [0, 8, 15], fov: 75, near: 0.1, far: 200 }}
            dpr={[0.5, devicePixelRatio]}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: false,
            }}
            style={{ background: '#050508' }}
            shadows
          >
            <AdaptiveDpr pixelated />
            <AdaptiveEvents />
            <Suspense fallback={null}>
              {!prefersReducedMotion && <Scene />}
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* Preloader */}
      <Preloader />

      {/* Fixed UI overlay */}
      <div className="ui-layer">
        <NavBar />
        <ZoneOverlay />
        <ScrollIndicator />
        <AudioToggle />
      </div>

      {/* Scroll spacer — creates scrollable height for the 3D journey */}
      <div className="scroll-spacer" aria-hidden="true" />

      {/* Contact modal */}
      <ContactForm />

      {/* Footer — scrollable, sits below the 3D zones */}
      <Footer />
    </>
  )
}

export default App
