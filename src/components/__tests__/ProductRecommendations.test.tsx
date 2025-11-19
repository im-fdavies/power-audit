import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductRecommendations from '../ProductRecommendations'
import { PowerCalculation } from '../../types'

// Mock child components
vi.mock('../CostBreakdown', () => ({
  default: () => <div data-testid="cost-breakdown">Cost Breakdown</div>
}))

vi.mock('../AccessoryRecommendations', () => ({
  default: () => <div data-testid="accessory-recommendations">Accessory Recommendations</div>
}))

describe('ProductRecommendations', () => {
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
    currency: 'GBP' as const
  }

  it('renders the component with correct title', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    expect(screen.getByText('Product Recommendations')).toBeInTheDocument()
  })

  it('displays all three tier buttons', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    expect(screen.getByRole('button', { name: 'Budget' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mid-Range' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Premium' })).toBeInTheDocument()
  })

  it('shows Budget tier by default', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    expect(screen.getByText('Budget Tier')).toBeInTheDocument()
    expect(screen.getByText('Basic setup for minimal power needs')).toBeInTheDocument()
  })

  it('switches to Mid-Range tier when clicked', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    const midRangeButton = screen.getByRole('button', { name: 'Mid-Range' })
    fireEvent.click(midRangeButton)
    
    expect(screen.getByText('Mid-Range Tier')).toBeInTheDocument()
    expect(screen.getByText('Balanced performance and reliability')).toBeInTheDocument()
  })

  it('switches to Premium tier when clicked', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    const premiumButton = screen.getByRole('button', { name: 'Premium' })
    fireEvent.click(premiumButton)
    
    expect(screen.getByText('Premium Tier')).toBeInTheDocument()
    expect(screen.getByText('High-end components for maximum performance')).toBeInTheDocument()
  })

  it('displays price range with GBP symbol', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    // Budget tier price range should show £ symbol
    expect(screen.getByText(/£500 - £1,500/)).toBeInTheDocument()
  })

  it('displays price range with USD symbol', () => {
    render(<ProductRecommendations {...defaultProps} currency="USD" />)
    
    // Budget tier price range should show $ symbol
    expect(screen.getByText(/\$500 - \$1,500/)).toBeInTheDocument()
  })

  it('displays price range with EUR symbol', () => {
    render(<ProductRecommendations {...defaultProps} currency="EUR" />)
    
    // Budget tier price range should show € symbol
    expect(screen.getByText(/€500 - €1,500/)).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search products...')
    expect(searchInput).toBeInTheDocument()
  })

  it('filters products when search term is entered', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search products...')
    
    // Type a search term
    fireEvent.change(searchInput, { target: { value: 'Renogy' } })
    
    // Search input should have the value
    expect(searchInput).toHaveValue('Renogy')
  })

  it('displays product category sections', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    expect(screen.getByText('Batteries')).toBeInTheDocument()
    expect(screen.getByText('Inverters')).toBeInTheDocument()
    expect(screen.getByText('Solar Panels')).toBeInTheDocument()
    expect(screen.getByText('MPPT Charge Controllers')).toBeInTheDocument()
  })

  it('renders CostBreakdown component', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    expect(screen.getByTestId('cost-breakdown')).toBeInTheDocument()
  })

  it('renders AccessoryRecommendations component', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    expect(screen.getByTestId('accessory-recommendations')).toBeInTheDocument()
  })

  it('displays premium features teaser', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    expect(screen.getByText('🚀 Upgrade to Premium')).toBeInTheDocument()
    expect(screen.getByText(/Get advanced features like detailed system diagrams/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Learn More' })).toBeInTheDocument()
  })

  it('shows product prices with correct currency symbol for GBP', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    // Should find prices with £ symbol
    const pricesWithPound = screen.getAllByText(/£\d+/)
    expect(pricesWithPound.length).toBeGreaterThan(0)
  })

  it('shows product prices with correct currency symbol for USD', () => {
    render(<ProductRecommendations {...defaultProps} currency="USD" />)
    
    // Should find prices with $ symbol
    const pricesWithDollar = screen.getAllByText(/\$\d+/)
    expect(pricesWithDollar.length).toBeGreaterThan(0)
  })

  it('shows product prices with correct currency symbol for EUR', () => {
    render(<ProductRecommendations {...defaultProps} currency="EUR" />)
    
    // Should find prices with € symbol
    const pricesWithEuro = screen.getAllByText(/€\d+/)
    expect(pricesWithEuro.length).toBeGreaterThan(0)
  })

  it('displays product cards with View Product links', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    const viewProductLinks = screen.getAllByText('View Product')
    expect(viewProductLinks.length).toBeGreaterThan(0)
    
    // Check that links have correct attributes
    viewProductLinks.forEach(link => {
      expect(link.closest('a')).toHaveAttribute('target', '_blank')
      expect(link.closest('a')).toHaveAttribute('rel', 'noopener noreferrer')
    })
  })

  it('updates price range when tier changes', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    // Budget tier
    expect(screen.getByText(/£500 - £1,500/)).toBeInTheDocument()
    
    // Switch to Mid-Range
    const midRangeButton = screen.getByRole('button', { name: 'Mid-Range' })
    fireEvent.click(midRangeButton)
    
    expect(screen.getByText(/£1,500 - £4,000/)).toBeInTheDocument()
    
    // Switch to Premium
    const premiumButton = screen.getByRole('button', { name: 'Premium' })
    fireEvent.click(premiumButton)
    
    expect(screen.getByText(/£4,000\+/)).toBeInTheDocument()
  })

  it('highlights selected tier button', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    const budgetButton = screen.getByRole('button', { name: 'Budget' })
    const midRangeButton = screen.getByRole('button', { name: 'Mid-Range' })
    
    // Budget should be selected by default
    expect(budgetButton).toHaveClass('bg-white', 'text-blue-600')
    
    // Click Mid-Range
    fireEvent.click(midRangeButton)
    
    // Mid-Range should now be selected
    expect(midRangeButton).toHaveClass('bg-white', 'text-blue-600')
  })

  it('clears search term when typing empty string', () => {
    render(<ProductRecommendations {...defaultProps} />)
    
    const searchInput = screen.getByPlaceholderText('Search products...')
    
    // Type a search term
    fireEvent.change(searchInput, { target: { value: 'Renogy' } })
    expect(searchInput).toHaveValue('Renogy')
    
    // Clear it
    fireEvent.change(searchInput, { target: { value: '' } })
    expect(searchInput).toHaveValue('')
  })
})
