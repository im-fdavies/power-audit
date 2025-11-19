import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

describe('App Integration Tests', () => {
  it('renders the main application', () => {
    render(<App />)
    
    expect(screen.getByText('Power Calculator')).toBeInTheDocument()
    expect(screen.getByText('Design your perfect solar & battery system')).toBeInTheDocument()
  })

  it('shows navigation tabs', () => {
    render(<App />)
    
    expect(screen.getByText('Calculator')).toBeInTheDocument()
    expect(screen.getByText('Products')).toBeInTheDocument()
    expect(screen.getByText('Product Lookup')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('starts with calculator tab active', () => {
    render(<App />)
    
    expect(screen.getByText('Power Devices')).toBeInTheDocument()
    expect(screen.getByText('Power Requirements')).toBeInTheDocument()
  })

  it('loads with sample devices', () => {
    render(<App />)
    
    expect(screen.getByDisplayValue('LED Lights')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Laptop')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Refrigerator')).toBeInTheDocument()
  })

  it('switches to products tab when clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const productsTab = screen.getByText('Products')
    await user.click(productsTab)
    
    expect(screen.getByText('Product Recommendations')).toBeInTheDocument()
    expect(screen.getByText('Budget Tier')).toBeInTheDocument()
  })

  it('switches to product lookup tab when clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const lookupTab = screen.getByRole('button', { name: 'Product Lookup' })
    await user.click(lookupTab)
    
    expect(screen.getByPlaceholderText(/Search for products/)).toBeInTheDocument()
  })

  it('switches to settings tab when clicked', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    const settingsTab = screen.getByText('Settings')
    await user.click(settingsTab)
    
    expect(screen.getByText('System Settings')).toBeInTheDocument()
    expect(screen.getByText('Battery Type')).toBeInTheDocument()
  })

  it('updates calculations when devices are modified', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Find the watts input for LED Lights and change it
    const wattsInputs = screen.getAllByDisplayValue('20')
    const ledWattsInput = wattsInputs[0] // First one should be LED Lights
    
    await user.clear(ledWattsInput)
    await user.type(ledWattsInput, '50')
    
    // The daily usage should update
    expect(screen.getByText('300 Wh/day')).toBeInTheDocument() // 50W * 6h = 300Wh
  })

  it('shows correct inverter requirements based on AC devices', () => {
    render(<App />)
    
    // Should show inverter requirements since we have AC devices (Laptop, Refrigerator)
    expect(screen.getByText('Inverter')).toBeInTheDocument()
    // Should not show "Not needed" since we have AC devices
    expect(screen.queryByText('Not needed')).not.toBeInTheDocument()
  })

  it('updates default voltage and reflects in new devices', async () => {
    const user = userEvent.setup()
    render(<App />)
    
    // Change default voltage
    const defaultVoltageSelect = screen.getByDisplayValue('12V DC')
    await user.selectOptions(defaultVoltageSelect, '24')
    
    // Wait for state update and check that voltage input reflects the change
    await user.click(screen.getByPlaceholderText('Device name'))
    const voltageInput = screen.getByPlaceholderText('Volts')
    expect(voltageInput).toHaveValue(24)
  })

  it('shows footer information', () => {
    render(<App />)
    
    expect(screen.getByText('Power Calculator - Design your perfect off-grid power system')).toBeInTheDocument()
    expect(screen.getByText('Get personalized recommendations for boats, vans, and off-grid homes')).toBeInTheDocument()
  })
})