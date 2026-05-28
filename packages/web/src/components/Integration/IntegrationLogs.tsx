import React from 'react';
import { TransactionLog } from '@claudepp/shared';

interface IntegrationLogsProps {
  logs: TransactionLog[];
  loading: boolean;
}

export const IntegrationLogs: React.FC<IntegrationLogsProps> = ({ logs, loading }) => {
  if (loading) return <div>Carregando...</div>;

  return (
    <div className="integration-logs">
      <h3>Últimas Transações</h3>
      <table>
        <thead>
          <tr>
            <th>Data</th>
            <th>Ação</th>
            <th>Resultado</th>
            <th>Mensagem</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td>{new Date(log.createdAt).toLocaleString()}</td>
              <td>{log.action}</td>
              <td className={log.result}>{log.result}</td>
              <td>{log.message}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
