'use client'

import { useState } from 'react'

/** One text field and an Add button. `onAdd` returns an error message to show, or null when it took the value. */
export function AddRow({ label, placeholder, disabled, onAdd, button = 'Add' }: { label: string; placeholder: string; disabled?: boolean; onAdd: (value: string) => string | null; button?: string }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    const err = onAdd(value)
    setError(err)
    if (!err) setValue('')
  }

  return (
    <form className="add-row" onSubmit={submit}>
      <label className="label" htmlFor={`add-${label}`}>{label}</label>
      <div className="add-row-fields">
        <input id={`add-${label}`} value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} disabled={disabled} autoComplete="off" />
        <button type="submit" className="btn" disabled={disabled || !value.trim()}>{button}</button>
      </div>
      {error ? <p className="field-error" role="alert">{error}</p> : null}
    </form>
  )
}
