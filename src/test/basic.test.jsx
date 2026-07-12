import { describe, it, expect } from 'vitest'

describe('App - Testes Básicos', () => {
  it('deve passar com ambiente configurado', () => {
    expect(true).toBe(true)
  })

  it('deve ter as dependências corretas', () => {
    const pkg = require('../../package.json')
    expect(pkg.dependencies).toHaveProperty('react')
    expect(pkg.dependencies).toHaveProperty('@supabase/supabase-js')
    expect(pkg.dependencies).toHaveProperty('recharts')
  })
})
