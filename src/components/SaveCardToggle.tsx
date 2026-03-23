interface SaveCardToggleProps {
  readonly checked: boolean
  readonly onChange: (checked: boolean) => void
}

export function SaveCardToggle({ checked, onChange }: SaveCardToggleProps) {
  return (
    <label className="flex items-center justify-between py-4 mb-6 cursor-pointer">
      <span className="font-sans text-base text-text-secondary">
        Save card for future payments
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`relative w-11 h-6 border-none rounded-full cursor-pointer p-0 shrink-0 transition-colors duration-100 ease-out focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2 ${
          checked ? 'bg-accent' : 'bg-bg-surface-alt'
        }`}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-100 ease-out pointer-events-none ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </label>
  )
}
