import { apiGet } from '../lib/api/eventosApi'

// Buscar todos os contribuintes (já ordenados por nome pelo backend)
export async function getContributors() {
  return apiGet('/contributors', { context: 'getContributors' })
}
