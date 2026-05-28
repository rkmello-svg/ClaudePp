import { useState, useCallback } from 'react';
import { api } from '../services/api';

export const useSales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSale = useCallback(async (saleData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/sales', saleData);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create sale');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listSales = useCallback(async (page = 1, limit = 20, status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sales', {
        params: { page, limit, status },
      });
      setSales(response.data.data);
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to list sales');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSaleById = useCallback(async (saleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/sales/${saleId}`);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch sale');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSalesStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/sales/stats');
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch stats');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelSale = useCallback(async (saleId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.delete(`/sales/${saleId}`);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to cancel sale');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sales,
    loading,
    error,
    createSale,
    listSales,
    getSaleById,
    getSalesStats,
    cancelSale,
  };
};
