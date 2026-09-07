import { formatAh, formatAmps, formatWatts, formatWh, round, roundUpTo } from '../domain/format';
import type { SizingResult, Warning } from '../domain/types';

interface Props {
  result: SizingResult;
}

function Readout({
  label,
  value,
  note,
  cable,
}: {
  label: string;
  value: string;
  note: string;
  cable: string;
}) {
  return (
    <div className="readout" style={{ '--cable': cable } as React.CSSProperties}>
      <div className="legend">{label}</div>
      <div className="readout-value">{value}</div>
      <p className="readout-note">{note}</p>
    </div>
  );
}

function Line({
  label,
  value,
  aside,
  muted,
}: {
  label: string;
  value: string;
  aside?: string;
  muted?: boolean;
}) {
  return (
    <div className="row-rule flex justify-between items-baseline gap-4 py-1.5">
      <span style={{ color: muted ? 'var(--legend-dim)' : 'var(--legend)' }}>{label}</span>
      <span className="flex items-baseline gap-3 whitespace-nowrap">
        <span className="tabular">{value}</span>
        {aside && (
          <span className="tabular" style={{ color: 'var(--legend-dim)' }}>
            {aside}
          </span>
        )}
      </span>
    </div>
  );
}

function WarningNote({ warning }: { warning: Warning }) {
  const tone =
    warning.level === 'problem'
      ? 'note note-problem'
      : warning.level === 'caution'
        ? 'note note-caution'
        : 'note';
  return <li className={tone}>{warning.message}</li>;
}

export function ResultsPanel({ result }: Props) {
  const hasLoad = result.totalDailyWh > 0;

  return (
    <section className="panel" aria-label="Sizing">
      <header className="panel-head px-4 py-3">
        <h2 className="panel-title">Sizing</h2>
        <p className="panel-note">Minimums. Round up to what you can actually buy.</p>
      </header>

      <div className="px-4 py-4 grid gap-5">
        <Readout
          cable="var(--bank)"
          label="Battery bank"
          value={hasLoad ? formatAh(roundUpTo(result.batteryBankAh, 5)) : '-'}
          note={
            hasLoad
              ? `${formatWh(result.batteryBankWh)} nominal, of which ${formatAh(
                  result.usableAhRequired,
                )} is the part you use`
              : 'Add a load to size the bank'
          }
        />
        <Readout
          cable="var(--solar)"
          label="Solar array"
          value={hasLoad ? formatWatts(roundUpTo(result.solarArrayWatts, 10)) : '-'}
          note={
            hasLoad
              ? `Replaces ${formatWh(result.dailyRechargeWh)} a day, losses included`
              : 'Add a load to size the array'
          }
        />
      </div>

      <div className="px-4 pb-4">
        <h3 className="legend m-0 mb-1">Daily energy</h3>
        <Line label="DC loads" value={formatWh(result.dcLoadWh)} />
        <Line label="AC loads" value={formatWh(result.acLoadWh)} />
        <Line label="Inverter losses" value={formatWh(result.inverterLossWh)} muted />
        <Line
          label="Off the battery"
          value={formatWh(result.totalDailyWh)}
          aside={formatAh(result.totalDailyAh)}
        />

        <h3 className="legend m-0 mt-4 mb-1">Kit ratings</h3>
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

        {result.warnings.length > 0 && (
          <ul className="grid gap-2.5 mt-4 p-0 m-0">
            {result.warnings.map(w => (
              <WarningNote key={w.message} warning={w} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
