import { describe, it, expect } from 'vitest'
import { calculatePowerRequirements, getRecommendedProducts } from '../calculations'
import { PowerDevice, Settings } from '../../types'

describe('calculatePowerRequirements', () => {
  const defaultSettings: Settings = {
    defaultVoltage: 12,
    systemVoltage: 12,
    displayUnit: 'Wh',
    currency: 'GBP',
    batteryType: 'LiFePO4',
    daysOfAutonomy: 2,
    depthOfDischarge: 0.9,
    batteryEfficiency: 0.98,
    inverterEfficiency: 0.9,
    solarEfficiency: 0.8,
    peakSunHours: 5
  }

  const sampleDevices: PowerDevice[] = [
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
    }
  ]

  it('should calculate total daily energy consumption correctly', () => {
    const result = calculatePowerRequirements(sampleDevices, defaultSettings)
    
    // DC: 20W * 6h = 120Wh
    // AC: 65W * 8h = 520Wh, but with inverter efficiency: 520/0.9 = 577.78Wh
    // Total: 120 + 577.78 = 697.78Wh
    expect(result.totalDailyWh).toBeCloseTo(697.78, 1)
  })

  it('should calculate battery capacity needed correctly', () => {
    const result = calculatePowerRequirements(sampleDevices, defaultSettings)
    
    // Total daily Ah: 697.78Wh / 12V = 58.15Ah
    // Battery capacity: (58.15 * 2 days) / (0.9 DoD * 0.98 efficiency) = 131.86Ah
    expect(result.batteryCapacityNeeded).toBeCloseTo(131.86, 1)
  })

  it('should calculate solar panel requirements correctly', () => {
    const result = calculatePowerRequirements(sampleDevices, defaultSettings)
    
    // Solar needed: 697.78Wh / (5 peak hours * 0.8 efficiency) = 174.45W
    expect(result.solarPanelWatts).toBeCloseTo(174.45, 1)
  })

  it('should calculate inverter requirements only for AC devices', () => {
    const result = calculatePowerRequirements(sampleDevices, defaultSettings)
    
    // Only AC device is laptop: 65W * 1.25 safety margin = 81.25W
    expect(result.inverterWatts).toBeCloseTo(81.25, 1)
  })

  it('should return zero inverter watts when no AC devices', () => {
    const dcOnlyDevices: PowerDevice[] = [
      {
        id: '1',
        name: 'LED Lights',
        watts: 20,
        voltage: 12,
        hoursPerDay: 6,
        category: 'lighting',
        currentType: 'DC'
      }
    ]

    const result = calculatePowerRequirements(dcOnlyDevices, defaultSettings)
    expect(result.inverterWatts).toBe(0)
  })

  it('should handle different system voltages correctly', () => {
    const settings24V = { ...defaultSettings, systemVoltage: 24 as const }
    const result = calculatePowerRequirements(sampleDevices, settings24V)
    
    // Same total Wh, but Ah should be half for 24V system
    expect(result.totalDailyAh).toBeCloseTo(result.totalDailyWh / 24, 1)
  })
})

describe('getRecommendedProducts', () => {
  it('should recommend correct number of batteries and panels', () => {
    const calculation = {
      totalDailyWh: 600,
      totalDailyAh: 50,
      batteryCapacityNeeded: 200,
      solarPanelWatts: 300,
      inverterWatts: 1000
    }

    const recommendations = getRecommendedProducts(calculation, 12)
    
    expect(recommendations.batteryCount).toBe(2) // 200Ah / 100Ah = 2
    expect(recommendations.solarPanelCount).toBe(3) // 300W / 100W = 3
    expect(recommendations.inverterMinWatts).toBe(1000)
    expect(recommendations.mpptMinAmps).toBe(32) // (300W / 12V) * 1.25 = 31.25, rounded up
  })
})