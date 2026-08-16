import { test, expect } from '@playwright/test'

test.describe('PWA', () => {
  test('expõe o manifest com os campos esperados', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest')
    expect(response.status()).toBe(200)

    const manifest = await response.json()
    expect(manifest.name).toBe('Eventos - Cafe Bugado')
    expect(manifest.short_name).toBe('CB Eventos')
    expect(manifest.display).toBe('standalone')
    expect(manifest.icons.length).toBeGreaterThan(0)
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true)
  })

  test('registra e ativa o service worker', async ({ page }) => {
    await page.goto('/')

    const scope = await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.ready
      return registration.scope
    })

    expect(scope).toBe('http://localhost:3000/')
  })

  test('serve o ícone da aba', async ({ page }) => {
    const response = await page.goto('/logo.ico')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type']).toMatch(/image\/(x-icon|vnd\.microsoft\.icon)/)
  })
})
