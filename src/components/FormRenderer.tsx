import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormDefinition, FormBuilderService } from '@/services/form-builder'
import { Button } from './Button'

interface FormRendererProps {
  form: FormDefinition
  onSubmit: (data: Record<string, any>) => Promise<void>
  isLoading?: boolean
}

export function FormRenderer({ form, onSubmit, isLoading }: FormRendererProps) {
  const validator = FormBuilderService.createFormValidator(form)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validator),
  })

  const sortedFields = [...form.fields].sort((a, b) => a.order - b.order)

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {sortedFields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>

          {field.type === 'textarea' && (
            <textarea
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          )}

          {field.type === 'select' && (
            <select
              id={field.name}
              {...register(field.name)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione uma opção</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {field.type === 'checkbox' && (
            <input
              type="checkbox"
              id={field.name}
              {...register(field.name)}
              className="mt-1 h-4 w-4"
            />
          )}

          {field.type === 'radio' && (
            <div className="mt-2 space-y-2">
              {field.options?.map((opt) => (
                <label key={opt.value} className="flex items-center">
                  <input
                    type="radio"
                    value={opt.value}
                    {...register(field.name)}
                    className="h-4 w-4"
                  />
                  <span className="ml-2">{opt.label}</span>
                </label>
              ))}
            </div>
          )}

          {!['textarea', 'select', 'checkbox', 'radio'].includes(field.type) && (
            <input
              type={field.type}
              id={field.name}
              placeholder={field.placeholder}
              {...register(field.name)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          )}

          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-500">
              {(errors[field.name]?.message as string) || 'Campo obrigatório'}
            </p>
          )}
        </div>
      ))}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Enviar'}
      </Button>
    </form>
  )
}
