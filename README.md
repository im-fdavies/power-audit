# Power Calculator - Solar & Battery System Designer

A comprehensive web application for calculating power requirements and recommending solar panels, batteries, inverters, and other components for boats, vans, and off-grid homes.

## Features

### Core Functionality
- **Power Usage Calculator**: Add devices with wattage and daily usage hours
- **System Requirements**: Automatically calculates battery capacity, solar panel watts, and inverter requirements
- **Three-Tier Product Recommendations**: Budget, Mid-Range, and Premium options
- **Configurable Settings**: System voltage, days of autonomy, efficiency factors, and more
- **Product Search**: Find specific products across all categories

### Product Categories
- Batteries (LiFePO4, AGM, etc.)
- Inverters (Pure sine wave, modified sine wave)
- Solar Panels (Monocrystalline, polycrystalline, flexible)
- MPPT Charge Controllers
- Accessories (Battery monitors, DC-DC chargers, etc.)

### Planned Premium Features
- Advanced system diagrams
- PDF report generation
- Detailed cost breakdowns
- Installation guides
- Professional consultation booking

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd power-calculator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## Build for Production

```bash
npm run build
npm run preview
```

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel, Netlify, or any static hosting

## Configuration

### Adding Products
Edit `src/data/products.ts` to add new products with affiliate links:

```typescript
{
  id: 'unique-id',
  name: 'Product Name',
  brand: 'Brand Name',
  specs: 'Technical specifications',
  price: 299,
  affiliateLink: 'https://your-affiliate-link.com',
  category: 'battery' | 'inverter' | 'solar' | 'mppt' | 'accessory',
  // Additional specs for calculations
  capacity: 100, // For batteries (Ah)
  voltage: 12,   // System voltage
  watts: 100     // For inverters and solar panels
}
```

### Customizing Calculations
Modify `src/utils/calculations.ts` to adjust calculation formulas based on your requirements.

## Monetization

The app is designed with affiliate marketing in mind:
- Each product includes an `affiliateLink` field
- Products are organized by price tiers to encourage upselling
- Premium features can be gated behind a subscription
- Product recommendations drive traffic to affiliate partners

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify

### Custom Server
1. Build: `npm run build`
2. Serve the `dist` folder with any static file server

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details