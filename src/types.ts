export interface PowerDevice {
  id: string;
  name: string;
  watts: number;
  voltage: number;
  hoursPerDay: number;
  category: 'lighting' | 'electronics' | 'appliances' | 'other';
  currentType: 'AC' | 'DC';
}

export interface PowerCalculation {
  totalDailyWh: number;
  totalDailyAh: number;
  batteryCapacityNeeded: number;
  solarPanelWatts: number;
  inverterWatts: number;
}

export interface ProductTier {
  name: string;
  description: string;
  priceRange: string;
  batteries: Product[];
  inverters: Product[];
  solarPanels: Product[];
  mppts: Product[];
  accessories: Product[];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  specs: string;
  price: number;
  affiliateLink: string;
  category: 'battery' | 'inverter' | 'solar' | 'mppt' | 'accessory';
  capacity?: number; // For batteries (Ah)
  voltage?: number;
  watts?: number; // For inverters and solar panels
}

export interface Settings {
  defaultVoltage: 12 | 24 | 48 | 230;
  systemVoltage: 12 | 24 | 48;
  displayUnit: 'Wh' | 'Ah';
  currency: 'GBP' | 'USD' | 'EUR';
  batteryType: 'LiFePO4' | 'Lead Acid' | 'AGM' | 'Gel';
  daysOfAutonomy: number;
  depthOfDischarge: number;
  batteryEfficiency: number;
  inverterEfficiency: number;
  solarEfficiency: number;
  peakSunHours: number;
}