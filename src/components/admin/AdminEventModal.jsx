import React from 'react'
import {
  Calendar,
  CalendarDays,
  FileText,
  Clock,
  Tag,
  LinkIcon,
  Image,
  Upload,
  X,
  Save,
  Monitor,
  CheckCircle,
  MapPin,
} from 'lucide-react'

import RichText from '../RichText'

const AdminEventModal = ({
  onCloseModal,
  onSubmit,
  editingEvent,
  handleSubmit,
  handleImageSelect,
  register,
  errors,
  descricaoValue,
  syncDayOfWeek,
  imagePreview,
  fileInputRef,
  isSubmitting,
  removeImage,
  imageFile,
  setImagePreview,
  isUploading,
  watchModalidade,
  tags,
  selectedTags,
  toggleTagSelection,
}) => {
  return (
    <div className="modal-overlay" onClick={onCloseModal}>
      <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}</h2>
          <button className="modal-close" onClick={onCloseModal}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <div className="form-row">
            <div className="form-field">
              <label>
                <Calendar size={16} />
                Nome do Evento
              </label>
              <input
                type="text"
                placeholder="Ex: Workshop de React"
                {...register('nome', { required: 'Nome é obrigatório' })}
              />
              {errors.nome && <span className="field-error">{errors.nome.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>
                <FileText size={16} />
                Descrição do Evento
              </label>
              <textarea placeholder="Descreva o evento..." rows="3" {...register('descricao')} />
              <span className="field-helper">
                Suporta Markdown: **negrito**, *italico*, listas com &quot;-&quot; e links
                [texto](https://...)
              </span>
              {descricaoValue && (
                <div className="rich-text-preview">
                  <span className="preview-label">Pré-visualização</span>
                  <RichText content={descricaoValue} className="preview-content" />
                </div>
              )}
            </div>
          </div>

          <div className="form-row two-cols">
            <div className="form-field">
              <label>
                <CalendarDays size={16} />
                Data do Evento
              </label>
              <input
                type="date"
                placeholder="Selecione uma data"
                {...register('data_evento', {
                  required: 'Data é obrigatória',
                  onChange: (event) => syncDayOfWeek(event.target.value),
                })}
              />
              {errors.data_evento && (
                <span className="field-error">{errors.data_evento.message}</span>
              )}
            </div>
            <div className="form-field">
              <label>
                <Clock size={16} />
                Horário
              </label>
              <input
                type="text"
                placeholder="Ex: 19:00"
                {...register('horario', { required: 'Horário é obrigatório' })}
              />
              {errors.horario && <span className="field-error">{errors.horario.message}</span>}
            </div>
          </div>

          <div className="form-row two-cols">
            <div className="form-field">
              <label>
                <Calendar size={16} />
                Dia da Semana
              </label>
              <select {...register('dia_semana', { required: 'Dia da semana é obrigatório' })}>
                <option value="">Selecione...</option>
                <option value="Segunda-feira">Segunda-feira</option>
                <option value="Terça-feira">Terça-feira</option>
                <option value="Quarta-feira">Quarta-feira</option>
                <option value="Quinta-feira">Quinta-feira</option>
                <option value="Sexta-feira">Sexta-feira</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
              {errors.dia_semana && (
                <span className="field-error">{errors.dia_semana.message}</span>
              )}
            </div>
            <div className="form-field">
              <label>
                <Tag size={16} />
                Período
              </label>
              <select {...register('periodo', { required: 'Período é obrigatório' })}>
                <option value="">Selecione...</option>
                <option value="Matinal">Matinal</option>
                <option value="Diurno">Diurno</option>
                <option value="Vespertino">Vespertino</option>
                <option value="Noturno">Noturno</option>
              </select>
              {errors.periodo && <span className="field-error">{errors.periodo.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>
                <LinkIcon size={16} />
                Link do Evento
              </label>
              <input
                type="url"
                placeholder="https://..."
                {...register('link', { required: 'Link é obrigatório' })}
              />
              {errors.link && <span className="field-error">{errors.link.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>
                <Monitor size={16} />
                Modalidade
              </label>
              <select {...register('modalidade')}>
                <option value="">Selecione...</option>
                <option value="Presencial">Presencial</option>
                <option value="Online">Online</option>
                <option value="Híbrido">Híbrido</option>
              </select>
            </div>
          </div>

          {watchModalidade && watchModalidade !== 'Online' && (
            <>
              <div className="form-row">
                <div className="form-field">
                  <label>
                    <MapPin size={16} />
                    Endereço
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Av. Paulista, 1000 - Bela Vista"
                    {...register('endereco')}
                  />
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="form-field">
                  <label>
                    <MapPin size={16} />
                    Cidade
                  </label>
                  <input type="text" placeholder="Ex: São Paulo" {...register('cidade')} />
                </div>
                <div className="form-field">
                  <label>
                    <MapPin size={16} />
                    Estado
                  </label>
                  <select {...register('estado')}>
                    <option value="">Selecione...</option>
                    {ESTADOS_BR.map((uf) => (
                      <option key={uf} value={uf}>
                        {uf}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="form-row">
            <div className="form-field">
              <label>
                <Tag size={16} />
                Tags de Tecnologia
              </label>
              {tags.length === 0 ? (
                <span className="field-helper">
                  Nenhuma tag cadastrada. Crie tags na aba &quot;Tags&quot; primeiro.
                </span>
              ) : (
                <div className="tags-selector">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      className={`tag-selector-item ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                      style={{
                        '--tag-color': tag.cor || '#2563eb',
                      }}
                      onClick={() => toggleTagSelection(tag.id)}
                    >
                      {tag.nome}
                      {selectedTags.includes(tag.id) && <CheckCircle size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>
                <Image size={16} />
                Imagem do Evento
              </label>

              <div className="image-upload-container">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button type="button" className="remove-image" onClick={removeImage}>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="image-upload-area" onClick={() => fileInputRef.current?.click()}>
                    <Upload size={32} />
                    <p>Clique para fazer upload</p>
                    <span>PNG, JPG até 5MB</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  style={{ display: 'none' }}
                />
              </div>

              <div className="image-url-option">
                <span>ou cole a URL da imagem:</span>
                <input
                  type="url"
                  placeholder="https://..."
                  {...register('imagem')}
                  onChange={(e) => {
                    if (e.target.value && !imageFile) {
                      setImagePreview(e.target.value)
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onCloseModal}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="button-spinner"></span>
                  {isUploading ? 'Enviando imagem...' : 'Salvando...'}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminEventModal
