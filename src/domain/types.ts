export type CurrentType = 'AC' | 'DC';

export type Chemistry = 'LiFePO4' | 'AGM' | 'Gel' | 'Flooded';

export type SystemVoltage = 12 | 24 | 48;

export interface Device {
  id: string;
  name: string;
  /** Running draw of a single unit, in watts. */
  watts: number;
  quantity: number;
  /** Hours per day the device is switched on. */
  hoursPerDay: number;
  /**
   * Fraction of its switched-on hours that the device actually draws power.
   * A compressor fridge is on all day but cycles, so it sits nearer 0.35.
   * A light is either on or off, so it is 1.
   */
  dutyCycle: number;
  /** Multiple of running watts drawn at startup. 1 means no inrush. */
  surgeFactor: number;
  currentType: CurrentType;
}

export interface Settings {
  systemVoltage: SystemVoltage;
  chemistry: Chemistry;
  /** Fraction of nominal capacity you are willing to use. Defaults per chemistry. */
  depthOfDischarge: number;
  /** Days the bank must carry the load with no charging at all. */
  daysOfAutonomy: number;
  /** Inverter conversion efficiency, 0-1. Only applied to AC loads. */
  inverterEfficiency: number;
  /** Equivalent hours of full-rated sun per day for the worst month you plan for. */
  peakSunHours: number;
  /** Array derate for heat, dirt, shading, wiring and imperfect angle, 0-1. */
  solarDerate: number;
}

export interface DeviceLoad {
  device: Device;
  /** Hours per day the device is genuinely drawing power. */
  effectiveHours: number;
  /** Running watts across all units of this device. */
  connectedWatts: number;
  /** Energy at the load, before any inverter losses. */
  dailyWh: number;
}

export type WarningLevel = 'info' | 'caution' | 'problem';

export interface Warning {
  level: WarningLevel;
  message: string;
}

export interface SizingResult {
  loads: DeviceLoad[];

  /** Energy delivered to AC loads, before inverter losses. */
  acLoadWh: number;
  /** Energy delivered to DC loads. */
  dcLoadWh: number;
  /** Energy burnt by the inverter converting DC to AC. */
  inverterLossWh: number;
  /** Everything the battery must deliver in a day. */
  totalDailyWh: number;
  totalDailyAh: number;

  /** Amp-hours the bank must actually give up each day, times autonomy. */
  usableAhRequired: number;
  /** Nominal bank size once depth of discharge is accounted for. */
  batteryBankAh: number;
  batteryBankWh: number;

  /** Energy that must go back in daily, including round-trip losses. */
  dailyRechargeWh: number;
  solarArrayWatts: number;

  /** Continuous rating needed, with headroom. 0 when there are no AC loads. */
  inverterContinuousWatts: number;
  /** Worst case: the largest starter kicking in while everything else runs. */
  inverterSurgeWatts: number;

  chargeControllerAmps: number;
  /** What the bank can safely accept, from its chemistry's charge rate. */
  maxChargeCurrentA: number;

  warnings: Warning[];
}
