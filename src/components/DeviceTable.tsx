import { useState } from 'react';
import { DeviceRow } from './DeviceRow';
import { Tooltip } from './Tooltip';
import { DEVICE_PRESETS, type DevicePreset } from '../domain/presets';
import { formatWh } from '../domain/format';
import type { Device, SizingResult } from '../domain/types';

interface Props {
  result: SizingResult;
  onAdd: (preset?: DevicePreset) => void;
  onChange: (id: string, patch: Partial<Device>) => void;
  onRemove: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const HEADINGS: { label: string; hint?: string; align?: 'right' }[] = [
  {
    label: 'Device',
    hint: 'Just a label to keep track of. Nothing in the sizing depends on the name.',
  },
  {
    label: 'Watts',
    hint: 'Running draw of a single unit, off its rating plate. Not the startup figure - that goes in Surge.',
  },
  {
    label: 'Qty',
    hint: 'How many of this device you have. Four identical lights are one row with a quantity of four.',
  },
  {
    label: 'Hrs/day',
    hint: 'Hours a day the device is switched on, whether or not it is drawing the whole time.',
  },
  {
    label: 'Duty %',
    hint: 'Of those switched-on hours, the share it actually draws power. A fridge compressor cycles, so it sits nearer 35%. A light is either on or off, so it is 100%.',
  },
  {
    label: 'Surge x',
    hint: 'Startup inrush as a multiple of running watts. Motors and compressors pull three to five times for a moment; electronics pull one. Only affects the inverter rating.',
  },
  {
    label: 'Supply',
    hint: 'DC comes straight off the battery. AC goes through the inverter and carries its conversion losses.',
  },
  {
    label: 'Wh/day',
    hint: 'What this row costs you in a day: watts x quantity x hours x duty.',
    align: 'right',
  },
  { label: '' },
];

export function DeviceTable({ result, onAdd, onChange, onRemove, onDuplicate }: Props) {
  const [presetOpen, setPresetOpen] = useState(false);

  return (
    <section className="panel overflow-hidden" aria-label="Loads">
      <header
        className="flex items-center justify-between gap-3 px-4 py-3"
        style={{ borderBottom: '1px solid var(--line)' }}
      >
        <div>
          <h2 className="text-sm font-semibold m-0">Loads</h2>
          <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--ink-soft)' }}>
            Everything that will draw from the bank on a normal day.
          </p>
        </div>
        <div className="flex gap-2 relative">
          <button
            className="btn whitespace-nowrap"
            onClick={() => setPresetOpen(o => !o)}
            aria-expanded={presetOpen}
          >
            From a preset
          </button>
          <button className="btn btn-primary whitespace-nowrap" onClick={() => onAdd()}>
            Add device
          </button>

          {presetOpen && (
            <div
              className="panel absolute right-0 top-full mt-1 z-10 w-64 max-h-80 overflow-auto p-1"
              style={{ boxShadow: '0 10px 30px rgb(0 0 0 / 0.14)' }}
            >
              {DEVICE_PRESETS.map(preset => (
                <button
                  key={preset.name}
                  className="btn w-full text-left border-0 flex justify-between items-baseline gap-2"
                  onClick={() => {
                    onAdd(preset);
                    setPresetOpen(false);
                  }}
                >
                  <span>{preset.name}</span>
                  <span className="tabular text-xs" style={{ color: 'var(--ink-faint)' }}>
                    {preset.watts}W {preset.currentType}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {result.loads.length === 0 ? (
        <p className="px-4 py-10 text-center text-sm m-0" style={{ color: 'var(--ink-soft)' }}>
          No loads yet. Add a device, or start from a preset and correct it against the
          appliance's own rating plate.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm border-collapse">
            <thead>
              <tr style={{ background: 'var(--panel-sunk)' }}>
                {HEADINGS.map(h => (
                  <th
                    key={h.label}
                    scope="col"
                    className={`px-2 py-2 text-xs font-medium whitespace-nowrap ${
                      h.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                    style={{ color: 'var(--ink-soft)' }}
                  >
                    {h.hint ? <Tooltip label={h.hint}>{h.label}</Tooltip> : h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.loads.map(load => (
                <DeviceRow
                  key={load.device.id}
                  load={load}
                  onChange={patch => onChange(load.device.id, patch)}
                  onRemove={() => onRemove(load.device.id)}
                  onDuplicate={() => onDuplicate(load.device.id)}
                />
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid var(--line-strong)' }}>
                <td colSpan={7} className="px-2 py-2.5 text-xs font-medium">
                  At the loads, before inverter losses
                </td>
                <td className="px-2 py-2.5 text-right tabular text-sm font-semibold whitespace-nowrap">
                  {formatWh(result.acLoadWh + result.dcLoadWh)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </section>
  );
}
