import React from 'react';
import { DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { PowerCalculation } from '../types';

interface Props {
  calculation: PowerCalculation;
  selectedTier: 'budget' | 'mid-range' | 'premium';
  currency: 'GBP' | 'USD' | 'EUR';
}

interface CostEstimate {
  batteries: number;
  inverter: number;
  solarPanels: number;
  mppt: number;
  accessories: number;
  installation: number;
  total: number;
}

export default function CostBreakdown({ calculation, selectedTier, currency }: Props) {
  const getCurrencySymbol = () => {
    switch (currency) {
      case 'GBP': return '£';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return '£';
    }
  };

  const formatPrice = (price: number) => {
    return `${getCurrencySymbol()}${price.toLocaleString()}`;
  };
  const calculateCosts = (): CostEstimate => {
    const batteryCount = Math.ceil(calculation.batteryCapacityNeeded / 100);
    const solarCount = Math.ceil(calculation.solarPanelWatts / 100);
    
    let costs: CostEstimate;
    
    switch (selectedTier) {
      case 'budget':
        costs = {
          batteries: batteryCount * 400, // $400 per 100Ah battery
          inverter: 250, // Basic inverter
          solarPanels: solarCount * 120, // $120 per 100W panel
          mppt: 150, // Basic MPPT
          accessories: 300, // Wiring, fuses, etc.
          installation: 500, // DIY with some help
          total: 0
        };
        break;
      case 'mid-range':
        costs = {
          batteries: batteryCount * 700, // $700 per 100Ah LiFePO4
          inverter: 600, // Quality inverter/charger
          solarPanels: solarCount * 200, // $200 per 100W panel
          mppt: 250, // Smart MPPT
          accessories: 500, // Better monitoring, wiring
          installation: 1000, // Professional installation
          total: 0
        };
        break;
      case 'premium':
        costs = {
          batteries: batteryCount * 1000, // $1000 per premium battery
          inverter: 1200, // High-end inverter/charger
          solarPanels: solarCount * 350, // $350 per premium panel
          mppt: 400, // Top-tier MPPT
          accessories: 800, // Premium monitoring, remote console
          installation: 1500, // Full professional installation
          total: 0
        };
        break;
    }
    
    costs.total = costs.batteries + costs.inverter + costs.solarPanels + 
                  costs.mppt + costs.accessories + costs.installation;
    
    return costs;
  };

  const costs = calculateCosts();
  const costPerWh = costs.total / calculation.totalDailyWh;
  const electricityRate = 0.15; // Cost per kWh
  const paybackYears = costs.total / (calculation.totalDailyWh * 365 * electricityRate / 1000);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <DollarSign className="h-6 w-6 text-green-600 mr-2" />
        <h2 className="text-xl font-semibold">Cost Breakdown - {selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1)} Tier</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div>
          <h3 className="font-medium mb-3">System Components</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Batteries ({Math.ceil(calculation.batteryCapacityNeeded / 100)}x 100Ah)</span>
              <span className="font-medium">{formatPrice(costs.batteries)}</span>
            </div>
            <div className="flex justify-between">
              <span>Inverter ({calculation.inverterWatts > 0 ? calculation.inverterWatts.toFixed(0) + 'W' : 'Not needed'})</span>
              <span className="font-medium">{formatPrice(costs.inverter)}</span>
            </div>
            <div className="flex justify-between">
              <span>Solar Panels ({Math.ceil(calculation.solarPanelWatts / 100)}x 100W)</span>
              <span className="font-medium">{formatPrice(costs.solarPanels)}</span>
            </div>
            <div className="flex justify-between">
              <span>MPPT Controller</span>
              <span className="font-medium">{formatPrice(costs.mppt)}</span>
            </div>
            <div className="flex justify-between">
              <span>Accessories & Wiring</span>
              <span className="font-medium">{formatPrice(costs.accessories)}</span>
            </div>
            <div className="flex justify-between">
              <span>Installation</span>
              <span className="font-medium">{formatPrice(costs.installation)}</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between text-lg font-bold">
              <span>Total System Cost</span>
              <span className="text-green-600">{formatPrice(costs.total)}</span>
            </div>
          </div>
        </div>

        {/* Financial Analysis */}
        <div>
          <h3 className="font-medium mb-3">Financial Analysis</h3>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded">
              <div className="flex items-center mb-1">
                <Calculator size={16} className="text-blue-600 mr-2" />
                <span className="font-medium text-blue-800">Cost per Wh</span>
              </div>
              <span className="text-2xl font-bold text-blue-600">
                {getCurrencySymbol()}{costPerWh.toFixed(2)}
              </span>
              <p className="text-xs text-blue-600">per watt-hour of daily capacity</p>
            </div>

            <div className="bg-green-50 p-3 rounded">
              <div className="flex items-center mb-1">
                <TrendingUp size={16} className="text-green-600 mr-2" />
                <span className="font-medium text-green-800">Payback Period</span>
              </div>
              <span className="text-2xl font-bold text-green-600">
                {paybackYears.toFixed(1)} years
              </span>
              <p className="text-xs text-green-600">vs grid electricity at {getCurrencySymbol()}0.15/kWh</p>
            </div>

            <div className="bg-yellow-50 p-3 rounded">
              <div className="flex items-center mb-1">
                <DollarSign size={16} className="text-yellow-600 mr-2" />
                <span className="font-medium text-yellow-800">Monthly Savings</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">
                {getCurrencySymbol()}{((calculation.totalDailyWh * 30 * 0.15) / 1000).toFixed(0)}
              </span>
              <p className="text-xs text-yellow-600">estimated electricity cost avoided</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financing Options */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">💳 Financing Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium">12 months @ 0% APR:</span>
            <p>{formatPrice(Math.round(costs.total / 12))}/month</p>
          </div>
          <div>
            <span className="font-medium">24 months @ 5.9% APR:</span>
            <p>{formatPrice(Math.round(costs.total * 1.059 / 24))}/month</p>
          </div>
          <div>
            <span className="font-medium">36 months @ 7.9% APR:</span>
            <p>{formatPrice(Math.round(costs.total * 1.079 / 36))}/month</p>
          </div>
        </div>
      </div>
    </div>
  );
}