import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Users, Trash2, Edit2, X } from 'lucide-react'
import './GalleryAdmin.css'

function CommunityModal({ community, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { nome: community?.nome || '' },
  })

  const isEditing = Boolean(community?.id)

  const onSubmit = (data) => onSave({ ...community, ...data })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: 420, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Comunidade' : 'Nova Comunidade'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <div className="form-row">
            <div className="form-field">
              <label>
                <Users size={15} />
                Nome da Comunidade
              </label>
              <input
                type="text"
                placeholder="Ex: Cafe Bugado"
                {...register('nome', { required: 'Nome é obrigatório' })}
                autoFocus
              />
              {errors.nome && <span className="field-error">{errors.nome.message}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ communityName, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-content"
        style={{ maxWidth: 400, width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>Excluir Comunidade</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>
        <div className="ga-confirm-body">
          <Trash2 size={40} className="ga-confirm-icon" />
          <p>
            Tem certeza que deseja excluir a comunidade <strong>{communityName}</strong>? Esta ação
            não pode ser desfeita.
          </p>
        </div>
        <div className="ga-confirm-modal-actions">
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            <Trash2 size={16} />
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

function CommunityAdmin({ showNotification }) {
  const [communities, setCommunities] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingCommunity, setEditingCommunity] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const openCreateModal = () => {
    setEditingCommunity(null)
    setShowModal(true)
  }

  const openEditModal = (community) => {
    setEditingCommunity(community)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCommunity(null)
  }

  const handleSave = (data) => {
    if (data.id) {
      setCommunities((prev) => prev.map((c) => (c.id === data.id ? data : c)))
      showNotification('Comunidade atualizada com sucesso!', 'success')
    } else {
      setCommunities((prev) => [...prev, { ...data, id: `community_${Date.now()}` }])
      showNotification('Comunidade criada com sucesso!', 'success')
    }
    closeModal()
  }

  const handleDeleteConfirm = () => {
    setCommunities((prev) => prev.filter((c) => c.id !== confirmDelete.id))
    showNotification('Comunidade excluída com sucesso!', 'success')
    setConfirmDelete(null)
  }

  return (
    <div className="events-section">
      <div className="section-header">
        <h2>Comunidades</h2>
        <button className="btn-primary" onClick={openCreateModal} aria-label="Nova Comunidade">
          <Plus size={18} />
          <span className="btn-text">Nova Comunidade</span>
        </button>
      </div>

      {communities.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>Nenhuma comunidade cadastrada</h3>
          <p>Clique em &quot;Nova Comunidade&quot; para criar a primeira.</p>
        </div>
      ) : (
        <div className="tags-admin-grid">
          {communities.map((community) => (
            <div key={community.id} className="tag-admin-card">
              <div className="tag-admin-color" style={{ backgroundColor: 'var(--primary-blue)' }} />
              <div className="tag-admin-info">
                <span className="tag-admin-name">{community.nome}</span>
              </div>
              <div className="action-buttons">
                <button
                  className="btn-icon btn-edit"
                  onClick={() => openEditModal(community)}
                  title="Editar"
                  aria-label="Editar comunidade"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => setConfirmDelete(community)}
                  title="Excluir"
                  aria-label="Excluir comunidade"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <CommunityModal community={editingCommunity} onClose={closeModal} onSave={handleSave} />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          communityName={confirmDelete.nome}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

export default CommunityAdmin
