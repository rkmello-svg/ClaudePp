import { useState, useEffect } from 'react';
import { PaymentMethod } from '@claudepp/shared';

export const usePaymentMethods = (storeId: string) => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMethods = async () => {
      try {
        // TODO: Call API to get payment methods
        setMethods([
          { id: '1', name: 'Cartão', type: 'card', enabled: true },
          { id: '2', name: 'PIX', type: 'pix', enabled: true },
          { id: '3', name: 'Dinheiro', type: 'cash', enabled: true },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load payment methods'));
      } finally {
        setLoading(false);
      }
    };

    fetchMethods();
  }, [storeId]);

  return { methods, loading, error };
};
