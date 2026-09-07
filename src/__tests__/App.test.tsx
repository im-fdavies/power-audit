import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

async function addDevice(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole('button', { name: 'Add device' }));
}

async function setNumber(label: RegExp | string, value: string) {
  const user = userEvent.setup();
  const field = screen.getByLabelText(label);
  await user.clear(field);
  await user.type(field, value);
  return field;
}

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('starts empty and asks for a device', () => {
    render(<App />);
    expect(screen.getByText(/no loads yet/i)).toBeInTheDocument();
    expect(screen.getByText(/add a device to size the system/i)).toBeInTheDocument();
  });

  it('sizes a bank end to end from a device the user enters', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addDevice(user);

    await user.type(screen.getByLabelText('Device name'), 'Fridge');
    await setNumber(/watts for fridge/i, '120');
    await setNumber(/hours per day for fridge/i, '10');

    // 120W for 10h = 1200Wh = 100Ah at 12V. Two days at 80% DoD = 250Ah.
    const sizing = within(screen.getByRole('region', { name: 'Sizing' }));
    expect(sizing.getByText('250 Ah')).toBeInTheDocument();
    const offBattery = sizing.getByText('Off the battery').parentElement!;
    expect(within(offBattery).getByText(/1\.2 kWh.*100 Ah/)).toBeInTheDocument();
  });

  it('adds a preset with its duty cycle already set', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /from a preset/i }));
    await user.click(screen.getByRole('button', { name: /compressor fridge/i }));

    expect(screen.getByLabelText(/duty cycle percent for compressor fridge/i)).toHaveValue(35);

    // 45W x 24h x 0.35 = 378Wh, shown on the row and again in the day's total.
    const row = screen.getByDisplayValue('Compressor fridge').closest('tr')!;
    expect(within(row).getByText('378 Wh')).toBeInTheDocument();
  });

  it('reports no inverter needed until an AC load exists', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addDevice(user);
    await setNumber(/watts for this device/i, '100');

    expect(screen.getByText(/not needed - no ac loads/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/supply type/i), 'AC');
    expect(screen.queryByText(/not needed - no ac loads/i)).not.toBeInTheDocument();
    expect(screen.getByText(/inverter continuous/i)).toBeInTheDocument();
  });

  it('recalculates when the system voltage changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addDevice(user);
    await setNumber(/watts for this device/i, '120');
    await setNumber(/hours per day for this device/i, '10');

    expect(screen.getByText('250 Ah')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '24V' }));
    expect(screen.getByText('125 Ah')).toBeInTheDocument();
  });

  it('drops depth of discharge when the chemistry changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByLabelText(/depth of discharge percent/i)).toHaveValue(80);
    await user.selectOptions(screen.getByLabelText(/battery chemistry/i), 'AGM');
    expect(screen.getByLabelText(/depth of discharge percent/i)).toHaveValue(50);
  });

  it('removes a device', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addDevice(user);
    await user.click(screen.getByRole('button', { name: /remove this device/i }));
    expect(screen.getByText(/no loads yet/i)).toBeInTheDocument();
  });

  it('duplicates a device', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addDevice(user);
    await user.type(screen.getByLabelText('Device name'), 'Light');
    await user.click(screen.getByRole('button', { name: /duplicate light/i }));

    const rows = screen.getAllByLabelText('Device name');
    expect(rows).toHaveLength(2);
    expect(rows[1]).toHaveValue('Light');
  });

  it('survives a reload by way of local storage', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    await addDevice(user);
    await user.type(screen.getByLabelText('Device name'), 'Heater');
    unmount();

    render(<App />);
    expect(screen.getByLabelText('Device name')).toHaveValue('Heater');
  });

  it('keeps the total row in step with the loads', async () => {
    const user = userEvent.setup();
    render(<App />);
    await addDevice(user);
    await setNumber(/watts for this device/i, '50');
    await setNumber(/hours per day for this device/i, '4');

    const footer = screen.getByText(/at the loads, before inverter losses/i).closest('tr')!;
    expect(within(footer).getByText('200 Wh')).toBeInTheDocument();
  });
});
