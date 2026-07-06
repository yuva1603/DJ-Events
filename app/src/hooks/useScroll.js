import { useEffect, useRef } from 'react'
import useStore from '../store/appStore'
import { ZONES } from '../utils/constants'
import { clamp } from '../utils/math'

/**
 * useScroll — Passive scroll listener that maps window scroll position to
 * a normalized progress value (0 → 1) and derives the current zone (1–5).
 *
 * Writes: scrollProgress, currentZone → appStore
 */
const useScroll = () => {
  const setScrollProgress = useStore((s) => s.setScrollProgress)
  const setCurrentZone    = useStore((s) => s.setCurrentZone)
  const rafRef = useRef(null)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const scrollY  = window.scrollY
        const maxScroll = document.body.scrollHeight - window.innerHeight
        const progress  = maxScroll > 0 ? clamp(scrollY / maxScroll, 0, 1) : 0

        setScrollProgress(progress)

        // Derive active zone
        for (let i = ZONES.length - 1; i >= 0; i--) {
          if (progress >= ZONES[i].enter) {
            setCurrentZone(ZONES[i].id)
            break
          }
        }

        lastScrollY.current = scrollY
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll() // initialise on mount

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [setScrollProgress, setCurrentZone])
}

export default useScroll
