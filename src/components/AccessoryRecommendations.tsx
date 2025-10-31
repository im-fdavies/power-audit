import React from 'react';
import { ExternalLink, Shield, Zap, Monitor, Wrench } from 'lucide-react';

interface Accessory {
  id: string;
  name: string;
  description: string;
  price: string;
  category: 'safety' | 'monitoring' | 'charging' | 'installation';
  affiliateLink: string;
  icon: React.ReactNode;
}

const accessories: Accessory[] = [
  {
    id: 'acc-1',
    name: 'Victron Battery Monitor BMV-712',
    description: 'Bluetooth-enabled battery monitor with smartphone app',
    price: '$195',
    category: 'monitoring',
    affiliateLink: 'https://example.com/victron-bmv712',
    icon: <Monitor size={24} />
  },
  {
    id: 'acc-2',
    name: 'Blue Sea Systems ANL Fuse Block',
    description: 'Essential safety fuses for battery protection',
    price: '$45',
    category: 'safety',
    affiliateLink: 'https://example.com/bluesea-fuse',
    icon: <Shield size={24} />
  },
  {
    id: 'acc-3',
    name: 'Victron Orion DC-DC Charger',
    description: 'Charge house batteries from alternator while driving',
    price: '$285',
    category: 'charging',
    affiliateLink: 'https://example.com/victron-orion',
    icon: <Zap size={24} />
  },
  {
    id: 'acc-4',
    name: 'Victron VE.Direct Bluetooth Smart Dongle',
    description: 'Add Bluetooth to compatible Victron devices',
    price: '$65',
    category: 'monitoring',
    affiliateLink: 'https://example.com/victron-bluetooth',
    icon: <Monitor size={24} />
  },
  {
    id: 'acc-5',
    name: 'Battery Disconnect Switch',
    description: 'Master cutoff switch for safety and maintenance',
    price: '$35',
    category: 'safety',
    affiliateLink: 'https://example.com/disconnect-switch',
    icon: <Shield size={24} />
  },
  {
    id: 'acc-6',
    name: 'MC4 Connector Kit',
    description: 'Professional solar panel connectors and tools',
    price: '$25',
    category: 'installation',
    affiliateLink: 'https://example.com/mc4-kit',
    icon: <Wrench size={24} />
  }
];

export default function AccessoryRecommendations() {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'safety': return 'bg-red-50 text-red-700 border-red-200';
      case 'monitoring': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'charging': return 'bg-green-50 text-green-700 border-green-200';
      case 'installation': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'safety': return 'Safety';
      case 'monitoring': return 'Monitoring';
      case 'charging': return 'Charging';
      case 'installation': return 'Installation';
      default: return 'Other';
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Essential Accessories</h2>
      <p className="text-gray-600 mb-6">
        Complete your system with these important accessories for safety, monitoring, and optimal performance.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accessories.map((accessory) => (
          <div key={accessory.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <div className="text-gray-600 mr-3">
                  {accessory.icon}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(accessory.category)}`}>
                  {getCategoryName(accessory.category)}
                </span>
              </div>
              <span className="text-lg font-bold text-green-600">{accessory.price}</span>
            </div>

            <h3 className="font-medium text-gray-900 mb-2">{accessory.name}</h3>
            <p className="text-sm text-gray-600 mb-4">{accessory.description}</p>

            <a
              href={accessory.affiliateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Product <ExternalLink size={14} className="ml-1" />
            </a>
          </div>
        ))}
      </div>

      {/* Installation Tips */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">💡 Installation Tips</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Always install fuses/breakers close to the battery positive terminal</li>
          <li>• Use a battery monitor to track state of charge and prevent over-discharge</li>
          <li>• Consider a DC-DC charger if you plan to charge while driving</li>
          <li>• Install a master disconnect switch for safety during maintenance</li>
          <li>• Use proper gauge wiring for your current loads (consult wire sizing charts)</li>
        </ul>
      </div>
    </div>
  );
}