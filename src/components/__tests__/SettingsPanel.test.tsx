import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SettingsPanel from '../SettingsPanel'
import { Settings } from '../../types'

describe('SettingsPanel', () => {
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

  const mockProps = {
    settings: defaultSettings,
    onSettingsChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all settings fields', () => {
    render(<SettingsPanel {...mockProps} />)
    
    expect(screen.getByText('System Settings')).toBeInTheDocument()
    expect(screen.getByText('System Voltage (DC)')).toBeInTheDocument()
    expect(screen.getByText('Display Unit')).toBeInTheDocument()
    expect(screen.getByText('Currency')).toBeInTheDocument()
    expect(screen.getByText('Battery Type')).toBeInTheDocument()
    expect(screen.getByText('Days of Autonomy')).toBeInTheDocument()
    expect(screen.getByText('Peak Sun Hours')).toBeInTheDocument()
  })

  it('displays current settings values correctly', () => {
    render(<SettingsPanel {...mockProps} />)
    
    expect(screen.getByDisplayValue('12V')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Watt Hours (Wh)')).toBeInTheDocument()
    expect(screen.getByDisplayValue('British Pounds (£)')).toBeInTheDocument()
    expect(screen.getByDisplayValue('LiFePO4 (Lithium) - 90% DoD')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
    // Check for DoD input specifically by looking for the one with min="20"
    const dodInputs = screen.getAllByDisplayValue('90')
    const dodInput = dodInputs.find(input => input.getAttribute('min') === '20')
    expect(dodInput).toBeInTheDocument()
  })

  it('calls onSettingsChange when system voltage is changed', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...mockProps} />)
    
    const systemVoltageSelect = screen.getByDisplayValue('12V')
    await user.selectOptions(systemVoltageSelect, '24')
    
    expect(mockProps.onSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      systemVoltage: 24
    })
  })

  it('calls onSettingsChange when display unit is changed', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...mockProps} />)
    
    const displayUnitSelect = screen.getByDisplayValue('Watt Hours (Wh)')
    await user.selectOptions(displayUnitSelect, 'Ah')
    
    expect(mockProps.onSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      displayUnit: 'Ah'
    })
  })

  it('calls onSettingsChange when currency is changed', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...mockProps} />)
    
    const currencySelect = screen.getByDisplayValue('British Pounds (£)')
    await user.selectOptions(currencySelect, 'USD')
    
    expect(mockProps.onSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      currency: 'USD'
    })
  })

  it('automatically updates DoD and efficiency when battery type changes', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...mockProps} />)
    
    const batteryTypeSelect = screen.getByDisplayValue('LiFePO4 (Lithium) - 90% DoD')
    await user.selectOptions(batteryTypeSelect, 'Lead Acid')
    
    expect(mockProps.onSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      batteryType: 'Lead Acid',
      depthOfDischarge: 0.5, // 50% for Lead Acid
      batteryEfficiency: 0.85
    })
  })

  it('updates DoD for AGM batteries correctly', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...mockProps} />)
    
    const batteryTypeSelect = screen.getByDisplayValue('LiFePO4 (Lithium) - 90% DoD')
    await user.selectOptions(batteryTypeSelect, 'AGM')
    
    expect(mockProps.onSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      batteryType: 'AGM',
      depthOfDischarge: 0.7, // 70% for AGM
      batteryEfficiency: 0.9
    })
  })

  it('updates DoD for Gel batteries correctly', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...mockProps} />)
    
    const batteryTypeSelect = screen.getByDisplayValue('LiFePO4 (Lithium) - 90% DoD')
    await user.selectOptions(batteryTypeSelect, 'Gel')
    
    expect(mockProps.onSettingsChange).toHaveBeenCalledWith({
      ...defaultSettings,
      batteryType: 'Gel',
      depthOfDischarge: 0.7, // 70% for Gel
      batteryEfficiency: 0.9
    })
  })

  it('allows manual override of depth of discharge', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...mockProps} />)
    
    // Find the DoD input by its specific attributes
    const dodInput = screen.getAllByDisplayValue('90').find(input => 
      input.getAttribute('min') === '20'
    )!
    await user.clear(dodInput)
    await user.type(dodInput, '85')
    
    // Check the last call since typing triggers multiple calls
    const lastCall = mockProps.onSettingsChange.mock.calls[mockProps.onSettingsChange.mock.calls.length - 1]
    expect(lastCall[0]).toEqual({
      ...defaultSettings,
      depthOfDischarge: 0.85
    })
  })

  it('updates days of autonomy correctly', async () => {
    const user = userEvent.setup()
    render(<SettingsPanel {...mockProps} />)
    
    const autonomyInput = screen.getByDisplayValue('2')
    await user.clear(autonomyInput)
    await user.type(autonomyInput, '3')
    
    // Check the last call since typing triggers multiple calls
    const lastCall = mockProps.onSettingsChange.mock.calls[mockProps.onSettingsChange.mock.calls.length - 1]
    expect(lastCall[0]).toEqual({
      ...defaultSettings,
      daysOfAutonomy: 3
    })
  })

  it('shows helpful tooltips and descriptions', () => {
    render(<SettingsPanel {...mockProps} />)
    
    expect(screen.getByText('How many days without charging')).toBeInTheDocument()
    expect(screen.getByText('Battery system voltage')).toBeInTheDocument()
    expect(screen.getByText('Automatically set based on battery type (can be manually overridden)')).toBeInTheDocument()
    expect(screen.getByText('Average daily peak sun hours in your area')).toBeInTheDocument()
  })

  it('shows auto-set indicator for depth of discharge', () => {
    render(<SettingsPanel {...mockProps} />)
    
    expect(screen.getByText('Auto-set by battery type')).toBeInTheDocument()
  })
})