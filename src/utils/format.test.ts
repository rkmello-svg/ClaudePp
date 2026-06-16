import { describe, it, expect } from 'vitest'
import { formatCurrency, formatPhone, formatCNPJ, formatCPF } from './format'

describe('formatCurrency', () => {
  it('formats a value as Brazilian Real', () => {
    const result = formatCurrency(1234.5)
    expect(result).toContain('1.234,50')
  })

  it('formats zero', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0,00')
  })
})

describe('formatPhone', () => {
  it('formats an 11-digit mobile number', () => {
    expect(formatPhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('returns the input unchanged when length is unexpected', () => {
    expect(formatPhone('123')).toBe('123')
  })
})

describe('formatCNPJ', () => {
  it('formats a 14-digit CNPJ', () => {
    expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81')
  })
})

describe('formatCPF', () => {
  it('formats an 11-digit CPF', () => {
    expect(formatCPF('12345678909')).toBe('123.456.789-09')
  })
})
