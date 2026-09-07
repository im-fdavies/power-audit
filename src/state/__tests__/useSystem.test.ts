import { describe, expect, it } from 'vitest';
import { initialState, reducer, type SystemState } from '../useSystem';
import { DEVICE_PRESETS } from '../../domain/presets';

function withDevice(): SystemState {
  return reducer(initialState(), { type: 'device/add' });
}

describe('reducer', () => {
  it('adds a blank device', () => {
    const state = withDevice();
    expect(state.devices).toHaveLength(1);
    expect(state.devices[0]?.quantity).toBe(1);
    expect(state.devices[0]?.name).toBe('');
  });

  it('adds a device from a preset', () => {
    const preset = DEVICE_PRESETS.find(p => p.name === 'Compressor fridge');
    const state = reducer(initialState(), { type: 'device/add', preset });
    expect(state.devices[0]?.name).toBe('Compressor fridge');
    expect(state.devices[0]?.dutyCycle).toBe(0.35);
  });

  it('patches only the device asked for', () => {
    const two = reducer(withDevice(), { type: 'device/add' });
    const target = two.devices[0]!;
    const next = reducer(two, { type: 'device/update', id: target.id, patch: { watts: 42 } });
    expect(next.devices[0]?.watts).toBe(42);
    expect(next.devices[1]?.watts).toBe(0);
  });

  it('removes a device', () => {
    const state = withDevice();
    const next = reducer(state, { type: 'device/remove', id: state.devices[0]!.id });
    expect(next.devices).toHaveLength(0);
  });

  it('duplicates a device next to the original with a fresh id', () => {
    const state = reducer(withDevice(), { type: 'device/add' });
    const first = state.devices[0]!;
    const next = reducer(
      reducer(state, { type: 'device/update', id: first.id, patch: { name: 'Fridge' } }),
      { type: 'device/duplicate', id: first.id },
    );
    expect(next.devices).toHaveLength(3);
    expect(next.devices[1]?.name).toBe('Fridge');
    expect(next.devices[1]?.id).not.toBe(first.id);
  });

  it('ignores a duplicate of an unknown device', () => {
    const state = withDevice();
    expect(reducer(state, { type: 'device/duplicate', id: 'nope' })).toBe(state);
  });

  it('pulls depth of discharge back to what a new chemistry can take', () => {
    const lithium = reducer(initialState(), {
      type: 'settings/update',
      patch: { depthOfDischarge: 0.9 },
    });
    const agm = reducer(lithium, { type: 'settings/update', patch: { chemistry: 'AGM' } });
    expect(agm.settings.depthOfDischarge).toBe(0.5);
  });

  it('respects a depth of discharge set alongside the chemistry', () => {
    const next = reducer(initialState(), {
      type: 'settings/update',
      patch: { chemistry: 'AGM', depthOfDischarge: 0.65 },
    });
    expect(next.settings.depthOfDischarge).toBe(0.65);
  });

  it('resets everything', () => {
    const state = reducer(withDevice(), { type: 'settings/update', patch: { systemVoltage: 48 } });
    const next = reducer(state, { type: 'system/reset' });
    expect(next.devices).toHaveLength(0);
    expect(next.settings.systemVoltage).toBe(12);
  });
});
