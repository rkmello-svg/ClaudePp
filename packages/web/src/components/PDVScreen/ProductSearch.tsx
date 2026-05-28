import React, { useState, useCallback } from 'react';
import { useProducts } from '../../hooks/useProducts';

interface ProductSearchProps {
  onProductSelect: (product: any) => void;
}

export const ProductSearch: React.FC<ProductSearchProps> = ({ onProductSelect }) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { products, searchProducts, loading } = useProducts();

  const handleSearch = useCallback(
    async (value: string) => {
      setQuery(value);
      if (value.trim().length > 0) {
        await searchProducts(value);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    },
    [searchProducts],
  );

  const handleProductClick = (product: any) => {
    onProductSelect(product);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Buscar produto por nome ou código de barras..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading && <div className="text-gray-500 text-sm mt-2">Buscando...</div>}

      {showResults && products.length > 0 && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-2 z-10 max-h-64 overflow-y-auto">
          {products.map((product: any) => (
            <div
              key={product.id}
              onClick={() => handleProductClick(product)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-semibold text-gray-800">{product.name}</div>
              <div className="text-sm text-gray-500">
                Código: {product.barcode} | R$ {product.price.toFixed(2)}
              </div>
              <div className="text-xs text-gray-400">Estoque: {product.stock}</div>
            </div>
          ))}
        </div>
      )}

      {showResults && products.length === 0 && !loading && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-2 p-3 z-10">
          <p className="text-gray-500 text-sm">Nenhum produto encontrado</p>
        </div>
      )}
    </div>
  );
};
