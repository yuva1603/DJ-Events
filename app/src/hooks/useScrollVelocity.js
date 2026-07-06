import { useEffect, useRef } from 'react'
import useStore from '../store/appStore'
import { clamp } from '../utils/math'

/**
 * useScrollVelocity — Tracks scroll speed in pixels/ms (absolute value).
 * Writes: scrollVelocity → appStore
 */
const useScrollVelocity = () => {
  const setScrollVelocity = useStore((s) => s.setScrollVelocity)
  const lastY   = useRef(window.scrollY)
  const lastT   = useRef(performance.now())
  const rafRef  = useRef(null)

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const now  = performance.now()
        const dy   = Math.abs(window.scrollY - lastY.current)
        const dt   = now - lastT.current || 1
        const vel  = clamp(dy / dt, 0, 20)

        setScrollVelocity(vel)
        lastY.current = window.scrollY
        lastT.current = now

        // Decay velocity to 0 when scroll stops
        setTimeout(() => setScrollVelocity(0), 150)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [setScrollVelocity])
}

export default useScrollVelocity
