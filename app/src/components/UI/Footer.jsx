import useStore from '../../store/appStore'
import content from '../../data/content.json'

/**
 * Footer — Bottom section with events, social links, and newsletter signup.
 */
const Footer = () => {
  const openContactForm = useStore((s) => s.openContactForm)

  return (
    <footer className="footer" id="contact" aria-label="Site footer">
      <div className="footer-inner">

        {/* Brand column */}
        <div className="footer-brand">
          <div className="footer-logo">ZONO<span className="logo-dot">.</span></div>
          <p className="footer-tagline">{content.company.tagline}</p>
          <div className="footer-social">
            <a href={content.company.instagram} target="_blank" rel="noopener noreferrer"
              aria-label="Instagram" className="social-link">IG</a>
            <a href={content.company.tiktok} target="_blank" rel="noopener noreferrer"
              aria-label="TikTok" className="social-link">TK</a>
            <a href={content.company.facebook} target="_blank" rel="noopener noreferrer"
              aria-label="Facebook" className="social-link">FB</a>
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="footer-events">
          <h3 className="footer-heading">Upcoming Events</h3>
          <ul className="events-list" aria-label="Upcoming events">
            {content.events.map((ev) => (
              <li key={ev.title} className="event-item">
                <span className="event-title">{ev.title}</span>
                <span className="event-meta">{ev.date} · {ev.city}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact column */}
        <div className="footer-contact">
          <h3 className="footer-heading">Get In Touch</h3>
          <a href={`mailto:${content.company.email}`} className="footer-email">
            {content.company.email}
          </a>
          <p className="footer-phone">{content.company.phone}</p>
          <button id="footer-book-btn" className="btn btn-primary" onClick={openContactForm}>
            Book an Event
          </button>
        </div>

        {/* Newsletter */}
        <div className="footer-newsletter">
          <h3 className="footer-heading">Stay in the Loop</h3>
          <p className="footer-newsletter-sub">Get first access to events and exclusives.</p>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input
              id="newsletter-email"
              type="email"
              placeholder="your@email.com"
              aria-label="Email for newsletter"
              required
            />
            <button type="submit" id="newsletter-submit" className="btn btn-ghost">→</button>
          </form>
        </div>

      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} ZONO Events. All rights reserved.</p>
        <div className="footer-legal">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
