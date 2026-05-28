import { useState, useCallback } from 'react';
import { api } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const searchProducts = useCallback(async (query: string) => {
    setLoading(true);
    try {
      const response = await api.get('/products/search', {
        params: { q: query },
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error searching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductByBarcode = useCallback(async (barcode: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/barcode/${barcode}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    searchProducts,
    getProductByBarcode,
  };
};
