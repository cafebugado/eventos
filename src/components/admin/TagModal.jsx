import React from 'react'

import { X, Tag, Palette, Save } from 'lucide-react'
import TagPreview from './TagPreview'

const TagModal = ({
  closeTagModal,
  editingTag,
  onSubmitTag,
  tagErrors,
  registerTag,
  setTagValue,
  watchTag,
  isSubmittingTag,
  handleSubmitTag,
}) => {
  return (
    <div className="modal-overlay" onClick={closeTagModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingTag ? 'Editar Tag' : 'Criar Nova Tag'}</h2>
          <button className="modal-close" onClick={closeTagModal}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmitTag(onSubmitTag)} className="modal-form">
          <div className="form-row">
            <div className="form-field">
              <label>
                <Tag size={16} />
                Nome da Tag
              </label>
              <input
                type="text"
                placeholder="Ex: React, Node.js, Python"
                {...registerTag('nome', { required: 'Nome é obrigatório' })}
              />
              {tagErrors.nome && <span className="field-error">{tagErrors.nome.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field form-field-color">
              <label>
                <Palette size={16} />
                Cor da Tag
              </label>
              <div className="color-picker-row">
                <input
                  type="color"
                  className="color-picker-input"
                  value={watchTag('cor') || '#2563eb'}
                  onChange={(e) => setTagValue('cor', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="#2563eb"
                  {...registerTag('cor')}
                  style={{
                    borderLeftWidth: '4px',
                    borderLeftColor: watchTag('cor') || '#2563eb',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tag Preview */}
          <TagPreview watchTag={watchTag} />

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={closeTagModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmittingTag}>
              {isSubmittingTag ? (
                <>
                  <span className="button-spinner"></span>
                  Salvando...
                </>
              ) : (
                <>
                  <Save size={18} />
                  {editingTag ? 'Salvar Alterações' : 'Criar Tag'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default TagModal
