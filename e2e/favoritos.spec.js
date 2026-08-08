import { test, expect } from '@playwright/test'

// Este fluxo depende de haver pelo menos um evento publicado na API no
// momento do teste (não há mock aqui, é E2E de verdade) — se não houver
// nenhum evento disponível pra favoritar, o teste é pulado em vez de falhar
// por falta de dado, não por regressão de código.
test.describe('Favoritos', () => {
  test('favoritar em /eventos aparece em /favoritos, e desfavoritar limpa a lista', async ({
    page,
  }) => {
    await page.goto('/eventos')
    await page.getByRole('heading', { name: 'Próximos eventos' }).waitFor()

    const favouriteButtons = page.getByRole('button', { name: 'Favoritar' })
    const cardCount = await favouriteButtons.count()
    test.skip(cardCount === 0, 'nenhum evento disponível pra favoritar no momento')

    const eventName = await page.getByRole('heading', { level: 3 }).first().textContent()
    await favouriteButtons.first().click()

    await page.getByRole('link', { name: 'Favoritos' }).click()
    await expect(page).toHaveURL(/\/favoritos$/)
    await expect(page.getByRole('heading', { name: 'Meus favoritos' })).toBeVisible()
    await expect(page.getByRole('heading', { name: eventName, level: 3 })).toBeVisible()

    await page.getByRole('button', { name: 'Remover dos favoritos' }).first().click()

    await expect(page.getByText('Você ainda não favoritou nenhum evento')).toBeVisible()
  })
})
