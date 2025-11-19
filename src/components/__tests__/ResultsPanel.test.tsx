import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ResultsPanel from '../ResultsPanel'
import { PowerCalculation } from '../../types'

describe('ResultsPanel', () => {
  const mockCalculation: PowerCalculation = {
    totalDailyWh: 600,
    totalDailyAh: 50,
    batteryCapacityNeeded: 200,
    solarPanelWatts: 300,
    inverterWatts: 1000
  }

  const defaultProps = {
    calculation: mockCalculation,
    systemVoltage: 12,
    displayUnit: 'Wh' as const
  }

  it('renders the component with correct title', () => {
    render(<ResultsPanel {...defaultProps} />)
    
    expect(screen.getByText('Power Requirements')).toBeInTheDocument()
  })

  it('displays daily energy in Wh when displayUnit is Wh', () => {
    render(<ResultsPanel {...defaultProps} />)
    
    expect(screen.getByText('Daily Energy')).toBeInTheDocument()
    expect(screen.getByText('600 Wh')).toBeInTheDocument()
    expect(screen.getByText('50.0 Ah @ 12V')).toBeInTheDocument()
  })

  it('displays daily energy in Ah when displayUnit is Ah', () => {
    render(<ResultsPanel {...defaultProps} displayUnit="Ah" />)
    
    expect(screen.getByText('Daily Energy')).toBeInTheDocument()
    expect(screen.getByText('50.0 Ah')).toBeInTheDocument()
    expect(screen.getByText('600 Wh total')).toBeInTheDocument()
  })

  it('displays battery capacity requirements', () => {
    render(<ResultsPanel {...defaultProps} />)
    
    expect(screen.getByText('Battery Capacity')).toBeInTheDocument()
    expect(screen.getByText('200 Ah')).toBeInTheDocument()
    expect(screen.getByText('~2 x 100Ah batteries')).toBeInTheDocument()
  })

  it('displays solar panel requirements', () => {
    render(<ResultsPanel {...defaultProps} />)
    
    expect(screen.getByText('Solar Panels')).toBeInTheDocument()
    expect(screen.getByText('300 W')).toBeInTheDocument()
    expect(screen.getByText('~3 x 100W panels')).toBeInTheDocument()
  })

  it('displays inverter requirements when AC devices present', () => {
    render(<ResultsPanel {...defaultProps} />)
    
    expect(screen.getByText('Inverter')).toBeInTheDocument()
    expect(screen.getByText('1000 W')).toBeInTheDocument()
    expect(screen.getByText('Minimum capacity needed')).toBeInTheDocument()
  })

  it('shows "Not needed" for inverter when no AC devices', () => {
    const calculationNoInverter = {
      ...mockCalculation,
      inverterWatts: 0
    }
    
    render(<ResultsPanel {...defaultProps} calculation={calculationNoInverter} />)
    
    expect(screen.getByText('Inverter')).toBeInTheDocument()
    expect(screen.getByText('Not needed')).toBeInTheDocument()
    expect(screen.getByText('No AC devices detected')).toBeInTheDocument()
  })

  it('displays additional components needed', () => {
    render(<ResultsPanel {...defaultProps} />)
    
    expect(screen.getByText('Additional Components Needed:')).toBeInTheDocument()
    expect(screen.getByText(/MPPT Charge Controller:/)).toBeInTheDocument()
    expect(screen.getByText(/Battery Monitor:/)).toBeInTheDocument()
    expect(screen.getByText(/Fuses\/Breakers:/)).toBeInTheDocument()
    expect(screen.getByText(/Wiring:/)).toBeInTheDocument()
    expect(screen.getByText(/DC-DC Charger:/)).toBeInTheDocument()
  })

  it('calculates MPPT requirements correctly', () => {
    render(<ResultsPanel {...defaultProps} />)
    
    // 300W / 12V * 1.25 = 31.25A, rounded up to 32A
    expect(screen.getByText(/32A minimum/)).toBeInTheDocument()
  })

  it('handles different system voltages correctly', () => {
    render(<ResultsPanel {...defaultProps} systemVoltage={24} />)
    
    // The calculation should show 25.0 Ah for 24V system (600Wh / 24V = 25Ah)
    expect(screen.getByText('25.0 Ah @ 24V')).toBeInTheDocument()
  })

  it('rounds battery count correctly', () => {
    const calculationWithOddCapacity = {
      ...mockCalculation,
      batteryCapacityNeeded: 150 // Should recommend 2 x 100Ah batteries
    }
    
    render(<ResultsPanel {...defaultProps} calculation={calculationWithOddCapacity} />)
    
    expect(screen.getByText('~2 x 100Ah batteries')).toBeInTheDocument()
  })

  it('rounds solar panel count correctly', () => {
    const calculationWithOddSolar = {
      ...mockCalculation,
      solarPanelWatts: 250 // Should recommend 3 x 100W panels
    }
    
    render(<ResultsPanel {...defaultProps} calculation={calculationWithOddSolar} />)
    
    expect(screen.getByText('~3 x 100W panels')).toBeInTheDocument()
  })
})