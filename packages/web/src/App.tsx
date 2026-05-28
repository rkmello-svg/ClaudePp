import { APP_VERSION } from '@claudepp/shared';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">ClaudePP PDV</h1>
          <p className="text-gray-600">Sistema PDV Híbrido Enterprise</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Status</h2>
          <p className="text-gray-600">Web PDV inicializado com sucesso! ✅</p>
          <p className="text-sm text-gray-500 mt-2">
            Versão {APP_VERSION} - Fase 1: Configuração Base
          </p>
        </div>
      </main>
    </div>
  );
}
