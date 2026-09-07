import { useEffect, useState } from 'react';

interface Props {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  'aria-label': string;
  id?: string;
}

/**
 * A number input that lets you empty it while typing without the value
 * snapping to 0 under your cursor, and only commits something parseable.
 */
export function NumberField({
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  disabled = false,
  id,
  'aria-label': ariaLabel,
}: Props) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => {
    setDraft(current => (Number(current) === value ? current : String(value)));
  }, [value]);

  function commit(raw: string) {
    setDraft(raw);
    if (raw.trim() === '') return;
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    onChange(parsed);
  }

  const input = (
    <input
      id={id}
      type="number"
      className="field field-num"
      inputMode="decimal"
      value={draft}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={e => commit(e.target.value)}
      onBlur={() => setDraft(String(value))}
    />
  );

  if (!suffix) return input;

  return (
    <div className="flex items-center gap-1.5">
      {input}
      <span className="text-xs shrink-0" style={{ color: 'var(--legend-dim)' }}>
        {suffix}
      </span>
    </div>
  );
}
