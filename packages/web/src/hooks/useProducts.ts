import { useState, useCallback } from 'react';
import { api } from '../services/api';

interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchProducts = useCallback(async (query: string, category?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/products/search', {
        params: { q: query, category },
      });
      setProducts(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to search products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductByBarcode = useCallback(async (barcode: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/products/barcode/${barcode}`);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Product not found');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProductById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/products/${id}`);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch product');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    products,
    loading,
    error,
    searchProducts,
    getProductByBarcode,
    getProductById,
  };
};
