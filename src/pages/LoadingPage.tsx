export default function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ERP Enterprise OS</h1>
        <p className="text-gray-600">Carregando seu Business Operating System...</p>
      </div>
    </div>
  )
}
