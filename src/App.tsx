import { useState } from 'react';
import { DeviceTable } from './components/DeviceTable';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { useSystem } from './state/useSystem';

function StartOver({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button className="btn-quiet" onClick={() => setConfirming(true)}>
        Start over
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2 flex-wrap">
      <span style={{ color: 'var(--legend)', fontSize: '0.8125rem' }}>
        Clear every device and reset the system settings?
      </span>
      <button
        className="btn"
        style={{ borderColor: 'var(--signal)', color: 'var(--signal)' }}
        onClick={() => {
          onReset();
          setConfirming(false);
        }}
      >
        Clear it
      </button>
      <button className="btn" onClick={() => setConfirming(false)} autoFocus>
        Keep it
      </button>
    </span>
  );
}

export default function App() {
  const { state, dispatch, result } = useSystem();

  return (
    <div className="min-h-screen">
      <header className="masthead px-5 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="masthead-title">Power Audit</h1>
          <span className="cable" />
          <p className="masthead-standfirst">
            Size the battery bank, solar array, inverter and charge controller for a boat, van
            or off-grid cabin, from what you actually run in a day.
          </p>
        </div>
      </header>

      {/*
        Sizing spans both rows on desktop so the settings panel can sit straight
        under the loads table. Stacked, sizing comes second - it is the answer
        the page exists to give, and burying it under a form means scrolling past
        everything to find out whether the last edit mattered.
      */}
      <main className="max-w-6xl mx-auto p-5 grid gap-5 lg:grid-cols-[1fr_320px] items-start">
        <div className="min-w-0 lg:col-start-1 lg:row-start-1">
          <DeviceTable
            result={result}
            onAdd={preset => dispatch({ type: 'device/add', preset })}
            onChange={(id, patch) => dispatch({ type: 'device/update', id, patch })}
            onRemove={id => dispatch({ type: 'device/remove', id })}
            onDuplicate={id => dispatch({ type: 'device/duplicate', id })}
          />
        </div>

        <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-5">
          <ResultsPanel result={result} />
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <SettingsPanel
            settings={state.settings}
            onChange={patch => dispatch({ type: 'settings/update', patch })}
          />
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-5 pb-10">
        <div
          className="flex items-start justify-between gap-6 flex-wrap pt-4"
          style={{ borderTop: '1px solid var(--rule)' }}
        >
          <p
            className="m-0"
            style={{ color: 'var(--legend-dim)', fontSize: '0.8125rem', maxWidth: '62ch' }}
          >
            A planning tool, not a design certificate. Have any installation that touches mains
            voltage, gas or a vessel's existing wiring signed off by a qualified electrician.
          </p>
          {state.devices.length > 0 && (
            <StartOver onReset={() => dispatch({ type: 'system/reset' })} />
          )}
        </div>
      </footer>
    </div>
  );
}
