import { useEffect, useRef } from 'react'
import { useProgress } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../store/appStore'

/**
 * Preloader — Full-screen loading screen that fades out when the 3D scene is ready.
 */
const Preloader = () => {
  const { progress } = useProgress()
  const setPreloaderDone = useStore((s) => s.setPreloaderDone)
  const preloaderDone    = useStore((s) => s.preloaderDone)

  useEffect(() => {
    if (progress === 100) {
      const t = setTimeout(setPreloaderDone, 800)
      return () => clearTimeout(t)
    }
  }, [progress, setPreloaderDone])

  return (
    <AnimatePresence>
      {!preloaderDone && (
        <motion.div
          className="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
        >
          <div className="preloader-inner">
            <div className="preloader-logo">ZONO</div>
            <div className="preloader-bar-wrap">
              <div
                className="preloader-bar"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="preloader-pct">{Math.round(progress)}%</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Preloader
