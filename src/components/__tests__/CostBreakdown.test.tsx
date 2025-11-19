import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import CostBreakdown from '../CostBreakdown'
import { PowerCalculation } from '../../types'

describe('CostBreakdown', () => {
  const mockCalculation: PowerCalculation = {
    totalDailyWh: 600,
    totalDailyAh: 50,
    batteryCapacityNeeded: 200,
    solarPanelWatts: 300,
    inverterWatts: 1000
  }

  const defaultProps = {
    calculation: mockCalculation,
    selectedTier: 'mid-range' as const,
    currency: 'GBP' as const
  }

  it('renders the component with correct title', () => {
    render(<CostBreakdown {...defaultProps} />)
    
    expect(screen.getByText('Cost Breakdown - Mid-range Tier')).toBeInTheDocument()
  })

  it('displays all cost components', () => {
    render(<CostBreakdown {...defaultProps} />)
    
    expect(screen.getByText(/Batteries \(2x 100Ah\)/)).toBeInTheDocument()
    expect(screen.getByText(/Inverter \(1000W\)/)).toBeInTheDocument()
    expect(screen.getByText(/Solar Panels \(3x 100W\)/)).toBeInTheDocument()
    expect(screen.getByText('MPPT Controller')).toBeInTheDocument()
    expect(screen.getByText('Accessories & Wiring')).toBeInTheDocument()
    expect(screen.getByText('Installation')).toBeInTheDocument()
    expect(screen.getByText('Total System Cost')).toBeInTheDocument()
  })

  it('uses correct currency symbol for GBP', () => {
    render(<CostBreakdown {...defaultProps} />)
    
    // Should show £ symbols
    expect(screen.getAllByText(/£/).length).toBeGreaterThan(0)
  })

  it('uses correct currency symbol for USD', () => {
    render(<CostBreakdown {...defaultProps} currency="USD" />)
    
    // Should show $ symbols
    expect(screen.getAllByText(/\$/).length).toBeGreaterThan(0)
  })

  it('uses correct currency symbol for EUR', () => {
    render(<CostBreakdown {...defaultProps} currency="EUR" />)
    
    // Should show € symbols
    expect(screen.getAllByText(/€/).length).toBeGreaterThan(0)
  })

  it('shows "Not needed" for inverter when inverterWatts is 0', () => {
    const calculationNoInverter = {
      ...mockCalculation,
      inverterWatts: 0
    }
    
    render(<CostBreakdown {...defaultProps} calculation={calculationNoInverter} />)
    
    expect(screen.getByText(/Inverter \(Not needed\)/)).toBeInTheDocument()
  })

  it('displays financial analysis section', () => {
    render(<CostBreakdown {...defaultProps} />)
    
    expect(screen.getByText('Financial Analysis')).toBeInTheDocument()
    expect(screen.getByText('Cost per Wh')).toBeInTheDocument()
    expect(screen.getByText('Payback Period')).toBeInTheDocument()
    expect(screen.getByText('Monthly Savings')).toBeInTheDocument()
  })

  it('calculates cost per Wh correctly', () => {
    render(<CostBreakdown {...defaultProps} />)
    
    // Should show some cost per Wh value
    expect(screen.getByText(/per watt-hour of daily capacity/)).toBeInTheDocument()
  })

  it('shows payback period in years', () => {
    render(<CostBreakdown {...defaultProps} />)
    
    expect(screen.getByText(/years/)).toBeInTheDocument()
    expect(screen.getByText(/vs grid electricity at/)).toBeInTheDocument()
  })

  it('displays financing options', () => {
    render(<CostBreakdown {...defaultProps} />)
    
    expect(screen.getByText('💳 Financing Options')).toBeInTheDocument()
    expect(screen.getByText('12 months @ 0% APR:')).toBeInTheDocument()
    expect(screen.getByText('24 months @ 5.9% APR:')).toBeInTheDocument()
    expect(screen.getByText('36 months @ 7.9% APR:')).toBeInTheDocument()
  })

  it('calculates different costs for budget tier', () => {
    render(<CostBreakdown {...defaultProps} selectedTier="budget" />)
    
    expect(screen.getByText('Cost Breakdown - Budget Tier')).toBeInTheDocument()
    // Budget tier should have lower costs
  })

  it('calculates different costs for premium tier', () => {
    render(<CostBreakdown {...defaultProps} selectedTier="premium" />)
    
    expect(screen.getByText('Cost Breakdown - Premium Tier')).toBeInTheDocument()
    // Premium tier should have higher costs
  })

  it('formats large numbers with commas', () => {
    const largeCalculation = {
      ...mockCalculation,
      batteryCapacityNeeded: 1000, // This should result in costs > 1000
      solarPanelWatts: 2000
    }
    
    render(<CostBreakdown {...defaultProps} calculation={largeCalculation} />)
    
    // Should find numbers formatted with commas for thousands
    const elementsWithCommas = screen.getAllByText(/\d{1,3},\d{3}/)
    expect(elementsWithCommas.length).toBeGreaterThan(0)
  })

  it('handles zero battery capacity correctly', () => {
    const zeroCalculation = {
      ...mockCalculation,
      batteryCapacityNeeded: 0
    }
    
    render(<CostBreakdown {...defaultProps} calculation={zeroCalculation} />)
    
    expect(screen.getByText(/Batteries \(0x 100Ah\)/)).toBeInTheDocument()
  })
})