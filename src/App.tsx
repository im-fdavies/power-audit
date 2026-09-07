import { DeviceTable } from './components/DeviceTable';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { useSystem } from './state/useSystem';

export default function App() {
  const { state, dispatch, result } = useSystem();

  return (
    <div className="min-h-screen">
      <header
        className="px-5 py-4"
        style={{ borderBottom: '1px solid var(--line)', background: 'var(--panel)' }}
      >
        <div className="max-w-6xl mx-auto flex items-baseline justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-base font-semibold m-0">Power Audit</h1>
            <p className="text-xs m-0 mt-0.5" style={{ color: 'var(--ink-soft)' }}>
              Size the battery bank, solar array, inverter and charge controller for a boat,
              van or off-grid cabin.
            </p>
          </div>
          {state.devices.length > 0 && (
            <button
              className="btn"
              onClick={() => {
                if (confirm('Clear every device and reset the system settings?')) {
                  dispatch({ type: 'system/reset' });
                }
              }}
            >
              Start over
            </button>
          )}
        </div>
      </header>

      {/*
        Stacked, the sizing has to come before the settings - it is the answer
        the page exists to give, and burying it under a form means scrolling
        past everything to find out whether the last edit mattered.
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

        <div className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-5">
          <ResultsPanel result={result} />
        </div>

        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <SettingsPanel
            settings={state.settings}
            onChange={patch => dispatch({ type: 'settings/update', patch })}
          />
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-5 pb-8">
        <p className="text-xs m-0" style={{ color: 'var(--ink-faint)' }}>
          A planning tool, not a design certificate. Have any installation that touches mains
          voltage, gas or a vessel's existing wiring signed off by a qualified electrician.
        </p>
      </footer>
    </div>
  );
}
