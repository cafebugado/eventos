import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSidebarCollapse } from './useSidebarCollapse'

const STORAGE_KEY = 'admin-sidebar-collapsed'

describe('useSidebarCollapse', () => {
  beforeEach(() => {
    localStorage.getItem.mockReset()
    localStorage.setItem.mockReset()
    // Por padrão retorna null (sem valor salvo)
    localStorage.getItem.mockReturnValue(null)
  })

  it('inicia expandido por padrão quando localStorage não tem valor', () => {
    const { result } = renderHook(() => useSidebarCollapse())
    expect(result.current.isCollapsed).toBe(false)
  })

  it('inicia recolhido quando localStorage tem "true"', () => {
    localStorage.getItem.mockReturnValue('true')
    const { result } = renderHook(() => useSidebarCollapse())
    expect(result.current.isCollapsed).toBe(true)
  })

  it('toggle alterna o estado de false para true', () => {
    const { result } = renderHook(() => useSidebarCollapse())

    act(() => result.current.toggle())
    expect(result.current.isCollapsed).toBe(true)
  })

  it('toggle alterna o estado de true para false', () => {
    localStorage.getItem.mockReturnValue('true')
    const { result } = renderHook(() => useSidebarCollapse())

    act(() => result.current.toggle())
    expect(result.current.isCollapsed).toBe(false)
  })

  it('collapse define como recolhido', () => {
    const { result } = renderHook(() => useSidebarCollapse())

    act(() => result.current.collapse())
    expect(result.current.isCollapsed).toBe(true)
  })

  it('expand define como expandido quando iniciou recolhido', () => {
    localStorage.getItem.mockReturnValue('true')
    const { result } = renderHook(() => useSidebarCollapse())

    act(() => result.current.expand())
    expect(result.current.isCollapsed).toBe(false)
  })

  it('persiste "true" no localStorage após collapse', () => {
    const { result } = renderHook(() => useSidebarCollapse())

    act(() => result.current.collapse())
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'true')
  })

  it('persiste "false" no localStorage após expand', () => {
    localStorage.getItem.mockReturnValue('true')
    const { result } = renderHook(() => useSidebarCollapse())

    act(() => result.current.expand())
    expect(localStorage.setItem).toHaveBeenCalledWith(STORAGE_KEY, 'false')
  })
})
