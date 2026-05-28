import React from 'react';

interface PriceCalculatorProps {
  subtotal: number;
  discount: number;
  discountPercent: number;
  tax: number;
  total: number;
  onDiscountChange: (percent: number) => void;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({
  subtotal,
  discount,
  discountPercent,
  tax,
  total,
  onDiscountChange,
}) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 mt-4">
      <h3 className="text-lg font-bold mb-4">Resumo</h3>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-700">Subtotal:</span>
          <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
        </div>

        <div className="flex justify-between items-center">
          <label className="text-gray-700">Desconto (%):</label>
          <input
            type="number"
            value={discountPercent}
            onChange={(e) => onDiscountChange(parseFloat(e.target.value) || 0)}
            min="0"
            max="100"
            step="0.5"
            className="w-20 px-2 py-1 border border-gray-300 rounded text-right"
          />
        </div>

        <div className="flex justify-between">
          <span className="text-gray-700">Desconto (R$):</span>
          <span className="font-semibold text-green-600">- R$ {discount.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-700">Imposto (10%):</span>
          <span className="font-semibold">R$ {tax.toFixed(2)}</span>
        </div>

        <div className="border-t pt-2 mt-2 flex justify-between text-xl">
          <span className="font-bold">Total:</span>
          <span className="font-bold text-blue-600">R$ {total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
