import React, { useState } from 'react';
import { IntegrationConfig } from '@claudepp/shared';

interface IntegrationModalProps {
  integration: IntegrationConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Partial<IntegrationConfig>) => Promise<void>;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  integration,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState(integration.config || {});
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ ...integration, config: formData });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Configurar {integration.name}</h2>
        <div className="form">
          {Object.entries(formData).map(([key, value]) => (
            <div key={key} className="form-group">
              <label>{key}</label>
              <input
                type="text"
                value={value as string}
                onChange={(e) =>
                  setFormData({ ...formData, [key]: e.target.value })
                }
              />
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};
