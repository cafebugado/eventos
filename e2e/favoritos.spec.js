import { test, expect } from '@playwright/test'

// Este fluxo depende de haver pelo menos um evento publicado na API no
// momento do teste (não há mock aqui, é E2E de verdade). A integração com a
// API dedicada foi removida (troca de backend em andamento, ver SPRINT.md) —
// /eventos sempre renderiza estado de erro/vazio agora, então este fluxo não
// tem como rodar. Pulado explicitamente até a nova API ser plugada, em vez
// de depender do skip condicional por falta de dado (que mascararia o motivo
// real).
test.describe('Favoritos', () => {
  test('favoritar em /eventos aparece em /favoritos, e desfavoritar limpa a lista', async ({
    page,
  }) => {
    test.skip(true, 'pendente da nova API — integração atual removida, ver SPRINT.md')

    await page.goto('/eventos')
    await page.getByRole('heading', { name: 'Próximos eventos' }).waitFor()

    const favouriteButtons = page.getByRole('button', { name: 'Favoritar' })
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
