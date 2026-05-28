import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductSearch } from '../components/PDVScreen/ProductSearch';
import { Cart } from '../components/PDVScreen/Cart';
import { PriceCalculator } from '../components/PDVScreen/PriceCalculator';
import { PaymentForm } from '../components/PDVScreen/PaymentForm';
import { useCart } from '../hooks/useCart';
import { useSales } from '../hooks/useSales';
import { useAuth } from '../hooks/useAuth';

export const PDVPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { items, totals, addItem, removeItem, updateItemQuantity, clearCart, discountPercent, setDiscountPercent } = useCart();
  const { createSale, loading: saleLoading } = useSales();
  const [saleSuccess, setSaleSuccess] = useState(false);

  const handleProductSelect = (product: any) => {
    addItem(product, 1);
  };

  const handlePaymentSubmit = async (payment: any) => {
    try {
      const saleData = {
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
        })),
        payment,
        discountPercent,
        status: 'completed',
      };

      const result = await createSale(saleData);

      setSaleSuccess(true);
      clearCart();

      // Reset success message after 2 seconds
      setTimeout(() => setSaleSuccess(false), 2000);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">ClaudePP PDV</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Bem-vindo, {user.name}!</span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded transition"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {saleSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded m-4">
          Venda realizada com sucesso!
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 grid grid-cols-3 gap-6">
        {/* Left Column - Product Search and Cart */}
        <div className="col-span-2 space-y-4">
          {/* Product Search */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-4">Buscar Produtos</h2>
            <ProductSearch onProductSelect={handleProductSelect} />
          </div>

          {/* Cart */}
          <Cart
            items={items}
            onQuantityChange={updateItemQuantity}
            onRemoveItem={removeItem}
          />
        </div>

        {/* Right Column - Checkout */}
        <div className="space-y-4">
          <PriceCalculator
            subtotal={totals.subtotal}
            discount={totals.discount}
            discountPercent={discountPercent}
            tax={totals.tax}
            total={totals.total}
            onDiscountChange={setDiscountPercent}
          />

          <PaymentForm
            total={totals.total}
            onPaymentSubmit={handlePaymentSubmit}
            loading={saleLoading}
          />

          <button
            onClick={clearCart}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Limpar Carrinho
          </button>
        </div>
      </div>
    </div>
  );
};
