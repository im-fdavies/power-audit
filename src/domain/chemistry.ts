import type { Chemistry } from './types';

export interface ChemistryProfile {
  label: string;
  /** Sensible working depth of discharge for a bank you want to last. */
  depthOfDischarge: number;
  /** Round-trip charge/discharge efficiency, 0-1. */
  roundTripEfficiency: number;
  /** Safe continuous charge current as a fraction of nominal capacity (C-rate). */
  maxChargeRate: number;
  note: string;
}

export const CHEMISTRY_PROFILES: Record<Chemistry, ChemistryProfile> = {
  LiFePO4: {
    label: 'LiFePO4',
    depthOfDischarge: 0.8,
    roundTripEfficiency: 0.95,
    maxChargeRate: 0.5,
    note: 'Tolerates deep cycling and fast charging. Costs most up front, least per cycle.',
  },
  AGM: {
    label: 'AGM',
    depthOfDischarge: 0.5,
    roundTripEfficiency: 0.85,
    maxChargeRate: 0.3,
    note: 'Sealed and maintenance free. Going past half flat shortens its life sharply.',
  },
  Gel: {
    label: 'Gel',
    depthOfDischarge: 0.5,
    roundTripEfficiency: 0.85,
    maxChargeRate: 0.2,
    note: 'Handles heat well but wants a gentle charge. Fussy about charge voltage.',
  },
  Flooded: {
    label: 'Flooded lead acid',
    depthOfDischarge: 0.5,
    roundTripEfficiency: 0.8,
    maxChargeRate: 0.2,
    note: 'Cheapest per amp-hour. Needs topping up, venting and an upright mounting.',
  },
};

export function profileFor(chemistry: Chemistry): ChemistryProfile {
  return CHEMISTRY_PROFILES[chemistry];
}
