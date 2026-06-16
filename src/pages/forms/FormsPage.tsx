import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { FormBuilderService, FormDefinition } from '@/services/form-builder'
import { Button } from '@/components/Button'
import { Card } from '@/components/Card'
import { Plus, Edit2, Trash2, Eye } from 'lucide-react'

export default function FormsPage() {
  const { company } = useAuthStore()
  const [forms, setForms] = useState<FormDefinition[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (company?.id) {
      loadForms()
    }
  }, [company?.id])

  const loadForms = async () => {
    try {
      const data = await FormBuilderService.listForms(company!.id)
      setForms(data)
    } catch (err) {
      console.error('Error loading forms:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (formId: string) => {
    if (!confirm('Tem certeza que deseja excluir este formulário?')) return

    try {
      await FormBuilderService.deleteForm(formId)
      setForms(forms.filter((f) => f.id !== formId))
    } catch (err) {
      console.error('Error deleting form:', err)
    }
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Formulários</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Formulário
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">
            Nenhum formulário criado ainda. Comece criando um novo!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <Card key={form.id}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{form.name}</h3>
                  {form.description && <p className="text-gray-600 text-sm">{form.description}</p>}
                  <div className="mt-2 flex gap-2 items-center">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {form.fields.length} campos
                    </span>
                    {form.is_published && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Publicado
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(form.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
