import { test, expect } from '@playwright/test'

// Smoke test da Fase 0. Os demais fluxos (eventos, etc.) entram
// conforme as páginas são portadas nas fases seguintes.
test.describe('Scaffold Next.js', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Eventos Café Bugado/)
    await expect(page.getByRole('heading', { name: /eventos café bugado/i })).toBeVisible()
  })
})
