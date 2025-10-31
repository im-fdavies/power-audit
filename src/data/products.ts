import { Product, ProductTier } from '../types';

export const sampleProducts: Product[] = [
  // Batteries
  {
    id: 'bat-1',
    name: 'Battle Born 100Ah LiFePO4',
    brand: 'Battle Born',
    specs: '100Ah, 12V, LiFePO4',
    price: 949,
    affiliateLink: 'https://example.com/battleborn-100ah',
    category: 'battery',
    capacity: 100,
    voltage: 12
  },
  {
    id: 'bat-2',
    name: 'Renogy 200Ah LiFePO4',
    brand: 'Renogy',
    specs: '200Ah, 12V, LiFePO4',
    price: 699,
    affiliateLink: 'https://example.com/renogy-200ah',
    category: 'battery',
    capacity: 200,
    voltage: 12
  },
  {
    id: 'bat-3',
    name: 'AIMS Power 400Ah LiFePO4',
    brand: 'AIMS',
    specs: '400Ah, 12V, LiFePO4',
    price: 1299,
    affiliateLink: 'https://example.com/aims-400ah',
    category: 'battery',
    capacity: 400,
    voltage: 12
  },
  
  // Inverters
  {
    id: 'inv-1',
    name: 'AIMS 1000W Pure Sine Wave',
    brand: 'AIMS',
    specs: '1000W, 12V, Pure Sine Wave',
    price: 199,
    affiliateLink: 'https://example.com/aims-1000w',
    category: 'inverter',
    watts: 1000,
    voltage: 12
  },
  {
    id: 'inv-2',
    name: 'Victron MultiPlus 2000VA',
    brand: 'Victron',
    specs: '2000VA, 12V, Inverter/Charger',
    price: 649,
    affiliateLink: 'https://example.com/victron-2000va',
    category: 'inverter',
    watts: 1600,
    voltage: 12
  },
  {
    id: 'inv-3',
    name: 'Magnum MS4024PAE',
    brand: 'Magnum',
    specs: '4000W, 24V, Pure Sine Wave',
    price: 1299,
    affiliateLink: 'https://example.com/magnum-4000w',
    category: 'inverter',
    watts: 4000,
    voltage: 24
  },

  // Solar Panels
  {
    id: 'sol-1',
    name: 'Renogy 100W Monocrystalline',
    brand: 'Renogy',
    specs: '100W, Monocrystalline',
    price: 89,
    affiliateLink: 'https://example.com/renogy-100w',
    category: 'solar',
    watts: 100
  },
  {
    id: 'sol-2',
    name: 'Goal Zero Boulder 200',
    brand: 'Goal Zero',
    specs: '200W, Monocrystalline',
    price: 349,
    affiliateLink: 'https://example.com/goalzero-200w',
    category: 'solar',
    watts: 200
  },
  {
    id: 'sol-3',
    name: 'BattleBorn 400W Flexible',
    brand: 'Battle Born',
    specs: '400W, Flexible Panel',
    price: 599,
    affiliateLink: 'https://example.com/battleborn-400w',
    category: 'solar',
    watts: 400
  },

  // MPPTs
  {
    id: 'mppt-1',
    name: 'Victron SmartSolar 30A',
    brand: 'Victron',
    specs: '30A, 12/24V, Bluetooth',
    price: 149,
    affiliateLink: 'https://example.com/victron-30a',
    category: 'mppt'
  },
  {
    id: 'mppt-2',
    name: 'Renogy Rover 60A',
    brand: 'Renogy',
    specs: '60A, 12/24V, LCD Display',
    price: 199,
    affiliateLink: 'https://example.com/renogy-60a',
    category: 'mppt'
  },
  {
    id: 'mppt-3',
    name: 'Victron SmartSolar 100A',
    brand: 'Victron',
    specs: '100A, 12/24/48V, Bluetooth',
    price: 399,
    affiliateLink: 'https://example.com/victron-100a',
    category: 'mppt'
  }
];

export const productTiers: ProductTier[] = [
  {
    name: 'Budget',
    description: 'Basic setup for minimal power needs',
    priceRange: '$500 - $1,500',
    batteries: sampleProducts.filter(p => p.category === 'battery' && p.price < 800),
    inverters: sampleProducts.filter(p => p.category === 'inverter' && p.price < 300),
    solarPanels: sampleProducts.filter(p => p.category === 'solar' && p.price < 150),
    mppts: sampleProducts.filter(p => p.category === 'mppt' && p.price < 200),
    accessories: []
  },
  {
    name: 'Mid-Range',
    description: 'Balanced performance and reliability',
    priceRange: '$1,500 - $4,000',
    batteries: sampleProducts.filter(p => p.category === 'battery' && p.price >= 600 && p.price < 1200),
    inverters: sampleProducts.filter(p => p.category === 'inverter' && p.price >= 300 && p.price < 800),
    solarPanels: sampleProducts.filter(p => p.category === 'solar' && p.price >= 150 && p.price < 400),
    mppts: sampleProducts.filter(p => p.category === 'mppt' && p.price >= 150 && p.price < 300),
    accessories: []
  },
  {
    name: 'Premium',
    description: 'High-end components for maximum performance',
    priceRange: '$4,000+',
    batteries: sampleProducts.filter(p => p.category === 'battery' && p.price >= 1000),
    inverters: sampleProducts.filter(p => p.category === 'inverter' && p.price >= 800),
    solarPanels: sampleProducts.filter(p => p.category === 'solar' && p.price >= 400),
    mppts: sampleProducts.filter(p => p.category === 'mppt' && p.price >= 300),
    accessories: []
  }
];