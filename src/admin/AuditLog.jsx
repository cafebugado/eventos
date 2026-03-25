import { useState, useEffect, useCallback } from 'react'
import { Search, Filter, RefreshCw, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { getAuditLogs, getAuditUsers } from '../services/auditService'
import { Modal } from '../components/Modal'
import './AuditLog.css'

const ACTION_LABELS = {
  INSERT: { label: 'Criação', className: 'audit-badge--insert' },
  UPDATE: { label: 'Edição', className: 'audit-badge--update' },
  DELETE: { label: 'Exclusão', className: 'audit-badge--delete' },
}

const ENTITY_LABELS = {
  eventos: 'Eventos',
  tags: 'Tags',
  contribuintes: 'Contribuintes',
  comunidades: 'Comunidades',
  galeria_albuns: 'Galeria (álbuns)',
  galeria_fotos: 'Galeria (fotos)',
  user_roles: 'Permissões',
  user_profiles: 'Perfis',
}

const PAGE_SIZE = 20

function ActionBadge({ action }) {
  const cfg = ACTION_LABELS[action] || { label: action, className: '' }
  return <span className={`audit-badge ${cfg.className}`}>{cfg.label}</span>
}

function formatUserName(log) {
  const full = [log.user_nome, log.user_sobrenome].filter(Boolean).join(' ')
  return full || (log.user_id ? log.user_id.slice(0, 8) + '…' : '—')
}

function formatDate(iso) {
  if (!iso) {
    return '—'
  }
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ChangesModal({ log, onClose }) {
  if (!log) {
    return null
  }
  const changes = log.changes || {}
  const keys = Object.keys(changes)

  return (
    <Modal isOpen onClose={onClose} title="Detalhes da alteração" size="lg">
      <div className="audit-changes">
        <div className="audit-changes-meta">
          <span>
            <strong>Entidade:</strong> {ENTITY_LABELS[log.entity] || log.entity}
          </span>
          <span>
            <strong>ID:</strong> {log.entity_id}
          </span>
          <span>
            <strong>Ação:</strong> <ActionBadge action={log.action} />
          </span>
          <span>
            <strong>Data:</strong> {formatDate(log.created_at)}
          </span>
          <span>
            <strong>Usuário:</strong> {formatUserName(log)}
            {log.user_id && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginLeft: 6 }}>
                ({log.user_id.slice(0, 8)}…)
              </span>
            )}
          </span>
        </div>

        {keys.length === 0 ? (
          <p className="audit-changes-empty">Sem detalhes de campos registrados.</p>
        ) : (
          <table className="audit-changes-table">
            <thead>
              <tr>
                <th>Campo</th>
                <th>Antes</th>
                <th>Depois</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => {
                const val = changes[key]
                const before = val?.before ?? val?.old ?? '—'
                const after = val?.after ?? val?.new ?? JSON.stringify(val)
                return (
                  <tr key={key}>
                    <td className="audit-field-name">{key}</td>
                    <td className="audit-field-old">{String(before)}</td>
                    <td className="audit-field-new">{String(after)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  )
}

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedLog, setSelectedLog] = useState(null)
  const [users, setUsers] = useState([])

  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    entity: '',
    dateFrom: '',
    dateTo: '',
  })
  const [pendingFilters, setPendingFilters] = useState(filters)

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const fetchLogs = useCallback(async (currentPage, currentFilters) => {
    setLoading(true)
    setError(null)
    try {
      const result = await getAuditLogs({
        ...currentFilters,
        page: currentPage,
        pageSize: PAGE_SIZE,
      })
      setLogs(result.data || [])
      setTotal(result.total || 0)
    } catch (err) {
      setError('Não foi possível carregar os logs de auditoria.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLogs(page, filters)
  }, [page, filters, fetchLogs])

  useEffect(() => {
    getAuditUsers()
      .then(setUsers)
      .catch(() => {})
  }, [])

  function applyFilters() {
    setFilters(pendingFilters)
    setPage(1)
  }

  function resetFilters() {
    const empty = { userId: '', action: '', entity: '', dateFrom: '', dateTo: '' }
    setPendingFilters(empty)
    setFilters(empty)
    setPage(1)
  }

  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <div className="audit-log">
      <div className="section-header">
        <h2>Auditoria</h2>
        <button
          className="btn-icon btn-edit"
          onClick={() => fetchLogs(page, filters)}
          title="Atualizar"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'spinning' : ''} />
        </button>
      </div>

      {/* Filtros */}
      <div className="audit-filters">
        <div className="audit-filters-row">
          <select
            value={pendingFilters.userId}
            onChange={(e) => setPendingFilters((f) => ({ ...f, userId: e.target.value }))}
          >
            <option value="">Todos os usuários</option>
            {users.map((u) => {
              const name = [u.nome, u.sobrenome].filter(Boolean).join(' ')
              const roleLabel =
                { super_admin: 'Super Admin', admin: 'Admin', moderador: 'Moderador' }[u.role] ||
                u.role
              return (
                <option key={u.user_id} value={u.user_id}>
                  {name ? `${name} (${roleLabel})` : `${u.user_id?.slice(0, 12)}… (${roleLabel})`}
                </option>
              )
            })}
          </select>

          <select
            value={pendingFilters.action}
            onChange={(e) => setPendingFilters((f) => ({ ...f, action: e.target.value }))}
          >
            <option value="">Todas as ações</option>
            <option value="INSERT">Criação</option>
            <option value="UPDATE">Edição</option>
            <option value="DELETE">Exclusão</option>
          </select>

          <select
            value={pendingFilters.entity}
            onChange={(e) => setPendingFilters((f) => ({ ...f, entity: e.target.value }))}
          >
            <option value="">Todas as entidades</option>
            <option value="eventos">Eventos</option>
            <option value="tags">Tags</option>
            <option value="contribuintes">Contribuintes</option>
            <option value="comunidades">Comunidades</option>
            <option value="galeria_albuns">Galeria (álbuns)</option>
            <option value="galeria_fotos">Galeria (fotos)</option>
            <option value="user_roles">Permissões</option>
            <option value="user_profiles">Perfis</option>
          </select>

          <input
            type="date"
            value={pendingFilters.dateFrom}
            onChange={(e) => setPendingFilters((f) => ({ ...f, dateFrom: e.target.value }))}
            title="Data inicial"
          />
          <input
            type="date"
            value={pendingFilters.dateTo}
            onChange={(e) => setPendingFilters((f) => ({ ...f, dateTo: e.target.value }))}
            title="Data final"
          />
        </div>

        <div className="audit-filters-actions">
          <button className="btn-primary btn-sm" onClick={applyFilters}>
            <Filter size={14} />
            Filtrar
          </button>
          {hasActiveFilters && (
            <button className="btn-secondary btn-sm" onClick={resetFilters}>
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Contagem */}
      <p className="audit-total">
        {loading
          ? 'Carregando…'
          : `${total} registro${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`}
      </p>

      {/* Erro */}
      {error && <div className="audit-error">{error}</div>}

      {/* Tabela */}
      {!error && (
        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Usuário</th>
                <th>Ação</th>
                <th>Entidade</th>
                <th>ID</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {loading && logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="audit-empty">
                    Carregando…
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="audit-empty">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className={loading ? 'audit-row--faded' : ''}>
                    <td className="audit-col-date" data-label="Data">
                      {formatDate(log.created_at)}
                    </td>
                    <td className="audit-col-user" data-label="Usuário">
                      {formatUserName(log)}
                    </td>
                    <td data-label="Ação">
                      <ActionBadge action={log.action} />
                    </td>
                    <td className="audit-col-entity" data-label="Entidade">
                      {ENTITY_LABELS[log.entity] || log.entity}
                    </td>
                    <td className="audit-col-id" data-label="ID" title={log.entity_id}>
                      {log.entity_id?.slice(0, 8)}…
                    </td>
                    <td className="audit-col-action">
                      <button
                        className="btn-icon btn-view"
                        onClick={() => setSelectedLog(log)}
                        title="Ver detalhes"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="audit-pagination">
          <button
            className="btn-icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Página {page} de {totalPages}
          </span>
          <button
            className="btn-icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || loading}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {selectedLog && <ChangesModal log={selectedLog} onClose={() => setSelectedLog(null)} />}
    </div>
  )
}
