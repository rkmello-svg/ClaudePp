import React from 'react';
import { IntegrationConfig, IntegrationStatus } from '@claudepp/shared';

interface IntegrationCardProps {
  integration: IntegrationConfig;
  status?: IntegrationStatus;
  onConfigure: () => void;
  onTest: () => void;
  onViewLogs: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  status,
  onConfigure,
  onTest,
  onViewLogs,
}) => {
  return (
    <div className="integration-card">
      <h3>{integration.name}</h3>
      <div className={`status ${status?.status || 'offline'}`}>
        {status?.status || 'offline'}
      </div>
      <p className="description">{integration.type}</p>
      <div className="actions">
        <button onClick={onConfigure}>Configurar</button>
        <button onClick={onTest}>Testar</button>
        <button onClick={onViewLogs}>Logs</button>
      </div>
    </div>
  );
};
