import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '../lib/supabase'
import {
  signIn,
  signOut,
  getCurrentUser,
  getSession,
  onAuthStateChange,
  signUp,
  resetPassword,
  updatePassword,
} from './authService'

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('signIn', () => {
    it('deve fazer login com sucesso', async () => {
      const mockData = {
        user: { id: '1', email: 'test@test.com' },
        session: { access_token: 'token' },
      }

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await signIn('test@test.com', 'password123')

      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      })
      expect(result).toEqual(mockData)
    })

    it('deve lançar erro quando as credenciais são inválidas', async () => {
      const mockError = new Error('Invalid credentials')

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: mockError,
      })

      await expect(signIn('wrong@test.com', 'wrongpass')).rejects.toThrow('Invalid credentials')
    })
  })

  describe('signOut', () => {
    it('deve fazer logout com sucesso', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null })

      const result = await signOut()

      expect(supabase.auth.signOut).toHaveBeenCalled()
      expect(result).toBe(true)
    })

    it('deve lançar erro quando o logout falha', async () => {
      const mockError = new Error('Logout failed')

      supabase.auth.signOut.mockResolvedValue({ error: mockError })

      await expect(signOut()).rejects.toThrow('Logout failed')
    })
  })

  describe('getCurrentUser', () => {
    it('deve retornar o usuário atual', async () => {
      const mockUser = { id: '1', email: 'test@test.com' }

      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const result = await getCurrentUser()

      expect(supabase.auth.getUser).toHaveBeenCalled()
      expect(result).toEqual(mockUser)
    })

    it('deve retornar null quando há erro', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      })

      const result = await getCurrentUser()

      expect(result).toBeNull()
    })
  })

  describe('getSession', () => {
    it('deve retornar a sessão atual', async () => {
      const mockSession = {
        access_token: 'token',
        user: { id: '1', email: 'test@test.com' },
      }

      supabase.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      const result = await getSession()

      expect(supabase.auth.getSession).toHaveBeenCalled()
      expect(result).toEqual(mockSession)
    })

    it('deve retornar null quando não há sessão', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      const result = await getSession()

      expect(result).toBeNull()
    })

    it('deve retornar null quando há erro', async () => {
      supabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: new Error('Session error'),
      })

      const result = await getSession()

      expect(result).toBeNull()
    })
  })

  describe('onAuthStateChange', () => {
    it('deve registrar callback de mudança de estado', () => {
      const mockCallback = vi.fn()
      const mockUnsubscribe = { data: { subscription: { unsubscribe: vi.fn() } } }

      supabase.auth.onAuthStateChange.mockReturnValue(mockUnsubscribe)

      const result = onAuthStateChange(mockCallback)

      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
      expect(result).toEqual(mockUnsubscribe)
    })
  })

  describe('signUp', () => {
    it('deve registrar novo usuário com sucesso', async () => {
      const mockData = {
        user: { id: '1', email: 'new@test.com' },
        session: null,
      }

      supabase.auth.signUp.mockResolvedValue({
        data: mockData,
        error: null,
      })

      const result = await signUp('new@test.com', 'password123')

      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'password123',
      })
      expect(result).toEqual(mockData)
    })

    it('deve lançar erro quando o registro falha', async () => {
      const mockError = new Error('Email already registered')

      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: mockError,
      })

      await expect(signUp('existing@test.com', 'password123')).rejects.toThrow(
        'Email already registered'
      )
    })
  })

  describe('resetPassword', () => {
    it('deve enviar email de reset com sucesso', async () => {
      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null })

      const result = await resetPassword('test@test.com')

      expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@test.com', {
        redirectTo: 'http://localhost:3000/admin/reset-password',
      })
      expect(result).toBe(true)
    })

    it('deve lançar erro quando o envio falha', async () => {
      const mockError = new Error('Email not found')

      supabase.auth.resetPasswordForEmail.mockResolvedValue({ error: mockError })

      await expect(resetPassword('notfound@test.com')).rejects.toThrow('Email not found')
    })
  })

  describe('updatePassword', () => {
    it('deve atualizar senha com sucesso', async () => {
      supabase.auth.updateUser.mockResolvedValue({ error: null })

      const result = await updatePassword('newPassword123')

      expect(supabase.auth.updateUser).toHaveBeenCalledWith({
        password: 'newPassword123',
      })
      expect(result).toBe(true)
    })

    it('deve lançar erro quando a atualização falha', async () => {
      const mockError = new Error('Password too weak')

      supabase.auth.updateUser.mockResolvedValue({ error: mockError })

      await expect(updatePassword('weak')).rejects.toThrow('Password too weak')
    })
  })
})
