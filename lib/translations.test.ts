import { describe, expect, it } from 'vitest'
import {
  translateCategory,
  translateGender,
  translateTaskName,
} from '@/lib/translations'

describe('translateTaskName', () => {
  it('maps known EN task keys to FR', () => {
    expect(translateTaskName('Cleaning kitchen')).toBe('Nettoyer la cuisine')
    expect(translateTaskName('Night baby care')).toBe('Se réveiller la nuit')
  })

  it('returns the input when unknown', () => {
    expect(translateTaskName('Unknown futuristic task')).toBe('Unknown futuristic task')
  })
})

describe('translateCategory', () => {
  it('maps known categories including shopping → Achats', () => {
    expect(translateCategory('shopping')).toBe('Achats')
    expect(translateCategory('parenting')).toBe('Parentalité')
    expect(translateCategory('pet_care')).toBe('Animaux domestiques')
  })

  it('maps legacy childcare to Parentalité', () => {
    expect(translateCategory('childcare')).toBe('Parentalité')
  })

  it('returns the raw key when unknown', () => {
    expect(translateCategory('new_category_xyz')).toBe('new_category_xyz')
  })
})

describe('translateGender', () => {
  it('maps known genders', () => {
    expect(translateGender('male')).toBe('Homme')
    expect(translateGender('female')).toBe('Femme')
    expect(translateGender('neutral')).toBe('Autre')
  })

  it('returns the raw value when unknown', () => {
    expect(translateGender('other')).toBe('other')
  })
})
