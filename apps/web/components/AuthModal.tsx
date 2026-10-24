'use client'

import { useEffect, useRef } from 'react'
import { AuthForm } from './AuthForm.tsx'

/** The sign-in card in a dialog. Signing in closes it and leaves the page as it was, so the person can carry on. */
export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal auth-modal"
      aria-label="Sign in to Amplibee"
      onClose={onClose}
      onClick={(e) => {
        // a click on the backdrop lands on the dialog element itself
        if (e.target === ref.current) onClose()
      }}
    >
      {open ? (
        <div className="auth-modal-body">
          <button type="button" className="modal-x" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></svg>
          </button>
          <AuthForm onSuccess={onClose} />
        </div>
      ) : null}
    </dialog>
  )
}
