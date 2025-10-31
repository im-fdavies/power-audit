import React from 'react';
import { PowerCalculation } from '../types';
import { getRecommendedProducts } from '../utils/calculations';

interface Props {
  calculation: PowerCalculation;
  systemVoltage: number;
  displayUnit: 'Wh' | 'Ah';
}

export default function ResultsPanel({ calculation, systemVoltage, displayUnit }: Props) {
  const recommendations = getRecommendedProducts(calculation, systemVoltage);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Power Requirements</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-medium text-blue-800">Daily Energy</h3>
          <p className="text-2xl font-bold text-blue-600">
            {displayUnit === 'Wh' 
              ? `${calculation.totalDailyWh.toFixed(0)} Wh`
              : `${calculation.totalDailyAh.toFixed(1)} Ah`
            }
          </p>
          <p className="text-sm text-blue-600">
            {displayUnit === 'Wh' 
              ? `${calculation.totalDailyAh.toFixed(1)} Ah @ ${systemVoltage}V`
              : `${calculation.totalDailyWh.toFixed(0)} Wh total`
            }
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-medium text-green-800">Battery Capacity</h3>
          <p className="text-2xl font-bold text-green-600">
            {calculation.batteryCapacityNeeded.toFixed(0)} Ah
          </p>
          <p className="text-sm text-green-600">
            ~{recommendations.batteryCount} x 100Ah batteries
          </p>
        </div>

        <div className="bg-yellow-50 p-4 rounded">
          <h3 className="font-medium text-yellow-800">Solar Panels</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {calculation.solarPanelWatts.toFixed(0)} W
          </p>
          <p className="text-sm text-yellow-600">
            ~{recommendations.solarPanelCount} x 100W panels
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded">
          <h3 className="font-medium text-purple-800">Inverter</h3>
          <p className="text-2xl font-bold text-purple-600">
            {calculation.inverterWatts > 0 ? `${calculation.inverterWatts.toFixed(0)} W` : 'Not needed'}
          </p>
          <p className="text-sm text-purple-600">
            {calculation.inverterWatts > 0 ? 'Minimum capacity needed' : 'No AC devices detected'}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded">
        <h3 className="font-medium mb-2">Additional Components Needed:</h3>
        <ul className="text-sm space-y-1">
          <li>• MPPT Charge Controller: {recommendations.mpptMinAmps}A minimum</li>
          <li>• Battery Monitor: To track state of charge</li>
          <li>• Fuses/Breakers: For safety and protection</li>
          <li>• Wiring: Appropriate gauge for current loads</li>
          <li>• DC-DC Charger: If charging from alternator</li>
        </ul>
      </div>
    </div>
  );
}