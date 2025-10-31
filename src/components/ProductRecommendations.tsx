import React, { useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { ProductTier, Product, PowerCalculation } from '../types';
import { productTiers } from '../data/products';
import AccessoryRecommendations from './AccessoryRecommendations';
import CostBreakdown from './CostBreakdown';

interface Props {
  calculation: PowerCalculation;
  systemVoltage: number;
  currency: 'GBP' | 'USD' | 'EUR';
}

export default function ProductRecommendations({ calculation, systemVoltage, currency }: Props) {
  const [selectedTier, setSelectedTier] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const currentTier = productTiers[selectedTier];

  const filterProducts = (products: Product[]) => {
    if (!searchTerm) return products;
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.specs.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-medium text-gray-900">{product.name}</h4>
        <span className="text-lg font-bold text-green-600">${product.price}</span>
      </div>
      <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
      <p className="text-sm text-gray-700 mb-3">{product.specs}</p>
      <a
        href={product.affiliateLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
      >
        View Product <ExternalLink size={14} className="ml-1" />
      </a>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-xl font-semibold mb-4 md:mb-0">Product Recommendations</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tier Selection */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {productTiers.map((tier, index) => (
              <button
                key={tier.name}
                onClick={() => setSelectedTier(index)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedTier === index
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tier.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tier Description */}
      <div className="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 className="font-medium text-blue-900 mb-1">{currentTier.name} Tier</h3>
        <p className="text-blue-800 text-sm mb-2">{currentTier.description}</p>
        <p className="text-blue-700 font-medium">{currentTier.priceRange}</p>
      </div>

      {/* Cost Breakdown */}
      <div className="mb-6">
        <CostBreakdown 
          calculation={calculation} 
          selectedTier={currentTier.name.toLowerCase() as 'budget' | 'mid-range' | 'premium'}
          currency={currency}
        />
      </div>

      {/* Product Categories */}
      <div className="space-y-6">
        {/* Batteries */}
        <div>
          <h3 className="text-lg font-medium mb-3">Batteries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterProducts(currentTier.batteries).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Inverters */}
        <div>
          <h3 className="text-lg font-medium mb-3">Inverters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterProducts(currentTier.inverters).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* Solar Panels */}
        <div>
          <h3 className="text-lg font-medium mb-3">Solar Panels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterProducts(currentTier.solarPanels).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>

        {/* MPPT Controllers */}
        <div>
          <h3 className="text-lg font-medium mb-3">MPPT Charge Controllers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterProducts(currentTier.mppts).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>

      {/* Accessories Section */}
      <div className="mt-8">
        <AccessoryRecommendations />
      </div>

      {/* Premium Features Teaser */}
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <h3 className="font-medium text-purple-900 mb-2">🚀 Upgrade to Premium</h3>
        <p className="text-purple-800 text-sm mb-3">
          Get advanced features like detailed system diagrams, PDF reports, and personalized recommendations.
        </p>
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors">
          Learn More
        </button>
      </div>
    </div>
  );
}