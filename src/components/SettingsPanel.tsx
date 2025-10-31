import React from 'react';
import { Settings } from '../types';

interface Props {
  settings: Settings;
  onSettingsChange: (settings: Settings) => void;
}

export default function SettingsPanel({ settings, onSettingsChange }: Props) {
  const updateSetting = (key: keyof Settings, value: number | string) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleBatteryTypeChange = (batteryType: 'LiFePO4' | 'Lead Acid' | 'AGM' | 'Gel') => {
    let newDepthOfDischarge: number;
    let newBatteryEfficiency: number;
    
    switch (batteryType) {
      case 'LiFePO4':
        newDepthOfDischarge = 0.9; // 90% DoD for LiFePO4
        newBatteryEfficiency = 0.98;
        break;
      case 'Lead Acid':
        newDepthOfDischarge = 0.5; // 50% DoD for Lead Acid
        newBatteryEfficiency = 0.85;
        break;
      case 'AGM':
        newDepthOfDischarge = 0.7; // 70% DoD for AGM
        newBatteryEfficiency = 0.9;
        break;
      case 'Gel':
        newDepthOfDischarge = 0.7; // 70% DoD for Gel
        newBatteryEfficiency = 0.9;
        break;
      default:
        newDepthOfDischarge = 0.8;
        newBatteryEfficiency = 0.95;
    }
    
    onSettingsChange({
      ...settings,
      batteryType,
      depthOfDischarge: newDepthOfDischarge,
      batteryEfficiency: newBatteryEfficiency
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">System Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            System Voltage (DC)
          </label>
          <select
            value={settings.systemVoltage}
            onChange={(e) => updateSetting('systemVoltage', Number(e.target.value) as 12 | 24 | 48)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={12}>12V</option>
            <option value={24}>24V</option>
            <option value={48}>48V</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Battery system voltage
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Unit
          </label>
          <select
            value={settings.displayUnit}
            onChange={(e) => updateSetting('displayUnit', e.target.value as 'Wh' | 'Ah')}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Wh">Watt Hours (Wh)</option>
            <option value="Ah">Amp Hours (Ah)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Currency
          </label>
          <select
            value={settings.currency}
            onChange={(e) => updateSetting('currency', e.target.value as 'GBP' | 'USD' | 'EUR')}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="GBP">British Pounds (£)</option>
            <option value="USD">US Dollars ($)</option>
            <option value="EUR">Euros (€)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Battery Type
          </label>
          <select
            value={settings.batteryType}
            onChange={(e) => handleBatteryTypeChange(e.target.value as 'LiFePO4' | 'Lead Acid' | 'AGM' | 'Gel')}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="LiFePO4">LiFePO4 (Lithium) - 90% DoD</option>
            <option value="Lead Acid">Lead Acid - 50% DoD</option>
            <option value="AGM">AGM - 70% DoD</option>
            <option value="Gel">Gel - 70% DoD</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Depth of discharge automatically set based on battery type
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Days of Autonomy
          </label>
          <input
            type="number"
            min="1"
            max="7"
            step="0.5"
            value={settings.daysOfAutonomy}
            onChange={(e) => updateSetting('daysOfAutonomy', Number(e.target.value))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            How many days without charging
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Depth of Discharge (%) 
            <span className="text-xs text-blue-600 ml-1">Auto-set by battery type</span>
          </label>
          <input
            type="number"
            min="20"
            max="95"
            step="5"
            value={Math.round(settings.depthOfDischarge * 100)}
            onChange={(e) => updateSetting('depthOfDischarge', Number(e.target.value) / 100)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Automatically set based on battery type (can be manually overridden)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peak Sun Hours
          </label>
          <input
            type="number"
            min="2"
            max="8"
            step="0.5"
            value={settings.peakSunHours}
            onChange={(e) => updateSetting('peakSunHours', Number(e.target.value))}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Average daily peak sun hours in your area
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Battery Efficiency (%)
          </label>
          <input
            type="number"
            min="80"
            max="98"
            step="1"
            value={settings.batteryEfficiency * 100}
            onChange={(e) => updateSetting('batteryEfficiency', Number(e.target.value) / 100)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Inverter Efficiency (%)
          </label>
          <input
            type="number"
            min="80"
            max="95"
            step="1"
            value={settings.inverterEfficiency * 100}
            onChange={(e) => updateSetting('inverterEfficiency', Number(e.target.value) / 100)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Solar Efficiency (%)
          </label>
          <input
            type="number"
            min="70"
            max="90"
            step="1"
            value={settings.solarEfficiency * 100}
            onChange={(e) => updateSetting('solarEfficiency', Number(e.target.value) / 100)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}