import { z } from 'zod'
import { supabase } from '@/lib/supabase'

export type FormFieldType =
  | 'text'
  | 'email'
  | 'phone'
  | 'number'
  | 'date'
  | 'select'
  | 'checkbox'
  | 'textarea'
  | 'file'
  | 'radio'

export interface FormFieldOption {
  label: string
  value: string
}

export interface FormField {
  id: string
  name: string
  label: string
  type: FormFieldType
  required: boolean
  placeholder?: string
  defaultValue?: string | number | boolean
  options?: FormFieldOption[]
  validation?: {
    minLength?: number
    maxLength?: number
    pattern?: string
    customMessage?: string
  }
  order: number
}

export interface FormDefinition {
  id: string
  company_id: string
  name: string
  description?: string
  fields: FormField[]
  created_at: string
  updated_at: string
  is_published: boolean
}

export interface FormSubmission {
  id: string
  form_id: string
  company_id: string
  data: Record<string, any>
  submitted_at: string
  submitter_email?: string
}

export class FormBuilderService {
  static async createForm(
    company_id: string,
    form: Omit<FormDefinition, 'id' | 'company_id' | 'created_at' | 'updated_at'>,
  ): Promise<FormDefinition> {
    const { data, error } = await supabase
      .from('forms')
      .insert({
        company_id,
        name: form.name,
        description: form.description,
        fields: form.fields,
        is_published: form.is_published,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateForm(
    form_id: string,
    updates: Partial<Omit<FormDefinition, 'id' | 'company_id' | 'created_at' | 'updated_at'>>,
  ): Promise<FormDefinition> {
    const { data, error } = await supabase
      .from('forms')
      .update({
        name: updates.name,
        description: updates.description,
        fields: updates.fields,
        is_published: updates.is_published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form_id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getForm(form_id: string): Promise<FormDefinition> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('id', form_id)
      .single()

    if (error) throw error
    return data
  }

  static async listForms(company_id: string): Promise<FormDefinition[]> {
    const { data, error } = await supabase
      .from('forms')
      .select('*')
      .eq('company_id', company_id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async deleteForm(form_id: string): Promise<void> {
    const { error } = await supabase.from('forms').delete().eq('id', form_id)
    if (error) throw error
  }

  static async submitForm(
    form_id: string,
    company_id: string,
    data: Record<string, any>,
    submitter_email?: string,
  ): Promise<FormSubmission> {
    const { data: submission, error } = await supabase
      .from('form_submissions')
      .insert({
        form_id,
        company_id,
        data,
        submitter_email,
      })
      .select()
      .single()

    if (error) throw error
    return submission
  }

  static async getFormSubmissions(form_id: string): Promise<FormSubmission[]> {
    const { data, error } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', form_id)
      .order('submitted_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static createFieldValidator(field: FormField) {
    let schema: z.ZodType = z.string()

    switch (field.type) {
      case 'email':
        schema = z.string().email('Email inválido')
        break
      case 'phone':
        schema = z.string().regex(/^\d{10,11}$/, 'Telefone inválido')
        break
      case 'number':
        schema = z.number()
        break
      case 'date':
        schema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
        break
      case 'checkbox':
        schema = z.boolean()
        break
      case 'select':
      case 'radio':
        schema = z.string()
        break
      case 'textarea':
        schema = z.string()
        break
      case 'file':
        schema = z.instanceof(File)
        break
      default:
        schema = z.string()
    }

    if (field.validation?.minLength) {
      schema = (schema as z.ZodString).min(field.validation.minLength)
    }
    if (field.validation?.maxLength) {
      schema = (schema as z.ZodString).max(field.validation.maxLength)
    }
    if (field.validation?.pattern) {
      schema = (schema as z.ZodString).regex(new RegExp(field.validation.pattern))
    }

    if (!field.required) {
      schema = schema.optional()
    }

    return schema
  }

  static createFormValidator(form: FormDefinition) {
    const shape: Record<string, z.ZodType> = {}

    for (const field of form.fields) {
      shape[field.name] = this.createFieldValidator(field)
    }

    return z.object(shape)
  }
}
