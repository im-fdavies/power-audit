import { useEffect, useMemo, useReducer } from 'react';
import { calculateSystem } from '../domain/sizing';
import { profileFor } from '../domain/chemistry';
import { defaultSettings, newDevice, type DevicePreset } from '../domain/presets';
import type { Device, Settings, SizingResult } from '../domain/types';

const STORAGE_KEY = 'power-audit:v2';

export interface SystemState {
  devices: Device[];
  settings: Settings;
}

export type SystemAction =
  | { type: 'device/add'; preset?: DevicePreset }
  | { type: 'device/update'; id: string; patch: Partial<Device> }
  | { type: 'device/remove'; id: string }
  | { type: 'device/duplicate'; id: string }
  | { type: 'settings/update'; patch: Partial<Settings> }
  | { type: 'system/reset' };

export function initialState(): SystemState {
  return { devices: [], settings: defaultSettings() };
}

export function reducer(state: SystemState, action: SystemAction): SystemState {
  switch (action.type) {
    case 'device/add':
      return { ...state, devices: [...state.devices, newDevice(action.preset)] };

    case 'device/update':
      return {
        ...state,
        devices: state.devices.map(d => (d.id === action.id ? { ...d, ...action.patch } : d)),
      };

    case 'device/remove':
      return { ...state, devices: state.devices.filter(d => d.id !== action.id) };

    case 'device/duplicate': {
      const index = state.devices.findIndex(d => d.id === action.id);
      const source = state.devices[index];
      if (!source) return state;
      const copy: Device = { ...source, id: crypto.randomUUID() };
      const devices = [...state.devices];
      devices.splice(index + 1, 0, copy);
      return { ...state, devices };
    }

    case 'settings/update': {
      const settings = { ...state.settings, ...action.patch };
      // Switching chemistry should pull depth of discharge back to something
      // that chemistry can actually live with, unless it was set explicitly too.
      if (action.patch.chemistry && action.patch.depthOfDischarge === undefined) {
        settings.depthOfDischarge = profileFor(action.patch.chemistry).depthOfDischarge;
      }
      return { ...state, settings };
    }

    case 'system/reset':
      return initialState();

    default:
      return state;
  }
}

function load(): SystemState {
  if (typeof localStorage === 'undefined') return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<SystemState>;
    if (!Array.isArray(parsed.devices)) return initialState();
    return {
      devices: parsed.devices,
      settings: { ...defaultSettings(), ...parsed.settings },
    };
  } catch {
    return initialState();
  }
}

export function useSystem(): {
  state: SystemState;
  dispatch: React.Dispatch<SystemAction>;
  result: SizingResult;
} {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // A full or blocked store is not worth interrupting the user over.
    }
  }, [state]);

  const result = useMemo(
    () => calculateSystem(state.devices, state.settings),
    [state.devices, state.settings],
  );

  return { state, dispatch, result };
}
