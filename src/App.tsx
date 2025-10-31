import React, { useState, useEffect } from 'react';
import { Calculator, Settings as SettingsIcon, Zap, Search } from 'lucide-react';
import PowerDeviceForm from './components/PowerDeviceForm';
import SettingsPanel from './components/SettingsPanel';
import ResultsPanel from './components/ResultsPanel';
import ProductRecommendations from './components/ProductRecommendations';
import ProductLookup from './components/ProductLookup';
import { PowerDevice, Settings, PowerCalculation } from './types';
import { calculatePowerRequirements } from './utils/calculations';

function App() {
  const [devices, setDevices] = useState<PowerDevice[]>([]);
  const [settings, setSettings] = useState<Settings>({
    defaultVoltage: 12,
    systemVoltage: 12,
    displayUnit: 'Wh',
    currency: 'GBP',
    batteryType: 'LiFePO4',
    daysOfAutonomy: 2,
    depthOfDischarge: 0.8,
    batteryEfficiency: 0.95,
    inverterEfficiency: 0.9,
    solarEfficiency: 0.8,
    peakSunHours: 5
  });
  const [calculation, setCalculation] = useState<PowerCalculation>({
    totalDailyWh: 0,
    totalDailyAh: 0,
    batteryCapacityNeeded: 0,
    solarPanelWatts: 0,
    inverterWatts: 0
  });
  const [activeTab, setActiveTab] = useState<'calculator' | 'products' | 'lookup' | 'settings'>('calculator');

  useEffect(() => {
    const newCalculation = calculatePowerRequirements(devices, settings);
    setCalculation(newCalculation);
  }, [devices, settings]);

  // Sample devices for demo
  useEffect(() => {
    setDevices([
      {
        id: '1',
        name: 'LED Lights',
        watts: 20,
        voltage: 12,
        hoursPerDay: 6,
        category: 'lighting',
        currentType: 'DC'
      },
      {
        id: '2',
        name: 'Laptop',
        watts: 65,
        voltage: 230,
        hoursPerDay: 8,
        category: 'electronics',
        currentType: 'AC'
      },
      {
        id: '3',
        name: 'Refrigerator',
        watts: 150,
        voltage: 230,
        hoursPerDay: 12,
        category: 'appliances',
        currentType: 'AC'
      }
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Zap className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Power Calculator</h1>
            </div>
            <p className="text-gray-600 hidden md:block">
              Design your perfect solar & battery system
            </p>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('calculator')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calculator'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calculator className="inline-block w-4 h-4 mr-2" />
              Calculator
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Products
            </button>
            <button
              onClick={() => setActiveTab('lookup')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lookup'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Search className="inline-block w-4 h-4 mr-2" />
              Product Lookup
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SettingsIcon className="inline-block w-4 h-4 mr-2" />
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            <PowerDeviceForm 
              devices={devices} 
              onDevicesChange={setDevices} 
              defaultVoltage={settings.defaultVoltage}
              onDefaultVoltageChange={(voltage) => setSettings({...settings, defaultVoltage: voltage as 12 | 24 | 48 | 230})}
            />
            <ResultsPanel 
              calculation={calculation} 
              systemVoltage={settings.systemVoltage}
              displayUnit={settings.displayUnit}
            />
          </div>
        )}

        {activeTab === 'products' && (
          <ProductRecommendations 
            calculation={calculation} 
            systemVoltage={settings.systemVoltage}
            currency={settings.currency}
          />
        )}

        {activeTab === 'lookup' && (
          <ProductLookup />
        )}

        {activeTab === 'settings' && (
          <SettingsPanel settings={settings} onSettingsChange={setSettings} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p className="mb-2">
              Power Calculator - Design your perfect off-grid power system
            </p>
            <p className="text-sm">
              Get personalized recommendations for boats, vans, and off-grid homes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;