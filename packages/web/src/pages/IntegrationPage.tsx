import React, { useState, useEffect } from 'react';
import { IntegrationConfig } from '@claudepp/shared';
import { IntegrationHeader } from '../components/Integration/IntegrationHeader';
import { IntegrationGrid } from '../components/Integration/IntegrationGrid';
import { useAuthStore } from '../stores/auth';

const mockIntegrations: IntegrationConfig[] = [
  {
    id: '1',
    storeId: 'store-1',
    type: 'tef',
    name: 'Stone TEF',
    enabled: false,
    config: { merchantId: '', terminalId: '', apiKey: '' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    storeId: 'store-1',
    type: 'tef',
    name: 'Elo TEF',
    enabled: false,
    config: { merchantId: '', terminalId: '', apiKey: '' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    storeId: 'store-1',
    type: 'tef',
    name: 'Ingenico TEF',
    enabled: false,
    config: { merchantId: '', terminalId: '', apiKey: '' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    storeId: 'store-1',
    type: 'printer',
    name: 'Impressora Térmica',
    enabled: false,
    config: { port: '', baudRate: 9600 },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    storeId: 'store-1',
    type: 'barcode',
    name: 'Leitor de Código de Barras',
    enabled: false,
    config: { format: 'ean13' },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const IntegrationPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const loadIntegrations = async () => {
      try {
        // TODO: Load integrations from API
        setIntegrations(mockIntegrations);
      } finally {
        setLoading(false);
      }
    };

    loadIntegrations();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="integration-page">
      <IntegrationHeader />
      <IntegrationGrid integrations={integrations} storeId={user?.storeId || ''} />
    </div>
  );
};

export default IntegrationPage;
