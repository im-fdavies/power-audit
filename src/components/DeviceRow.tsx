import { NumberField } from './NumberField';
import { formatWh } from '../domain/format';
import type { Device, DeviceLoad } from '../domain/types';

interface Props {
  load: DeviceLoad;
  onChange: (patch: Partial<Device>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export function DeviceRow({ load, onChange, onRemove, onDuplicate }: Props) {
  const { device } = load;
  const label = device.name || 'this device';

  return (
    <tr style={{ borderTop: '1px solid var(--line)' }}>
      <td className="p-2 min-w-44">
        <input
          className="field"
          value={device.name}
          placeholder="Device name"
          aria-label="Device name"
          onChange={e => onChange({ name: e.target.value })}
        />
      </td>

      <td className="p-2 w-24">
        <NumberField
          value={device.watts}
          min={0}
          step={1}
          aria-label={`Watts for ${label}`}
          onChange={watts => onChange({ watts })}
        />
      </td>

      <td className="p-2 w-20">
        <NumberField
          value={device.quantity}
          min={0}
          step={1}
          aria-label={`Quantity of ${label}`}
          onChange={quantity => onChange({ quantity })}
        />
      </td>

      <td className="p-2 w-24">
        <NumberField
          value={device.hoursPerDay}
          min={0}
          max={24}
          step={0.5}
          aria-label={`Hours per day for ${label}`}
          onChange={hoursPerDay => onChange({ hoursPerDay })}
        />
      </td>

      <td className="p-2 w-24">
        <NumberField
          value={Math.round(device.dutyCycle * 100)}
          min={1}
          max={100}
          step={5}
          aria-label={`Duty cycle percent for ${label}`}
          onChange={percent => onChange({ dutyCycle: percent / 100 })}
        />
      </td>

      <td className="p-2 w-24">
        <NumberField
          value={device.surgeFactor}
          min={1}
          max={10}
          step={0.5}
          aria-label={`Surge factor for ${label}`}
          onChange={surgeFactor => onChange({ surgeFactor })}
        />
      </td>

      <td className="p-2 w-24">
        <select
          className="field"
          value={device.currentType}
          aria-label={`Supply type for ${label}`}
          onChange={e => onChange({ currentType: e.target.value as Device['currentType'] })}
        >
          <option value="DC">DC</option>
          <option value="AC">AC</option>
        </select>
      </td>

      <td className="p-2 text-right tabular text-sm whitespace-nowrap">
        {formatWh(load.dailyWh)}
      </td>

      <td className="p-2">
        <div className="flex gap-1 justify-end">
          <button className="btn" onClick={onDuplicate} aria-label={`Duplicate ${label}`}>
            Copy
          </button>
          <button className="btn" onClick={onRemove} aria-label={`Remove ${label}`}>
            Remove
          </button>
        </div>
      </td>
    </tr>
  );
}
