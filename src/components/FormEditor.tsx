import { useState } from 'react'
import { FormDefinition, FormField, FormFieldType } from '@/services/form-builder'
import { Button } from './Button'
import { Card } from './Card'
import { Trash2, Plus, GripVertical } from 'lucide-react'

interface FormEditorProps {
  form: FormDefinition
  onSave: (form: FormDefinition) => Promise<void>
  isLoading?: boolean
}

const FIELD_TYPES: { label: string; value: FormFieldType }[] = [
  { label: 'Texto', value: 'text' },
  { label: 'Email', value: 'email' },
  { label: 'Telefone', value: 'phone' },
  { label: 'Número', value: 'number' },
  { label: 'Data', value: 'date' },
  { label: 'Select', value: 'select' },
  { label: 'Checkbox', value: 'checkbox' },
  { label: 'Textarea', value: 'textarea' },
  { label: 'Radio', value: 'radio' },
  { label: 'Arquivo', value: 'file' },
]

export function FormEditor({ form, onSave, isLoading }: FormEditorProps) {
  const [editingForm, setEditingForm] = useState<FormDefinition>(form)
  const [draggedField, setDraggedField] = useState<string | null>(null)

  const handleAddField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${editingForm.fields.length + 1}`,
      label: `Campo ${editingForm.fields.length + 1}`,
      type: 'text',
      required: false,
      order: editingForm.fields.length,
    }

    setEditingForm({
      ...editingForm,
      fields: [...editingForm.fields, newField],
    })
  }

  const handleUpdateField = (fieldId: string, updates: Partial<FormField>) => {
    setEditingForm({
      ...editingForm,
      fields: editingForm.fields.map((f) => (f.id === fieldId ? { ...f, ...updates } : f)),
    })
  }

  const handleDeleteField = (fieldId: string) => {
    setEditingForm({
      ...editingForm,
      fields: editingForm.fields.filter((f) => f.id !== fieldId),
    })
  }

  const handleDragStart = (fieldId: string) => {
    setDraggedField(fieldId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetFieldId: string) => {
    if (!draggedField || draggedField === targetFieldId) return

    const draggedIndex = editingForm.fields.findIndex((f) => f.id === draggedField)
    const targetIndex = editingForm.fields.findIndex((f) => f.id === targetFieldId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newFields = [...editingForm.fields]
    const [movedField] = newFields.splice(draggedIndex, 1)
    newFields.splice(targetIndex, 0, movedField)

    const reorderedFields = newFields.map((f, idx) => ({ ...f, order: idx }))

    setEditingForm({
      ...editingForm,
      fields: reorderedFields,
    })

    setDraggedField(null)
  }

  const handleSave = async () => {
    await onSave(editingForm)
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Nome do Formulário</label>
            <input
              type="text"
              value={editingForm.name}
              onChange={(e) => setEditingForm({ ...editingForm, name: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Descrição</label>
            <textarea
              value={editingForm.description || ''}
              onChange={(e) => setEditingForm({ ...editingForm, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editingForm.is_published}
              onChange={(e) => setEditingForm({ ...editingForm, is_published: e.target.checked })}
              className="h-4 w-4"
            />
            <span className="ml-2">Publicado</span>
          </label>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Campos</h3>
          <Button onClick={handleAddField} size="sm" variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Campo
          </Button>
        </div>

        <div className="space-y-3">
          {editingForm.fields.map((field) => (
            <Card key={field.id}>
              <div className="flex gap-4">
                <div
                  draggable
                  onDragStart={() => handleDragStart(field.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(field.id)}
                  className="flex-shrink-0 flex items-center cursor-grab active:cursor-grabbing"
                >
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium">Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateField(field.id, { label: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium">Nome</label>
                      <input
                        type="text"
                        value={field.name}
                        onChange={(e) => handleUpdateField(field.id, { name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium">Tipo</label>
                      <select
                        value={field.type}
                        onChange={(e) =>
                          handleUpdateField(field.id, { type: e.target.value as FormFieldType })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {FIELD_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label className="flex items-center pt-6">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          handleUpdateField(field.id, { required: e.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      <span className="ml-2 text-sm">Obrigatório</span>
                    </label>
                  </div>

                  {field.placeholder && (
                    <div>
                      <label className="block text-xs font-medium">Placeholder</label>
                      <input
                        type="text"
                        value={field.placeholder}
                        onChange={(e) =>
                          handleUpdateField(field.id, { placeholder: e.target.value })
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteField(field.id)}
                  className="flex-shrink-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? 'Salvando...' : 'Salvar Formulário'}
        </Button>
      </div>
    </div>
  )
}
