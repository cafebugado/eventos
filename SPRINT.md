# SPRINT.md — Galeria de fotos (`/galeria`)

> Documento de planejamento. Nenhum código foi implementado ainda.

## Contexto

A página `/galeria` (`src/app/galeria/`) já tem toda a UI pronta e testada — `GalleryEventCard`,
`GalleryPhotoModal` (lightbox, exceção intencional ao sistema de Modal compartilhado) e
`GalleryPageClient` (orquestra os dois) — mas `page.jsx` nunca buscou dado nenhum: era um bloco
estático de "Erro ao carregar a galeria", com um comentário apontando pra Sprint 5 da API
dedicada (`D:\backendeventos-public-api`), até então travada no backlog.

A Sprint 5 do backend (`GET /gallery/albums/public`) foi implementada nesta mesma leva — ver
`D:\backendeventos-public-api\SPRINT.md`. Esta sprint só cobre o lado do frontend: plugar o
consumo real na página já existente.

## Dependência

`GET /gallery/albums/public` (backend) precisa estar disponível em produção/staging antes de
mergear o consumo no frontend. Payload confirmado: álbum `{ id, evento_nome, evento_data,
comunidade_nome, created_by_nome, created_at, fotos[] }`; foto `{ id, url, legenda, ordem,
uploaded_by_nome, created_at }`.

### Descoberta importante

Os componentes de galeria já existentes (`GalleryEventCard.jsx`, `GalleryPhotoModal.jsx`) foram
construídos **antes** do contrato da API existir, com nomes de campo em inglês/camelCase
(`eventName`, `eventDate`, `community`, `createdBy`, `photos[].thumb`, `photos[].caption`,
`photos[].postedBy`, `photos[].postedAt`) diferentes do payload real da API (português/
snake_case). Em vez de reescrever os componentes já testados, o service faz o mapeamento —
mesmo princípio do `CLAUDE.md` deste repo ("componentes client recebem os dados já prontos via
props"). Também não existe campo de thumbnail dedicado na API (só `url`) — reaproveita a mesma
URL pra `thumb`.

## Tarefas — Frontend (este repo)

### F1 — `src/services/galleryService.js` (novo)

```js
import { apiGet } from '../lib/api/eventosApi'
import { formatDateToDisplay } from '../utils/eventDate'

function mapAlbumToGalleryEvent(album) {
  return {
    id: album.id,
    eventName: album.evento_nome ?? album.comunidade_nome ?? 'Álbum da comunidade',
    eventDate: album.evento_data || formatDateToDisplay(album.created_at),
    community: album.comunidade_nome ?? '',
    createdBy: album.created_by_nome,
    photos: album.fotos.map((foto) => ({
      id: foto.id,
      url: foto.url,
      thumb: foto.url,
      caption: foto.legenda ?? '',
      postedBy: foto.uploaded_by_nome,
      postedAt: foto.created_at ? formatDateToDisplay(foto.created_at) : undefined,
    })),
  }
}

export async function getGalleryEvents() {
  const albums = await apiGet('/gallery/albums/public', { context: 'getGalleryEvents' })
  return albums.filter((album) => album.fotos.length > 0).map(mapAlbumToGalleryEvent)
}
```

Pontos de atenção:

- `GalleryEventCard` acessa `event.photos[0]` sem checagem — álbuns sem foto são filtrados
  antes do map, nunca chegam no componente.
- `postedAt`/`eventDate` reaproveitam `formatDateToDisplay` já existente
  (`src/utils/eventDate.js`) — nenhuma função de data nova.

**Critério de conclusão:** `getGalleryEvents()` busca `/gallery/albums/public` e devolve array
no shape exato esperado por `GalleryPageClient`/`GalleryEventCard`/`GalleryPhotoModal`.

**Arquivos:** `src/services/galleryService.js`, `src/services/galleryService.test.js`.

**Testes:** MSW (mesmo padrão de `eventService.test.js`) — busca com sucesso mapeando os
campos; filtra álbuns sem fotos; propaga erro com `status` em falha não-2xx.

---

### F2 — `src/app/galeria/page.jsx`

Vira Server Component assíncrono, sem try/catch — deixa o erro propagar pro `error.jsx` já
existente (`context: 'GalleryPage.error'`, já implementado e testado), removendo o bloco
estático de "Erro ao carregar a galeria" e o comentário desatualizado sobre o GRANT bloqueante.

```jsx
export default async function GalleryPage() {
  const events = await getGalleryEvents()

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
      <Stack spacing={1.5} sx={{ textAlign: 'center', mb: 5 }}>
        {/* título/descrição mantidos como estão */}
      </Stack>
      <GalleryPageClient events={events} />
    </Container>
  )
}
```

Sem estado vazio dedicado nesta leva (fora de escopo); `events=[]` renderiza
`GalleryPageClient` com uma `Stack` vazia, comportamento aceitável e não regressivo.

**Critério de conclusão:** em condição normal, `/galeria` exibe os álbuns reais da API; em
falha da API, o erro propaga pro `error.jsx` da rota (já testado), sem crash silencioso.

**Arquivos:** `src/app/galeria/page.jsx`.

---

### F3 — Testes

`src/app/galeria/page.test.jsx` (reescrever):

- mock de `getGalleryEvents` (`vi.mock('../../services/galleryService')`).
- caso "renderiza os álbuns reais retornados pela API" (mock resolve array de eventos, assert
  conteúdo renderizado).
- caso "propaga o erro pro error boundary quando a busca falha" (mock rejeita,
  `await expect(GalleryPage()).rejects.toThrow()`).
- mantém o teste de metadata existente.

Sem mudanças em `GalleryEventCard.test.jsx`/`GalleryPhotoModal.test.jsx`/
`GalleryPageClient.test.jsx` — esses componentes não mudam.

**Critério de conclusão:** `npm run test` verde, cobertura mínima do projeto mantida (55%
linhas / 50% funções / 48% branches).

**Arquivos:** `src/app/galeria/page.test.jsx`.

## Fora de escopo

- Paginação em `/gallery/albums/public` — legado não pagina, não é pedido agora.
- Geração de thumbnail dedicado para fotos (`photo.thumb` reaproveita a URL original).
- Estado vazio dedicado ("nenhum álbum ainda") na UI da galeria — não pedido, comportamento
  atual (lista vazia) não quebra nada.
- Alterar `GalleryEventCard.jsx`/`GalleryPhotoModal.jsx`/`GalleryPageClient.jsx` — já prontos e
  testados, só recebem dado já mapeado.

## Definition of Done — geral

- [x] F1–F3 concluídas com os critérios de cada uma (frontend).
- [x] `/galeria` exibe os álbuns reais da API — confirmado em 2026-08-12 rodando o backend
      localmente (`PORT=3001 npm run start:dev`) contra o Supabase real: `GET
/gallery/albums/public` devolveu 3 álbuns reais (Codecon, Databricks Meetup São Paulo,
      Techbra Meetup), `getGalleryEvents()` filtrou corretamente o álbum sem fotos (Codecon) e
      mapeou os outros dois pro shape exato de `GalleryEventCard`/`GalleryPhotoModal`. **Não
      foi possível abrir no navegador nesta sessão** — o dev server do frontend já estava
      rodando na porta 3000 (sessão do usuário, apontando pra API de produção, que ainda não
      tem a Sprint 5 deployada) e o Next.js recusa uma segunda instância na mesma pasta; quando
      o backend for deployado, a página já vai funcionar nesse mesmo dev server sem nenhuma
      mudança adicional.
- [x] Falha em `GET /gallery/albums/public` propaga pro `error.jsx` da rota (já implementado),
      sem crash silencioso — coberto por `page.test.jsx` ("propaga o erro pro error boundary da
      rota quando a busca falha").
- [x] `npx vitest run` verde (73 arquivos, 313 testes); cobertura global 84.18% linhas / 81.03%
      funções / 76.37% branches (acima do mínimo de 55/50/48); `npx eslint` sem erros nos
      arquivos alterados.
- [x] Nenhum novo `console.log`.
