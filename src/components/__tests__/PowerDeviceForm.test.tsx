import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PowerDeviceForm from '../PowerDeviceForm'
import { PowerDevice } from '../../types'

describe('PowerDeviceForm', () => {
  const mockDevices: PowerDevice[] = [
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

  const mockProps = {
    devices: mockDevices,
    onDevicesChange: vi.fn(),
    defaultVoltage: 12,
    onDefaultVoltageChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the component with header and default voltage selector', () => {
    render(<PowerDeviceForm {...mockProps} />)
    
    expect(screen.getByText('Power Devices')).toBeInTheDocument()
    expect(screen.getByText('Default Voltage:')).toBeInTheDocument()
    expect(screen.getByDisplayValue('12V DC')).toBeInTheDocument()
  })

  it('displays existing devices correctly', () => {
    render(<PowerDeviceForm {...mockProps} />)
    
    expect(screen.getByDisplayValue('LED Lights')).toBeInTheDocument()
    expect(screen.getByDisplayValue('20')).toBeInTheDocument()
    expect(screen.getByDisplayValue('6')).toBeInTheDocument()
    expect(screen.getByText('120 Wh/day')).toBeInTheDocument()
  })

  it('shows column headers', () => {
    render(<PowerDeviceForm {...mockProps} />)
    
    expect(screen.getByText('Device Name')).toBeInTheDocument()
    expect(screen.getByText('Watts')).toBeInTheDocument()
    expect(screen.getByText('Voltage')).toBeInTheDocument()
    expect(screen.getByText('Hours/Day')).toBeInTheDocument()
    expect(screen.getByText('Category')).toBeInTheDocument()
    expect(screen.getByText('Current Type')).toBeInTheDocument()
    expect(screen.getByText('Daily Usage')).toBeInTheDocument()
  })

  it('calls onDefaultVoltageChange when default voltage is changed', async () => {
    const user = userEvent.setup()
    render(<PowerDeviceForm {...mockProps} />)
    
    const voltageSelect = screen.getByDisplayValue('12V DC')
    await user.selectOptions(voltageSelect, '24')
    
    expect(mockProps.onDefaultVoltageChange).toHaveBeenCalledWith(24)
  })

  it('adds a new device when form is filled and submitted', async () => {
    const user = userEvent.setup()
    render(<PowerDeviceForm {...mockProps} />)
    
    // Fill in the form
    const nameInput = screen.getByPlaceholderText('Device name')
    const wattsInput = screen.getByPlaceholderText('Watts')
    const hoursInput = screen.getByPlaceholderText('Hours/day')
    const addButton = screen.getByRole('button', { name: 'Add device' })
    
    await user.type(nameInput, 'Test Device')
    await user.type(wattsInput, '100')
    await user.type(hoursInput, '4')
    await user.click(addButton)
    
    expect(mockProps.onDevicesChange).toHaveBeenCalledWith([
      ...mockDevices,
      expect.objectContaining({
        name: 'Test Device',
        watts: 100,
        hoursPerDay: 4,
        voltage: 12,
        category: 'electronics',
        currentType: 'DC'
      })
    ])
  })

  it('automatically sets current type to AC when voltage is 230V', async () => {
    const user = userEvent.setup()
    render(<PowerDeviceForm {...mockProps} />)
    
    const nameInput = screen.getByPlaceholderText('Device name')
    const wattsInput = screen.getByPlaceholderText('Watts')
    const voltageInput = screen.getByPlaceholderText('Volts')
    const hoursInput = screen.getByPlaceholderText('Hours/day')
    const addButton = screen.getByRole('button', { name: 'Add device' })
    
    await user.clear(voltageInput)
    await user.type(nameInput, 'AC Device')
    await user.type(wattsInput, '100')
    await user.type(voltageInput, '230')
    await user.type(hoursInput, '4')
    await user.click(addButton)
    
    expect(mockProps.onDevicesChange).toHaveBeenCalledWith([
      ...mockDevices,
      expect.objectContaining({
        name: 'AC Device',
        voltage: 230,
        currentType: 'AC'
      })
    ])
  })

  it('removes a device when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<PowerDeviceForm {...mockProps} />)
    
    const deleteButton = screen.getByRole('button', { name: 'Delete LED Lights' })
    await user.click(deleteButton)
    
    expect(mockProps.onDevicesChange).toHaveBeenCalledWith([])
  })

  it('updates device properties when edited', async () => {
    const user = userEvent.setup()
    render(<PowerDeviceForm {...mockProps} />)
    
    const nameInput = screen.getByDisplayValue('LED Lights')
    await user.clear(nameInput)
    await user.type(nameInput, 'Updated Lights')
    
    // Check the last call since typing triggers multiple calls
    const lastCall = mockProps.onDevicesChange.mock.calls[mockProps.onDevicesChange.mock.calls.length - 1]
    expect(lastCall[0]).toEqual([
      expect.objectContaining({
        id: '1',
        name: 'Updated Lights'
      })
    ])
  })

  it('shows empty state message when no devices', () => {
    render(<PowerDeviceForm {...mockProps} devices={[]} />)
    
    expect(screen.getByText('Add your power devices to get started')).toBeInTheDocument()
  })

  it('calculates and displays daily usage correctly', () => {
    const deviceWith200Wh: PowerDevice[] = [
      {
        id: '1',
        name: 'High Power Device',
        watts: 50,
        voltage: 12,
        hoursPerDay: 4,
        category: 'appliances',
        currentType: 'DC'
      }
    ]
    
    render(<PowerDeviceForm {...mockProps} devices={deviceWith200Wh} />)
    
    expect(screen.getByText('200 Wh/day')).toBeInTheDocument()
  })
})