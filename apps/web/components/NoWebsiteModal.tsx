'use client'

import { useEffect, useRef, useState } from 'react'
import { NoWebsiteForm } from './NoWebsiteForm.tsx'

/** "I don't have a website" link that opens the three-question form in a modal dialog. */
export function NoWebsiteModal() {
  const ref = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <>
      <button type="button" className="subtle-link link-btn" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        I don&rsquo;t have a website
      </button>
      <dialog
        ref={ref}
        className="modal"
        aria-labelledby="nw-title"
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // a click on the backdrop lands on the dialog element itself
          if (e.target === ref.current) setOpen(false)
        }}
      >
        {open ? (
          <div className="modal-body">
            <button type="button" className="modal-x" aria-label="Close" onClick={() => setOpen(false)}>
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
            </button>
            <h2 id="nw-title">Tell us about your business</h2>
            <p className="muted" style={{ marginBottom: 20 }}>We'll build your launch plan from your answers.</p>
            <NoWebsiteForm />
          </div>
        ) : null}
      </dialog>
    </>
  )
}
