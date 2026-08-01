import { test, expect } from '@playwright/test'

test.describe('Nav mobile (MobileNav)', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('abre o menu e navega para outra página', async ({ page }) => {
    await page.goto('/')

    const fab = page.getByRole('button', { name: 'Menu de navegação' })
    await expect(fab).toBeVisible()

    await fab.click()
    await expect(page.getByRole('menuitem', { name: 'Eventos' })).toBeVisible()

    await page.getByRole('menuitem', { name: 'Eventos' }).click()
    await expect(page).toHaveURL(/\/eventos$/)
  })

  test('esconde a navegação e o toggle de tema do header no mobile', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('navigation').getByRole('link', { name: 'Eventos' })).toBeHidden()
    await expect(page.getByRole('button', { name: 'Alternar tema' })).toBeHidden()
  })

  test('não mostra o FAB de navegação mobile no desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Menu de navegação' })).toBeHidden()
  })
})
