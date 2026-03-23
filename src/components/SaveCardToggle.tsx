import './SaveCardToggle.css'

interface SaveCardToggleProps {
  readonly checked: boolean
  readonly onChange: (checked: boolean) => void
}

export function SaveCardToggle({ checked, onChange }: SaveCardToggleProps) {
  return (
    <label className="save-card-toggle">
      <span className="toggle-label">Save card for future payments</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`toggle-track ${checked ? 'on' : ''}`}
        onClick={() => onChange(!checked)}
      >
        <span className="toggle-knob" />
      </button>
    </label>
  )
}
