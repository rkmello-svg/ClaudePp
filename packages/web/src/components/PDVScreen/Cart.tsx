import React from 'react';
import { CartItem } from '../../hooks/useCart';

interface CartProps {
  items: CartItem[];
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
}

export const Cart: React.FC<CartProps> = ({ items, onQuantityChange, onRemoveItem }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-xl font-bold mb-4">Itens do Carrinho</h2>

      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhum item no carrinho</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between border-b pb-3">
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.productName}</p>
                <p className="text-sm text-gray-500">R$ {item.unitPrice.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onQuantityChange(item.productId, item.quantity - 1)}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                  className="w-12 text-center border border-gray-300 rounded"
                  min="1"
                />
                <button
                  onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                  className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                >
                  +
                </button>
              </div>

              <div className="ml-4 text-right">
                <p className="font-semibold text-gray-800">
                  R$ {item.subtotal.toFixed(2)}
                </p>
              </div>

              <button
                onClick={() => onRemoveItem(item.productId)}
                className="ml-2 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
              >
                X
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
