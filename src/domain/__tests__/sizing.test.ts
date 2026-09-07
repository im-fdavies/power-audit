import { describe, expect, it } from 'vitest';
import { calculateSystem, deviceLoad } from '../sizing';
import { defaultSettings } from '../presets';
import type { Device, Settings } from '../types';

function device(overrides: Partial<Device> = {}): Device {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    name: 'Test device',
    watts: 100,
    quantity: 1,
    hoursPerDay: 1,
    dutyCycle: 1,
    surgeFactor: 1,
    currentType: 'DC',
    ...overrides,
  };
}

function settings(overrides: Partial<Settings> = {}): Settings {
  return { ...defaultSettings(), ...overrides };
}

describe('deviceLoad', () => {
  it('multiplies watts by quantity and by genuinely-on hours', () => {
    const load = deviceLoad(device({ watts: 50, quantity: 2, hoursPerDay: 10, dutyCycle: 0.5 }));
    expect(load.connectedWatts).toBe(100);
    expect(load.effectiveHours).toBe(5);
    expect(load.dailyWh).toBe(500);
  });

  it('treats duty cycle as the whole point of a cycling fridge', () => {
    const alwaysOn = deviceLoad(device({ watts: 45, hoursPerDay: 24, dutyCycle: 1 }));
    const cycling = deviceLoad(device({ watts: 45, hoursPerDay: 24, dutyCycle: 0.35 }));
    expect(alwaysOn.dailyWh).toBe(1080);
    expect(cycling.dailyWh).toBeCloseTo(378, 5);
  });

  it('clamps nonsense input rather than producing NaN', () => {
    const load = deviceLoad(
      device({ watts: Number.NaN, quantity: -3, hoursPerDay: 99, dutyCycle: 5 }),
    );
    expect(load.connectedWatts).toBe(0);
    expect(load.effectiveHours).toBe(24);
    expect(load.dailyWh).toBe(0);
  });

  it('floors fractional quantities', () => {
    expect(deviceLoad(device({ watts: 10, quantity: 2.9 })).connectedWatts).toBe(20);
  });
});

describe('calculateSystem energy', () => {
  it('charges DC loads nothing for conversion', () => {
    const result = calculateSystem(
      [device({ watts: 100, hoursPerDay: 10, currentType: 'DC' })],
      settings({ inverterEfficiency: 0.9 }),
    );
    expect(result.dcLoadWh).toBe(1000);
    expect(result.inverterLossWh).toBe(0);
    expect(result.totalDailyWh).toBe(1000);
  });

  it('taxes AC loads by inverter efficiency', () => {
    const result = calculateSystem(
      [device({ watts: 100, hoursPerDay: 10, currentType: 'AC' })],
      settings({ inverterEfficiency: 0.8 }),
    );
    expect(result.acLoadWh).toBe(1000);
    expect(result.totalDailyWh).toBeCloseTo(1250, 5);
    expect(result.inverterLossWh).toBeCloseTo(250, 5);
  });

  it('converts to amp-hours at the system voltage', () => {
    const load = [device({ watts: 120, hoursPerDay: 10, currentType: 'DC' })];
    const at12 = calculateSystem(load, settings({ systemVoltage: 12 }));
    const at24 = calculateSystem(load, settings({ systemVoltage: 24 }));
    expect(at12.totalDailyAh).toBe(100);
    expect(at24.totalDailyAh).toBe(50);
    expect(at12.totalDailyWh).toBe(at24.totalDailyWh);
  });

  it('returns a zeroed but finite result with no devices', () => {
    const result = calculateSystem([], settings());
    expect(result.totalDailyWh).toBe(0);
    expect(result.batteryBankAh).toBe(0);
    expect(result.solarArrayWatts).toBe(0);
    expect(result.inverterContinuousWatts).toBe(0);
    expect(Number.isNaN(result.chargeControllerAmps)).toBe(false);
  });
});

describe('battery bank sizing', () => {
  it('divides by depth of discharge and multiplies by autonomy', () => {
    const result = calculateSystem(
      [device({ watts: 120, hoursPerDay: 10, currentType: 'DC' })],
      settings({ systemVoltage: 12, daysOfAutonomy: 2, depthOfDischarge: 0.8 }),
    );
    // 100Ah/day, 2 days of it, usable down to 80% of nominal.
    expect(result.usableAhRequired).toBe(200);
    expect(result.batteryBankAh).toBe(250);
    expect(result.batteryBankWh).toBe(3000);
  });

  it('does not apply round-trip efficiency to storage', () => {
    // Storage is about what the bank hands over. Charging losses are a separate
    // cost and belong in the solar figure, not in the bank size.
    const load = [device({ watts: 120, hoursPerDay: 10, currentType: 'DC' })];
    const lithium = calculateSystem(load, settings({ chemistry: 'LiFePO4', depthOfDischarge: 0.5 }));
    const flooded = calculateSystem(load, settings({ chemistry: 'Flooded', depthOfDischarge: 0.5 }));
    expect(lithium.batteryBankAh).toBe(flooded.batteryBankAh);
    expect(flooded.solarArrayWatts).toBeGreaterThan(lithium.solarArrayWatts);
  });
});

describe('solar sizing', () => {
  it('replaces the daily load plus round-trip losses within the sun hours available', () => {
    const result = calculateSystem(
      [device({ watts: 100, hoursPerDay: 10, currentType: 'DC' })],
      settings({ chemistry: 'LiFePO4', peakSunHours: 4, solarDerate: 1 }),
    );
    // 1000Wh out, 0.95 round trip, so 1052.6Wh in over 4 sun hours.
    expect(result.dailyRechargeWh).toBeCloseTo(1052.63, 2);
    expect(result.solarArrayWatts).toBeCloseTo(263.16, 2);
  });

  it('needs a bigger array as sun hours fall', () => {
    const load = [device({ watts: 100, hoursPerDay: 10 })];
    const summer = calculateSystem(load, settings({ peakSunHours: 5 }));
    const winter = calculateSystem(load, settings({ peakSunHours: 1 }));
    expect(winter.solarArrayWatts).toBeCloseTo(summer.solarArrayWatts * 5, 5);
  });

  it('grows the array to cover derate losses', () => {
    const load = [device({ watts: 100, hoursPerDay: 10 })];
    const ideal = calculateSystem(load, settings({ solarDerate: 1 }));
    const real = calculateSystem(load, settings({ solarDerate: 0.75 }));
    expect(real.solarArrayWatts).toBeCloseTo(ideal.solarArrayWatts / 0.75, 5);
  });
});

describe('inverter sizing', () => {
  it('stays at zero when nothing runs on AC', () => {
    const result = calculateSystem([device({ currentType: 'DC', watts: 500 })], settings());
    expect(result.inverterContinuousWatts).toBe(0);
    expect(result.inverterSurgeWatts).toBe(0);
  });

  it('sizes continuous on every AC load at once, with headroom', () => {
    const result = calculateSystem(
      [
        device({ watts: 1000, currentType: 'AC' }),
        device({ watts: 200, quantity: 2, currentType: 'AC' }),
      ],
      settings(),
    );
    expect(result.inverterContinuousWatts).toBe(1400 * 1.25);
  });

  it('sizes surge on the worst starter landing on top of the rest', () => {
    const result = calculateSystem(
      [
        device({ watts: 500, surgeFactor: 3, currentType: 'AC' }),
        device({ watts: 200, surgeFactor: 1, currentType: 'AC' }),
      ],
      settings(),
    );
    // 500W device surges to 1500W while the 200W device keeps running.
    expect(result.inverterSurgeWatts).toBe(1700);
  });

  it('never reports a surge below the continuous rating', () => {
    const result = calculateSystem(
      [device({ watts: 1000, surgeFactor: 1, currentType: 'AC' })],
      settings(),
    );
    expect(result.inverterSurgeWatts).toBe(result.inverterContinuousWatts);
  });

  it('ignores DC loads when sizing the inverter but not the battery', () => {
    const result = calculateSystem(
      [
        device({ watts: 300, currentType: 'AC', hoursPerDay: 1 }),
        device({ watts: 900, currentType: 'DC', hoursPerDay: 1 }),
      ],
      settings(),
    );
    expect(result.inverterContinuousWatts).toBe(375);
    expect(result.totalDailyWh).toBeGreaterThan(1200);
  });
});

describe('charge controller sizing', () => {
  it('sizes on array watts over system voltage, with margin', () => {
    const result = calculateSystem(
      [device({ watts: 100, hoursPerDay: 10 })],
      settings({ systemVoltage: 12, peakSunHours: 4, solarDerate: 1, chemistry: 'LiFePO4' }),
    );
    expect(result.chargeControllerAmps).toBeCloseTo((263.16 / 12) * 1.25, 2);
  });

  it('reports what the chemistry can accept', () => {
    const load = [device({ watts: 120, hoursPerDay: 10 })];
    const lithium = calculateSystem(load, settings({ chemistry: 'LiFePO4', depthOfDischarge: 0.8 }));
    const gel = calculateSystem(load, settings({ chemistry: 'Gel', depthOfDischarge: 0.8 }));
    expect(lithium.maxChargeCurrentA).toBeCloseTo(lithium.batteryBankAh * 0.5, 5);
    expect(gel.maxChargeCurrentA).toBeCloseTo(gel.batteryBankAh * 0.2, 5);
  });
});

describe('warnings', () => {
  it('asks for a device when there are none', () => {
    const result = calculateSystem([], settings());
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0]?.message).toMatch(/add a device/i);
  });

  it('flags a device that draws nothing', () => {
    const result = calculateSystem([device({ name: 'Ghost light', watts: 0 })], settings());
    expect(result.warnings.some(w => w.message.includes('Ghost light'))).toBe(true);
  });

  it('flags a depth of discharge beyond what the chemistry likes', () => {
    const result = calculateSystem(
      [device({ watts: 100, hoursPerDay: 5 })],
      settings({ chemistry: 'AGM', depthOfDischarge: 0.9 }),
    );
    expect(result.warnings.some(w => /depth of discharge/i.test(w.message))).toBe(true);
  });

  it('flags a big 12V bank as a case for moving to 24V', () => {
    const result = calculateSystem(
      [device({ watts: 500, hoursPerDay: 12, currentType: 'DC' })],
      settings({ systemVoltage: 12 }),
    );
    expect(result.batteryBankAh).toBeGreaterThan(600);
    expect(result.warnings.some(w => /24V/.test(w.message))).toBe(true);
  });

  it('stays quiet on a sane small system', () => {
    const result = calculateSystem(
      [device({ name: 'LED light', watts: 5, quantity: 4, hoursPerDay: 5 })],
      settings({ chemistry: 'LiFePO4', depthOfDischarge: 0.8, systemVoltage: 12 }),
    );
    expect(result.warnings).toHaveLength(0);
  });
});
