import React, { useState } from 'react';

interface PaymentFormProps {
  total: number;
  onPaymentSubmit: (payment: any) => void;
  loading: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  total,
  onPaymentSubmit,
  loading,
}) => {
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [amount, setAmount] = useState(total.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onPaymentSubmit({
      method: paymentMethod,
      amount: parseFloat(amount),
      status: 'approved',
    });
  };

  const change = parseFloat(amount) - total;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 mt-4">
      <h3 className="text-lg font-bold mb-4">Pagamento</h3>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Forma de Pagamento</label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cash">Dinheiro</option>
          <option value="card">Cartão</option>
          <option value="pix">PIX</option>
          <option value="check">Cheque</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">Valor Recebido (R$)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {paymentMethod === 'cash' && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <p className="text-sm text-gray-700">
            Total: <span className="font-bold">R$ {total.toFixed(2)}</span>
          </p>
          <p className="text-sm text-gray-700">
            Troco:
            <span className={`font-bold ml-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {change.toFixed(2)}
            </span>
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 text-lg"
      >
        {loading ? 'Finalizando...' : 'Finalizar Venda'}
      </button>
    </form>
  );
};
