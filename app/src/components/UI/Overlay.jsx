import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/appStore'
import { mapRange } from '../../utils/math'
import content from '../../data/content.json'

/**
 * NavBar — Fixed top navigation. Transparent → frosted glass on scroll.
 */
export const NavBar = () => {
  const scrollProgress = useStore((s) => s.scrollProgress)
  const openContactForm = useStore((s) => s.openContactForm)
  const scrolled = scrollProgress > 0.04

  return (
    <nav
      className="navbar"
      style={{ '--nav-bg': scrolled ? 'rgba(5,5,8,0.75)' : 'transparent' }}
      aria-label="Main navigation"
    >
      <a href="#" className="navbar-logo" aria-label="ZONO Events home">
        <span className="logo-text">ZONO</span>
        <span className="logo-dot">.</span>
      </a>

      <div className="navbar-links">
        {content.nav.map((item) => (
          <a key={item.label} href={item.href} className="nav-link">
            {item.label}
          </a>
        ))}
      </div>

      <button
        id="nav-book-btn"
        className="btn btn-primary"
        onClick={openContactForm}
        aria-label="Book an event"
      >
        Book Now
      </button>
    </nav>
  )
}

/**
 * AudioToggle — Bottom-left mute/unmute button.
 */
export const AudioToggle = () => {
  const audioMuted = useStore((s) => s.audioMuted)
  const toggleAudio = useStore((s) => s.toggleAudio)

  return (
    <button
      id="audio-toggle"
      className="audio-toggle"
      onClick={toggleAudio}
      aria-label={audioMuted ? 'Unmute audio' : 'Mute audio'}
      title={audioMuted ? 'Unmute' : 'Mute'}
    >
      <span className="audio-icon">{audioMuted ? '🔇' : '🔊'}</span>
    </button>
  )
}

/**
 * ScrollIndicator — Right-edge vertical progress bar + initial "Scroll" prompt.
 */
export const ScrollIndicator = () => {
  const scrollProgress = useStore((s) => s.scrollProgress)
  const preloaderDone  = useStore((s) => s.preloaderDone)

  return (
    <>
      <div className="scroll-bar" aria-hidden="true">
        <div className="scroll-bar-fill" style={{ height: `${scrollProgress * 100}%` }} />
      </div>

      <AnimatePresence>
        {preloaderDone && scrollProgress < 0.04 && (
          <motion.div
            className="scroll-prompt"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            aria-label="Scroll to explore"
          >
            <div className="scroll-prompt-text">Scroll</div>
            <div className="scroll-prompt-arrow">↓</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * ZoneOverlay — Animated text overlay for each zone.
 */
export const ZoneOverlay = () => {
  const scrollProgress = useStore((s) => s.scrollProgress)
  const preloaderDone  = useStore((s) => s.preloaderDone)
  const openContactForm = useStore((s) => s.openContactForm)

  if (!preloaderDone) return null

  const zones = content.zones
  const BREAKPOINTS = [
    { enter: 0.00, peak: 0.08, exit: 0.28 },
    { enter: 0.18, peak: 0.30, exit: 0.48 },
    { enter: 0.50, peak: 0.60, exit: 0.77 },
    { enter: 0.65, peak: 0.75, exit: 0.90 },
    { enter: 0.85, peak: 0.93, exit: 1.00 },
  ]

  const activeZone = BREAKPOINTS.reduce((found, bp, i) => {
    if (scrollProgress >= bp.enter && scrollProgress <= bp.exit) return i
    return found
  }, -1)

  const zoneData = activeZone >= 0 ? zones[activeZone] : null
  const bp       = activeZone >= 0 ? BREAKPOINTS[activeZone] : null

  const opacity = zoneData
    ? mapRange(scrollProgress, bp.enter, bp.peak, 0, 1) *
      mapRange(scrollProgress, bp.exit - 0.05, bp.exit, 1, 0)
    : 0

  const handleCtaClick = (e) => {
    if (zoneData?.cta?.href === '#contact') {
      e.preventDefault()
      openContactForm()
    }
  }

  return (
    <div className="zone-overlay" aria-live="polite">
      <AnimatePresence mode="wait">
        {zoneData && (
          <motion.div
            key={activeZone}
            className="zone-card"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: opacity, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ opacity }}
          >
            <span className="zone-eyebrow">{zoneData.eyebrow}</span>
            <h2 className="zone-headline">
              {zoneData.headline.split('\n').map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </h2>
            <p className="zone-description">{zoneData.description}</p>
            <a
              href={zoneData.cta.href}
              className="btn btn-ghost zone-cta"
              id={`zone-${activeZone + 1}-cta`}
              onClick={handleCtaClick}
            >
              {zoneData.cta.text} →
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
