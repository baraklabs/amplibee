'use client'

import { type ClipboardEvent, type KeyboardEvent, useRef } from 'react'

/** Six digit boxes that behave as one field: typing moves on, backspace goes back, and a pasted code fills all six. */
export function OtpInput({ value, onChange, disabled, length = 6 }: { value: string; onChange: (v: string) => void; disabled?: boolean; length?: number }) {
  const refs = useRef<(HTMLInputElement | null)[]>([])
  const digits = Array.from({ length }, (_, i) => value[i] ?? '')

  const focus = (i: number) => refs.current[Math.max(0, Math.min(length - 1, i))]?.focus()

  function setAt(i: number, d: string) {
    const next = digits.slice()
    next[i] = d
    onChange(next.join('').slice(0, length))
  }

  function onInput(i: number, raw: string) {
    const clean = raw.replace(/\D/g, '')
    if (!clean) return setAt(i, '')
    if (clean.length === 1) {
      setAt(i, clean)
      return focus(i + 1)
    }
    // several digits at once (autofill or a fast paste): spread them from this box
    const next = digits.slice()
    clean.split('').slice(0, length - i).forEach((d, k) => { next[i + k] = d })
    onChange(next.join('').slice(0, length))
    focus(i + clean.length)
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      e.preventDefault()
      setAt(i - 1, '')
      focus(i - 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focus(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focus(i + 1)
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const clean = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!clean) return
    e.preventDefault()
    onChange(clean)
    focus(clean.length)
  }

  return (
    <div className="otp" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          className="otp-box"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={length}
          value={d}
          disabled={disabled}
          autoFocus={i === 0}
          aria-label={`Digit ${i + 1} of ${length}`}
          onChange={(e) => onInput(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  )
}
