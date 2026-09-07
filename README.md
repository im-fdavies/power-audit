# Power Audit

Sizing calculator for off-grid electrical systems on boats, vans and cabins. You
enter what you run in a day; it tells you how big the battery bank, solar array,
inverter and charge controller need to be.

No backend, no accounts, no product catalogue. State lives in local storage.

## Running it

```bash
npm install
npm run dev
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server on http://localhost:5173 |
| `npm run build` | Typecheck then build to `dist/` |
| `npm run preview` | Serve the built output |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Single test run |
| `npm run typecheck` | Types only |

## How the sizing works

All of it lives in [`src/domain/sizing.ts`](src/domain/sizing.ts) as pure
functions with no React in them, tested directly in
[`src/domain/__tests__/sizing.test.ts`](src/domain/__tests__/sizing.test.ts).

**Per device.** `watts x quantity x hoursPerDay x dutyCycle`

Duty cycle is the part most calculators miss. A compressor fridge is switched on
for 24 hours but its compressor only runs about a third of the time. Sizing it at
100% roughly triples the battery bank it appears to need.

**Daily energy.** DC loads come straight off the battery. AC loads are divided by
inverter efficiency, because the inverter burns a slice of everything it converts.
Amp-hours are that total over the system voltage.

**Battery bank.** `dailyAh x daysOfAutonomy / depthOfDischarge`

Round-trip efficiency deliberately does *not* appear here. The bank has to *hand
over* the daily load; charging losses are a cost of putting energy back in, not of
storing it, so they belong in the solar figure instead.

**Solar array.** `(dailyWh / roundTripEfficiency) / (peakSunHours x derate)`

Peak sun hours should be the worst month you intend to be out in. In the UK that
is nearer 1 than the 4 you get in June, and using an annual average is how people
end up with an array that works beautifully until October.

**Inverter.** Continuous is every AC load running at once, plus 25% headroom.
Surge is the worst case of the largest starter kicking in while everything else
keeps running - a device's `surgeFactor` is its inrush as a multiple of running
watts, which is what actually trips an undersized inverter.

**Charge controller.** `arrayWatts / systemVoltage x 1.25`. Alongside it the app
shows what the bank can safely accept, from the chemistry's charge rate, and warns
when the array would push more current than that.

### Chemistry

Depth of discharge, round-trip efficiency and safe charge rate all come from the
chosen chemistry ([`src/domain/chemistry.ts`](src/domain/chemistry.ts)) rather
than being three unrelated sliders. Changing chemistry resets depth of discharge
to something that chemistry can live with.

## Layout

```
src/
  domain/      sizing engine, chemistry profiles, presets, formatting - no React
  state/       reducer and local-storage persistence
  components/  the form and the readouts
```

## Caveats

The presets are starting points, not specifications - replace each one with the
figure off the appliance's own rating plate. Cable sizing, fusing and battery
layout are not modelled. It is a planning tool, not a design certificate.

## Stack

React 19, TypeScript, Vite 7, Tailwind 4, Vitest. Deploys to Vercel as a static
site.
