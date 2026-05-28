import React from 'react';
import { IntegrationStatus } from '@claudepp/shared';

interface IntegrationStatusProps {
  status: IntegrationStatus | null;
}

export const IntegrationStatus: React.FC<IntegrationStatusProps> = ({ status }) => {
  if (!status) return null;

  return (
    <div className="integration-status">
      <div className={`status-indicator ${status.status}`} />
      <span className="status-text">{status.status}</span>
      <span className="last-check">{new Date(status.lastCheck).toLocaleString()}</span>
      {status.errorMessage && (
        <div className="error-message">{status.errorMessage}</div>
      )}
    </div>
  );
};
