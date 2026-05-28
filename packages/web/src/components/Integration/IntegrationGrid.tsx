import React, { useState } from 'react';
import { IntegrationConfig } from '@claudepp/shared';
import { IntegrationCard } from './IntegrationCard';
import { IntegrationModal } from './IntegrationModal';
import { useIntegration } from '../../hooks/integrations/useIntegration';

interface IntegrationGridProps {
  integrations: IntegrationConfig[];
  storeId: string;
}

export const IntegrationGrid: React.FC<IntegrationGridProps> = ({
  integrations,
  storeId,
}) => {
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationConfig | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { configure, test } = useIntegration('', storeId);

  const handleConfigure = (integration: IntegrationConfig) => {
    setSelectedIntegration(integration);
    setShowModal(true);
  };

  const handleTest = async (integration: IntegrationConfig) => {
    const success = await test();
    alert(success ? 'Teste bem-sucedido!' : 'Teste falhou');
  };

  return (
    <div className="integration-grid">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          status={integration.status}
          onConfigure={() => handleConfigure(integration)}
          onTest={() => handleTest(integration)}
          onViewLogs={() => {}}
        />
      ))}
      {selectedIntegration && (
        <IntegrationModal
          integration={selectedIntegration}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={configure}
        />
      )}
    </div>
  );
};
