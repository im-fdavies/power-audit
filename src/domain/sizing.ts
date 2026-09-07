import { profileFor } from './chemistry';
import type { Device, DeviceLoad, Settings, SizingResult, Warning } from './types';

/** Headroom on the inverter's continuous rating, so it is not run at its limit. */
const INVERTER_HEADROOM = 1.25;
/** Margin on the charge controller, covering cold-weather over-panelling. */
const CONTROLLER_MARGIN = 1.25;

function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function positive(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export function deviceLoad(device: Device): DeviceLoad {
  const quantity = Math.max(0, Math.floor(positive(device.quantity)));
  const watts = positive(device.watts);
  const hours = clamp(device.hoursPerDay, 0, 24);
  const duty = clamp(device.dutyCycle, 0, 1);

  const effectiveHours = hours * duty;
  const connectedWatts = watts * quantity;

  return {
    device,
    effectiveHours,
    connectedWatts,
    dailyWh: connectedWatts * effectiveHours,
  };
}

export function calculateSystem(devices: Device[], settings: Settings): SizingResult {
  const chemistry = profileFor(settings.chemistry);

  const systemVoltage = settings.systemVoltage;
  const depthOfDischarge = clamp(settings.depthOfDischarge, 0.1, 1);
  const daysOfAutonomy = clamp(settings.daysOfAutonomy, 0.5, 14);
  const inverterEfficiency = clamp(settings.inverterEfficiency, 0.5, 1);
  const peakSunHours = clamp(settings.peakSunHours, 0.1, 12);
  const solarDerate = clamp(settings.solarDerate, 0.3, 1);

  const loads = devices.map(deviceLoad);
  const acLoads = loads.filter(l => l.device.currentType === 'AC');
  const dcLoads = loads.filter(l => l.device.currentType === 'DC');

  const acLoadWh = acLoads.reduce((sum, l) => sum + l.dailyWh, 0);
  const dcLoadWh = dcLoads.reduce((sum, l) => sum + l.dailyWh, 0);

  // The inverter only taxes AC energy, and only while it is converting.
  const acDrawWh = acLoadWh > 0 ? acLoadWh / inverterEfficiency : 0;
  const inverterLossWh = acDrawWh - acLoadWh;

  const totalDailyWh = dcLoadWh + acDrawWh;
  const totalDailyAh = totalDailyWh / systemVoltage;

  // Storage sizing. The bank has to hand over this much energy, so round-trip
  // efficiency does not belong here - it is a charging cost, not a storage one.
  const usableAhRequired = totalDailyAh * daysOfAutonomy;
  const batteryBankAh = usableAhRequired / depthOfDischarge;
  const batteryBankWh = batteryBankAh * systemVoltage;

  // Charge sizing. This is where round-trip losses land: to get a day's load
  // back out of the bank you must put more than a day's load into it.
  const dailyRechargeWh = totalDailyWh / chemistry.roundTripEfficiency;
  const solarArrayWatts = dailyRechargeWh / (peakSunHours * solarDerate);

  // Inverter. Assume every AC load could be on together, then find the worst
  // startup: the biggest surge landing on top of everything else already running.
  const totalAcConnectedWatts = acLoads.reduce((sum, l) => sum + l.connectedWatts, 0);
  const inverterContinuousWatts =
    totalAcConnectedWatts > 0 ? totalAcConnectedWatts * INVERTER_HEADROOM : 0;

  let inverterSurgeWatts = 0;
  for (const load of acLoads) {
    const unitWatts = positive(load.device.watts);
    const surge = unitWatts * Math.max(1, positive(load.device.surgeFactor) || 1);
    const rest = totalAcConnectedWatts - unitWatts;
    inverterSurgeWatts = Math.max(inverterSurgeWatts, surge + rest);
  }
  inverterSurgeWatts = Math.max(inverterSurgeWatts, inverterContinuousWatts);

  const chargeControllerAmps = (solarArrayWatts / systemVoltage) * CONTROLLER_MARGIN;
  const maxChargeCurrentA = batteryBankAh * chemistry.maxChargeRate;

  return {
    loads,
    acLoadWh,
    dcLoadWh,
    inverterLossWh,
    totalDailyWh,
    totalDailyAh,
    usableAhRequired,
    batteryBankAh,
    batteryBankWh,
    dailyRechargeWh,
    solarArrayWatts,
    inverterContinuousWatts,
    inverterSurgeWatts,
    chargeControllerAmps,
    maxChargeCurrentA,
    warnings: buildWarnings({
      devices,
      loads,
      settings,
      batteryBankAh,
      solarArrayWatts,
      maxChargeCurrentA,
      systemVoltage,
      depthOfDischarge,
      chemistryDoD: chemistry.depthOfDischarge,
    }),
  };
}

interface WarningInput {
  devices: Device[];
  loads: DeviceLoad[];
  settings: Settings;
  batteryBankAh: number;
  solarArrayWatts: number;
  maxChargeCurrentA: number;
  systemVoltage: number;
  depthOfDischarge: number;
  chemistryDoD: number;
}

function buildWarnings(input: WarningInput): Warning[] {
  const warnings: Warning[] = [];

  if (input.devices.length === 0) {
    warnings.push({ level: 'info', message: 'Add a device to size the system.' });
    return warnings;
  }

  const idle = input.loads.filter(l => l.dailyWh === 0);
  if (idle.length > 0) {
    const names = idle.map(l => l.device.name || 'an unnamed device').join(', ');
    warnings.push({
      level: 'info',
      message: `Drawing nothing and so not sized for: ${names}. Check the watts, hours and quantity.`,
    });
  }

  if (input.depthOfDischarge > input.chemistryDoD) {
    warnings.push({
      level: 'caution',
      message:
        `Depth of discharge is set above the ${Math.round(input.chemistryDoD * 100)}% ` +
        `this chemistry is usually held to. The bank will size smaller but wear out sooner.`,
    });
  }

  // Solar charge current the bank cannot swallow.
  const solarChargeAmps = input.solarArrayWatts / input.systemVoltage;
  if (input.maxChargeCurrentA > 0 && solarChargeAmps > input.maxChargeCurrentA) {
    warnings.push({
      level: 'caution',
      message:
        `The array can push about ${Math.round(solarChargeAmps)}A into a bank rated to accept ` +
        `roughly ${Math.round(input.maxChargeCurrentA)}A. Grow the bank, or limit the charge current.`,
    });
  }

  // Very large low-voltage banks mean punishing cable runs.
  if (input.systemVoltage === 12 && input.batteryBankAh > 600) {
    warnings.push({
      level: 'caution',
      message:
        `A ${Math.round(input.batteryBankAh)}Ah bank at 12V draws heavy current and needs very ` +
        `thick cable. Moving to 24V halves the current for the same energy.`,
    });
  }

  return warnings;
}
