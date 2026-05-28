import { useState, useCallback, useMemo } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState(0);

  const addItem = useCallback(
    (product: any, quantity: number) => {
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.productId === product.id);

        if (existingItem) {
          return prevItems.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  subtotal: (item.quantity + quantity) * item.unitPrice,
                }
              : item,
          );
        }

        return [
          ...prevItems,
          {
            productId: product.id,
            productName: product.name,
            quantity,
            unitPrice: product.price,
            discount: 0,
            subtotal: quantity * product.price,
          },
        ];
      });
    },
    [],
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.productId !== productId));
  }, []);

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.unitPrice,
            }
          : item,
      ),
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscountPercent(0);
  }, []);

  const totals = useMemo(() => {
    const subtotal = items.reduce((acc, item) => acc + item.subtotal, 0);
    const discount = subtotal * (discountPercent / 100);
    const tax = (subtotal - discount) * 0.1; // 10% tax
    const total = subtotal - discount + tax;

    return {
      subtotal,
      discount,
      tax,
      total,
    };
  }, [items, discountPercent]);

  return {
    items,
    discountPercent,
    setDiscountPercent,
    addItem,
    removeItem,
    updateItemQuantity,
    clearCart,
    totals,
    itemCount: items.length,
    totalQuantity: items.reduce((acc, item) => acc + item.quantity, 0),
  };
};
