import { profileFor } from './chemistry';
import type { Chemistry, Device, Settings } from './types';

export function defaultSettings(): Settings {
  const chemistry: Chemistry = 'LiFePO4';
  return {
    systemVoltage: 12,
    chemistry,
    depthOfDischarge: profileFor(chemistry).depthOfDischarge,
    daysOfAutonomy: 2,
    inverterEfficiency: 0.9,
    // A UK winter figure. Plan for the worst month, not the average one.
    peakSunHours: 1.5,
    solarDerate: 0.75,
  };
}

export interface DevicePreset {
  name: string;
  watts: number;
  hoursPerDay: number;
  dutyCycle: number;
  surgeFactor: number;
  currentType: Device['currentType'];
}

/**
 * Starting points, not gospel. Every one of these should be replaced with the
 * figure off the actual appliance's plate once it is known.
 */
export const DEVICE_PRESETS: DevicePreset[] = [
  { name: 'LED cabin light', watts: 5, hoursPerDay: 5, dutyCycle: 1, surgeFactor: 1, currentType: 'DC' },
  { name: 'Compressor fridge', watts: 45, hoursPerDay: 24, dutyCycle: 0.35, surgeFactor: 3, currentType: 'DC' },
  { name: 'Water pump', watts: 60, hoursPerDay: 1, dutyCycle: 0.5, surgeFactor: 2, currentType: 'DC' },
  { name: 'Diesel heater', watts: 30, hoursPerDay: 8, dutyCycle: 0.4, surgeFactor: 4, currentType: 'DC' },
  { name: 'Laptop', watts: 60, hoursPerDay: 6, dutyCycle: 0.8, surgeFactor: 1, currentType: 'AC' },
  { name: 'Phone charging', watts: 12, hoursPerDay: 3, dutyCycle: 1, surgeFactor: 1, currentType: 'DC' },
  { name: 'Starlink', watts: 50, hoursPerDay: 8, dutyCycle: 1, surgeFactor: 1, currentType: 'AC' },
  { name: 'Induction hob', watts: 1800, hoursPerDay: 0.5, dutyCycle: 1, surgeFactor: 1, currentType: 'AC' },
  { name: 'Kettle', watts: 2000, hoursPerDay: 0.2, dutyCycle: 1, surgeFactor: 1, currentType: 'AC' },
  { name: 'Extractor fan', watts: 15, hoursPerDay: 4, dutyCycle: 1, surgeFactor: 2, currentType: 'DC' },
  { name: 'TV', watts: 60, hoursPerDay: 3, dutyCycle: 1, surgeFactor: 1, currentType: 'AC' },
  { name: 'Chart plotter', watts: 25, hoursPerDay: 6, dutyCycle: 1, surgeFactor: 1, currentType: 'DC' },
];

export function newDevice(preset?: DevicePreset): Device {
  return {
    id: crypto.randomUUID(),
    name: preset?.name ?? '',
    watts: preset?.watts ?? 0,
    quantity: 1,
    hoursPerDay: preset?.hoursPerDay ?? 1,
    dutyCycle: preset?.dutyCycle ?? 1,
    surgeFactor: preset?.surgeFactor ?? 1,
    currentType: preset?.currentType ?? 'DC',
  };
}
