import { supabase } from '../lib/supabase'
import { withRetry } from '../lib/apiClient'

export async function getAuditLogs(filters = {}) {
  return withRetry(
    async () => {
      const { userId, action, entity, dateFrom, dateTo, page = 1, pageSize = 20 } = filters

      const { data, error } = await supabase.rpc('get_audit_logs', {
        p_user_id: userId || null,
        p_action: action || null,
        p_entity: entity || null,
        p_date_from: dateFrom || null,
        p_date_to: dateTo || null,
        p_page: page,
        p_page_size: pageSize,
      })

      if (error) {
        throw error
      }

      const result = typeof data === 'string' ? JSON.parse(data) : data
      if (result.error) {
        throw new Error(result.error)
      }

      return { data: result.data || [], total: result.total || 0 }
    },
    { context: 'getAuditLogs' }
  )
}

export async function getAuditUsers() {
  return withRetry(
    async () => {
      const { data, error } = await supabase.rpc('get_audit_users')
      if (error) {
        throw error
      }

      const result = typeof data === 'string' ? JSON.parse(data) : data
      return result || []
    },
    { context: 'getAuditUsers' }
  )
}
