export function round(value: number, dp = 0): number {
  const factor = 10 ** dp;
  return Math.round(value * factor) / factor;
}

/** Round up to something you could actually buy, rather than 437.2Ah. */
export function roundUpTo(value: number, step: number): number {
  if (step <= 0) return value;
  return Math.ceil(value / step) * step;
}

export function formatWh(wh: number): string {
  if (wh >= 1000) return `${round(wh / 1000, 2)} kWh`;
  return `${round(wh)} Wh`;
}

export function formatWatts(w: number): string {
  if (w >= 1000) return `${round(w / 1000, 2)} kW`;
  return `${round(w)} W`;
}

export function formatAh(ah: number): string {
  return `${round(ah)} Ah`;
}

export function formatAmps(a: number): string {
  return `${round(a)} A`;
}
