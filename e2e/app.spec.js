import { test, expect } from '@playwright/test'

test.describe('Home', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Eventos Café Bugado/)
    await expect(page.getByRole('heading', { name: /eventos de tecnologia/i })).toBeVisible()
  })
})
