import { test, expect } from '@playwright/test'

test.describe('Navegação principal', () => {
  test('deve carregar a página inicial', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Café Bugado|Eventos/)
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve navegar para a página de eventos', async ({ page }) => {
    await page.goto('/eventos')
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve navegar para a página sobre', async ({ page }) => {
    await page.goto('/sobre')
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve navegar para a página de contato', async ({ page }) => {
    await page.goto('/contato')
    await expect(page.locator('body')).toBeVisible()
  })

  test('deve mostrar 404 para rota inexistente', async ({ page }) => {
    await page.goto('/pagina-que-nao-existe')
    await expect(page.getByText('404')).toBeVisible()
  })
})

test.describe('Página de login admin', () => {
  test('deve carregar a página de login', async ({ page }) => {
    await page.goto('/admin')
    await expect(page.locator('body')).toBeVisible()
  })
})
