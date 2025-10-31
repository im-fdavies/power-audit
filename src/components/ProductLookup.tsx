import React, { useState } from 'react';
import { Search, Info } from 'lucide-react';

interface ProductSpec {
  name: string;
  watts?: number;
  voltage?: number;
  capacity?: number;
  type: string;
}

export default function ProductLookup() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<ProductSpec[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock product database - in real app, this would be an API call
  const mockProducts: ProductSpec[] = [
    { name: 'Dometic CFX3 35', watts: 45, type: 'Refrigerator' },
    { name: 'Victron MultiPlus 12/3000', watts: 3000, voltage: 12, type: 'Inverter' },
    { name: 'Battle Born BB10012', capacity: 100, voltage: 12, type: 'Battery' },
    { name: 'Renogy 100W Solar Panel', watts: 100, type: 'Solar Panel' },
    { name: 'MaxxFan Deluxe', watts: 20, type: 'Ventilation Fan' },
    { name: 'Nature\'s Head Composting Toilet', watts: 0, type: 'Toilet' },
    { name: 'Webasto Air Top 2000', watts: 150, type: 'Heater' },
    { name: 'Fantastic Fan 7350', watts: 15, type: 'Ventilation Fan' }
  ];

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setResults(filtered);
      setLoading(false);
    }, 500);
  };

  const addToCalculator = (product: ProductSpec) => {
    // This would integrate with the main calculator
    alert(`Added ${product.name} to calculator with ${product.watts || 0}W`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Product Lookup</h2>
      <p className="text-gray-600 mb-4">
        Don't know the power consumption of your device? Search our database of common RV, marine, and off-grid products.
      </p>

      {/* Search Input */}
      <div className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search for products (e.g., 'Dometic fridge', 'Victron inverter')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">Search Results:</h3>
          {results.map((product, index) => (
            <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">{product.type}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    {product.watts !== undefined && (
                      <span className="text-blue-600">Power: {product.watts}W</span>
                    )}
                    {product.voltage && (
                      <span className="text-green-600">Voltage: {product.voltage}V</span>
                    )}
                    {product.capacity && (
                      <span className="text-purple-600">Capacity: {product.capacity}Ah</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => addToCalculator(product)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                >
                  Add to Calculator
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {searchTerm && results.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          <Info size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No products found for "{searchTerm}"</p>
          <p className="text-sm mt-2">
            Try searching for brand names, product types, or model numbers
          </p>
        </div>
      )}

      {/* Popular Searches */}
      {!searchTerm && (
        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Popular Searches:</h3>
          <div className="flex flex-wrap gap-2">
            {['Dometic fridge', 'Victron inverter', 'MaxxFan', 'Webasto heater', 'LED lights'].map((term) => (
              <button
                key={term}
                onClick={() => {
                  setSearchTerm(term);
                  setTimeout(handleSearch, 100);
                }}
                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-200"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}