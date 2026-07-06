import { useEffect } from 'react'
import useStore from '../store/appStore'

/**
 * useDevice — Detects device type, pixel ratio, and motion preferences.
 * Writes: isMobile, isTablet, devicePixelRatio, prefersReducedMotion → appStore
 */
const useDevice = () => {
  const setDevice = useStore((s) => s.setDevice)

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setDevice({
        isMobile:             w <= 768,
        isTablet:             w > 768 && w <= 1024,
        devicePixelRatio:     Math.min(window.devicePixelRatio, 2),
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      })
    }

    update()

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    mq.addEventListener('change', update)
    window.addEventListener('resize', update)

    return () => {
      mq.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [setDevice])
}

export default useDevice
