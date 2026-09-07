import { formatAh, formatAmps, formatWatts, formatWh, round, roundUpTo } from '../domain/format';
import type { SizingResult, Warning } from '../domain/types';

interface Props {
  result: SizingResult;
}

function Readout({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent: 'battery' | 'accent';
}) {
  return (
    <div
      className="p-3.5 rounded-lg"
      style={{
        background: accent === 'battery' ? 'var(--battery-soft)' : 'var(--accent-soft)',
        border: '1px solid var(--line)',
      }}
    >
      <div className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>
        {label}
      </div>
      <div
        className="tabular text-2xl font-semibold mt-1 leading-none"
        style={{ color: accent === 'battery' ? 'var(--battery)' : 'var(--accent)' }}
      >
        {value}
      </div>
      <div className="text-xs mt-1.5" style={{ color: 'var(--ink-soft)' }}>
        {detail}
      </div>
    </div>
  );
}

function Line({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div
      className="flex justify-between items-baseline gap-4 py-1.5"
      style={{ borderTop: '1px solid var(--line)' }}
    >
      <span className="text-xs" style={{ color: muted ? 'var(--ink-faint)' : 'var(--ink-soft)' }}>
        {label}
      </span>
      <span className="tabular text-sm whitespace-nowrap">{value}</span>
    </div>
  );
}

function WarningNote({ warning }: { warning: Warning }) {
  const tone =
    warning.level === 'problem'
      ? { fg: 'var(--problem)', bg: 'var(--problem-soft)' }
      : warning.level === 'caution'
        ? { fg: 'var(--caution)', bg: 'var(--caution-soft)' }
        : { fg: 'var(--ink-soft)', bg: 'var(--panel-sunk)' };

  return (
    <li
      className="text-xs px-3 py-2 rounded-md list-none"
      style={{ background: tone.bg, color: tone.fg, border: '1px solid var(--line)' }}
    >
      {warning.message}
    </li>
  );
}

export function ResultsPanel({ result }: Props) {
  const hasLoad = result.totalDailyWh > 0;

  return (
    <section className="panel p-4" aria-label="Sizing">
      <h2 className="text-sm font-semibold m-0">Sizing</h2>
      <p className="text-xs m-0 mt-0.5 mb-4" style={{ color: 'var(--ink-soft)' }}>
        Minimums. Round up to what you can actually buy.
      </p>

      <div className="grid gap-2.5">
        <Readout
          accent="battery"
          label="Battery bank"
          value={hasLoad ? formatAh(roundUpTo(result.batteryBankAh, 5)) : '-'}
          detail={
            hasLoad
              ? `${formatWh(result.batteryBankWh)} nominal, of which ${formatAh(
                  result.usableAhRequired,
                )} is the part you use`
              : 'Add a load to size the bank'
          }
        />
        <Readout
          accent="accent"
          label="Solar array"
          value={hasLoad ? formatWatts(roundUpTo(result.solarArrayWatts, 10)) : '-'}
          detail={
            hasLoad
              ? `Replaces ${formatWh(result.dailyRechargeWh)} a day, losses included`
              : 'Add a load to size the array'
          }
        />
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-semibold m-0 mb-1" style={{ color: 'var(--ink-soft)' }}>
          Daily energy
        </h3>
        <Line label="DC loads" value={formatWh(result.dcLoadWh)} />
        <Line label="AC loads" value={formatWh(result.acLoadWh)} />
        <Line label="Inverter losses" value={formatWh(result.inverterLossWh)} muted />
        <Line
          label="Off the battery"
          value={`${formatWh(result.totalDailyWh)}  ·  ${formatAh(result.totalDailyAh)}`}
        />
      </div>

      <div className="mt-4">
        <h3 className="text-xs font-semibold m-0 mb-1" style={{ color: 'var(--ink-soft)' }}>
          Kit ratings
        </h3>
        {result.inverterContinuousWatts > 0 ? (
          <>
            <Line
              label="Inverter continuous"
              value={formatWatts(roundUpTo(result.inverterContinuousWatts, 50))}
            />
            <Line label="Inverter surge" value={formatWatts(round(result.inverterSurgeWatts))} />
          </>
        ) : (
          <Line label="Inverter" value="Not needed - no AC loads" muted />
        )}
        <Line
          label="Charge controller"
          value={hasLoad ? formatAmps(roundUpTo(result.chargeControllerAmps, 5)) : '-'}
        />
        <Line
          label="Bank accepts up to"
          value={hasLoad ? formatAmps(result.maxChargeCurrentA) : '-'}
          muted
        />
      </div>

      {result.warnings.length > 0 && (
        <ul className="grid gap-1.5 mt-4 p-0 m-0">
          {result.warnings.map(w => (
            <WarningNote key={w.message} warning={w} />
          ))}
        </ul>
      )}
    </section>
  );
}
