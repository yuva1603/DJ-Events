import { useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useStore from '../../store/appStore'

const EVENT_TYPES = [
  'Corporate Event',
  'Private Party',
  'Festival / Concert',
  'Wedding',
  'Club Night',
  'Brand Activation',
  'Other',
]

/**
 * ContactForm — Modal booking form with validation and animated success state.
 * Accessible: ARIA labels, linked error messages, focus management.
 */
const ContactForm = () => {
  const formId = useId()
  const contactFormOpen = useStore((s) => s.contactFormOpen)
  const closeContactForm = useStore((s) => s.closeContactForm)

  const [form, setForm] = useState({
    name: '', email: '', date: '', eventType: '', attendees: '', message: ''
  })
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const validate = () => {
    const e = {}
    if (!form.name.trim())   e.name  = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required'
    if (!form.date)          e.date  = 'Event date is required'
    if (!form.eventType)     e.eventType = 'Please select event type'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const e2 = validate()
    if (Object.keys(e2).length) { setErrors(e2); return }
    // In production: send to EmailJS / API
    console.log('Form submitted:', form)
    setSubmitted(true)
  }

  const handleClose = () => {
    closeContactForm()
    setTimeout(() => { setSubmitted(false); setForm({ name:'',email:'',date:'',eventType:'',attendees:'',message:'' }) }, 400)
  }

  return (
    <AnimatePresence>
      {contactFormOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          aria-hidden="true"
        >
          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Book an Event"
            className="modal"
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()} // Prevent clicking modal from closing it
          >
            <button
              className="modal-close"
              onClick={handleClose}
              aria-label="Close booking form"
            >✕</button>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  className="form-success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="success-icon">✓</div>
                  <h3>We've Got You!</h3>
                  <p>Your booking inquiry has been received. Our team will contact you within 24 hours.</p>
                  <button className="btn btn-primary" onClick={handleClose}>Close</button>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <div className="modal-header">
                    <h2 id={`${formId}-title`} className="modal-title">Book an Event</h2>
                    <p className="modal-subtitle">Tell us about your vision — we'll build the experience.</p>
                  </div>

                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    aria-labelledby={`${formId}-title`}
                    className="contact-form"
                  >
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`${formId}-name`}>Your Name *</label>
                        <input
                          id={`${formId}-name`}
                          name="name"
                          type="text"
                          value={form.name}
                          onChange={handleChange}
                          placeholder="Alex Johnson"
                          aria-required="true"
                          aria-describedby={errors.name ? `${formId}-name-err` : undefined}
                          className={errors.name ? 'input-error' : ''}
                        />
                        {errors.name && <span id={`${formId}-name-err`} className="error-msg" role="alert">{errors.name}</span>}
                      </div>
                      <div className="form-group">
                        <label htmlFor={`${formId}-email`}>Email Address *</label>
                        <input
                          id={`${formId}-email`}
                          name="email"
                          type="email"
                          value={form.email}
                          onChange={handleChange}
                          placeholder="alex@company.com"
                          aria-required="true"
                          aria-describedby={errors.email ? `${formId}-email-err` : undefined}
                          className={errors.email ? 'input-error' : ''}
                        />
                        {errors.email && <span id={`${formId}-email-err`} className="error-msg" role="alert">{errors.email}</span>}
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor={`${formId}-date`}>Event Date *</label>
                        <input
                          id={`${formId}-date`}
                          name="date"
                          type="date"
                          value={form.date}
                          onChange={handleChange}
                          aria-required="true"
                          className={errors.date ? 'input-error' : ''}
                          min={new Date().toISOString().split('T')[0]}
                        />
                        {errors.date && <span className="error-msg" role="alert">{errors.date}</span>}
                      </div>
                      <div className="form-group">
                        <label htmlFor={`${formId}-eventType`}>Event Type *</label>
                        <select
                          id={`${formId}-eventType`}
                          name="eventType"
                          value={form.eventType}
                          onChange={handleChange}
                          className={errors.eventType ? 'input-error' : ''}
                        >
                          <option value="">Select type…</option>
                          {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        {errors.eventType && <span className="error-msg" role="alert">{errors.eventType}</span>}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor={`${formId}-attendees`}>Expected Attendees</label>
                      <input
                        id={`${formId}-attendees`}
                        name="attendees"
                        type="number"
                        value={form.attendees}
                        onChange={handleChange}
                        placeholder="e.g. 500"
                        min="10"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor={`${formId}-message`}>Your Vision</label>
                      <textarea
                        id={`${formId}-message`}
                        name="message"
                        rows={4}
                        value={form.message}
                        onChange={handleChange}
                        placeholder="Describe the vibe, venue, any special requirements…"
                      />
                    </div>

                    <button type="submit" id="form-submit-btn" className="btn btn-primary btn-full">
                      Send Inquiry →
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ContactForm
