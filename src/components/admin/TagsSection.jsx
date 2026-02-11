import React from 'react'

import { Plus, Tag, Edit2, Trash2 } from 'lucide-react'

const TagsSection = ({
  openCreateTagModal,
  openEditTagModal,
  loadingTags,
  tags,
  handleDeleteTag,
}) => {
  return (
    <div className="events-section">
      <div className="section-header">
        <h2>Tags de Tecnologia</h2>
        <button className="btn-primary" onClick={openCreateTagModal} aria-label="Nova Tag">
          <Plus size={18} />
          <span className="btn-text">Nova Tag</span>
        </button>
      </div>

      {loadingTags ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Carregando tags...</p>
        </div>
      ) : tags.length === 0 ? (
        <div className="empty-state">
          <Tag size={48} />
          <h3>Nenhuma tag cadastrada</h3>
          <p>Clique em &quot;Nova Tag&quot; para criar a primeira tag de tecnologia.</p>
        </div>
      ) : (
        <div className="tags-admin-grid">
          {tags.map((tag) => (
            <div key={tag.id} className="tag-admin-card">
              <div className="tag-admin-color" style={{ backgroundColor: tag.cor || '#2563eb' }} />
              <div className="tag-admin-info">
                <span className="tag-admin-name">{tag.nome}</span>
              </div>
              <div className="action-buttons">
                <button
                  className="btn-icon btn-edit"
                  onClick={() => openEditTagModal(tag)}
                  title="Editar"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDeleteTag(tag.id)}
                  title="Excluir"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagsSection
