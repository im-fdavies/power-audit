import { NumberField } from './NumberField';
import { CHEMISTRY_PROFILES, profileFor } from '../domain/chemistry';
import type { Chemistry, Settings, SystemVoltage } from '../domain/types';

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

const VOLTAGES: SystemVoltage[] = [12, 24, 48];

export function SettingsPanel({ settings, onChange }: Props) {
  const profile = profileFor(settings.chemistry);

  return (
    <section className="panel p-4" aria-label="System settings">
      <h2 className="text-sm font-semibold m-0">System</h2>
      <p className="text-xs m-0 mt-0.5 mb-4" style={{ color: 'var(--ink-soft)' }}>
        The assumptions the sizing rests on. Change these before you trust the numbers.
      </p>

      <div className="grid gap-4">
        <div>
          <span className="label">Battery voltage</span>
          <div className="flex gap-1.5" role="group" aria-label="Battery voltage">
            {VOLTAGES.map(v => (
              <button
                key={v}
                className="btn flex-1 tabular"
                aria-pressed={settings.systemVoltage === v}
                style={
                  settings.systemVoltage === v
                    ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' }
                    : undefined
                }
                onClick={() => onChange({ systemVoltage: v })}
              >
                {v}V
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="chemistry">
            Battery chemistry
          </label>
          <select
            id="chemistry"
            className="field"
            value={settings.chemistry}
            onChange={e => onChange({ chemistry: e.target.value as Chemistry })}
          >
            {Object.entries(CHEMISTRY_PROFILES).map(([key, p]) => (
              <option key={key} value={key}>
                {p.label}
              </option>
            ))}
          </select>
          <p className="text-xs m-0 mt-1.5" style={{ color: 'var(--ink-faint)' }}>
            {profile.note}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="dod">
              Depth of discharge
            </label>
            <NumberField
              id="dod"
              value={Math.round(settings.depthOfDischarge * 100)}
              min={10}
              max={100}
              step={5}
              suffix="%"
              aria-label="Depth of discharge percent"
              onChange={percent => onChange({ depthOfDischarge: percent / 100 })}
            />
          </div>

          <div>
            <label className="label" htmlFor="autonomy">
              Days of autonomy
            </label>
            <NumberField
              id="autonomy"
              value={settings.daysOfAutonomy}
              min={0.5}
              max={14}
              step={0.5}
              suffix="days"
              aria-label="Days of autonomy"
              onChange={daysOfAutonomy => onChange({ daysOfAutonomy })}
            />
          </div>

          <div>
            <label className="label" htmlFor="sun">
              Peak sun hours
            </label>
            <NumberField
              id="sun"
              value={settings.peakSunHours}
              min={0.1}
              max={12}
              step={0.1}
              suffix="h"
              aria-label="Peak sun hours"
              onChange={peakSunHours => onChange({ peakSunHours })}
            />
          </div>

          <div>
            <label className="label" htmlFor="derate">
              Array derate
            </label>
            <NumberField
              id="derate"
              value={Math.round(settings.solarDerate * 100)}
              min={30}
              max={100}
              step={5}
              suffix="%"
              aria-label="Array derate percent"
              onChange={percent => onChange({ solarDerate: percent / 100 })}
            />
          </div>

          <div>
            <label className="label" htmlFor="inverter-eff">
              Inverter efficiency
            </label>
            <NumberField
              id="inverter-eff"
              value={Math.round(settings.inverterEfficiency * 100)}
              min={50}
              max={100}
              step={1}
              suffix="%"
              aria-label="Inverter efficiency percent"
              onChange={percent => onChange({ inverterEfficiency: percent / 100 })}
            />
          </div>
        </div>

        <p className="text-xs m-0 pt-1" style={{ color: 'var(--ink-faint)' }}>
          Peak sun hours should be the worst month you intend to stay out in, not the yearly
          average. In the UK that is nearer 1 hour in December than the 4 you get in June.
        </p>
      </div>
    </section>
  );
}
