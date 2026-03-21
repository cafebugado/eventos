import { useState, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import {
  Plus,
  Images,
  Trash2,
  Edit2,
  X,
  Upload,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import './GalleryAdmin.css'

const EMPTY_ALBUM = {
  id: null,
  eventName: '',
  eventDate: '',
  community: '',
  photos: [],
}

function PhotoCard({ photo, onDelete }) {
  return (
    <div className="ga-photo-card">
      <div className="ga-photo-thumb-wrap">
        <img src={photo.url} alt={photo.caption || 'Foto do evento'} loading="lazy" />
        <button
          type="button"
          className="ga-photo-delete"
          onClick={() => onDelete(photo.id)}
          aria-label="Remover foto"
          title="Remover foto"
        >
          <X size={14} />
        </button>
      </div>
      {photo.caption && <span className="ga-photo-caption">{photo.caption}</span>}
    </div>
  )
}

function PhotoForm({ onAdd }) {
  const [preview, setPreview] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) {
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Imagem muito grande. Máximo 5MB.')
      return
    }
    if (!file.type.startsWith('image/')) {
      setError('Arquivo inválido. Selecione uma imagem.')
      return
    }
    setError('')
    setUrlInput('')
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleUrlChange = (e) => {
    const val = e.target.value
    setUrlInput(val)
    setPreview(val || null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearPreview = () => {
    setPreview(null)
    setUrlInput('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAdd = () => {
    if (!preview) {
      setError('Selecione um arquivo ou informe a URL da foto.')
      return
    }
    onAdd({ url: preview, caption: caption.trim() })
    setPreview(null)
    setUrlInput('')
    setCaption('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="ga-photo-form">
      <div className="ga-photo-form-body">
        {/* Upload area / preview */}
        <div className="image-upload-container ga-upload-container">
          {preview ? (
            <div className="image-preview">
              <img src={preview} alt="Preview" />
              <button type="button" className="remove-image" onClick={handleClearPreview}>
                <X size={16} />
              </button>
            </div>
          ) : (
            <div
              className="image-upload-area"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              <Upload size={28} />
              <p>Clique para fazer upload</p>
              <span>PNG, JPG até 5MB</span>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {/* URL option */}
        <div className="image-url-option">
          <span>ou cole a URL da imagem:</span>
          <input type="url" placeholder="https://..." value={urlInput} onChange={handleUrlChange} />
        </div>

        {error && <span className="field-error">{error}</span>}

        {/* Caption + button */}
        <div className="ga-photo-form-row">
          <div className="form-field" style={{ flex: 1 }}>
            <label>Legenda (opcional)</label>
            <input
              type="text"
              placeholder="Ex: Abertura do evento"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <button type="button" className="btn-primary ga-add-photo-btn" onClick={handleAdd}>
            <Plus size={16} />
            Adicionar foto
          </button>
        </div>
      </div>
    </div>
  )
}

function AlbumCard({ album, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const previewPhotos = album.photos.slice(0, 3)

  return (
    <div className="ga-album-card">
      <div className="ga-album-header">
        <div className="ga-album-info">
          <h3 className="ga-album-name">{album.eventName}</h3>
          <div className="ga-album-meta">
            <span className="ga-meta-item">
              <Calendar size={13} />
              {album.eventDate}
            </span>
            <span className="ga-meta-item">
              <Users size={13} />
              {album.community}
            </span>
            <span className="ga-meta-item">
              <Images size={13} />
              {album.photos.length} foto{album.photos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        <div className="ga-album-actions">
          <button
            type="button"
            className="btn-icon btn-edit"
            onClick={() => onEdit(album)}
            title="Editar álbum"
            aria-label="Editar álbum"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            className="btn-icon btn-delete"
            onClick={() => onDelete(album.id)}
            title="Excluir álbum"
            aria-label="Excluir álbum"
          >
            <Trash2 size={16} />
          </button>
          <button
            type="button"
            className="btn-icon ga-expand-btn"
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? 'Recolher fotos' : 'Ver fotos'}
            aria-label={expanded ? 'Recolher fotos' : 'Ver fotos'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {!expanded && previewPhotos.length > 0 && (
        <div className="ga-album-preview">
          {previewPhotos.map((photo) => (
            <img
              key={photo.id}
              src={photo.url}
              alt={photo.caption || 'Foto'}
              className="ga-preview-thumb"
              loading="lazy"
            />
          ))}
          {album.photos.length > 3 && (
            <span className="ga-preview-more">+{album.photos.length - 3}</span>
          )}
        </div>
      )}

      {expanded && (
        <div className="ga-album-photos-grid">
          {album.photos.map((photo) => (
            <div key={photo.id} className="ga-photo-item">
              <img src={photo.url} alt={photo.caption || 'Foto'} loading="lazy" />
              {photo.caption && <span className="ga-photo-caption">{photo.caption}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AlbumModal({ album, eventos, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      eventoId: album?.eventoId || '',
      community: album?.community || '',
    },
  })

  const [photos, setPhotos] = useState(album?.photos || [])

  const handleAddPhoto = useCallback(({ url, caption }) => {
    setPhotos((prev) => [
      ...prev,
      { id: `p${Date.now()}_${Math.random().toString(36).slice(2)}`, url, caption },
    ])
  }, [])

  const handleRemovePhoto = useCallback((photoId) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }, [])

  const handleEventoChange = (e) => {
    const eventoId = e.target.value
    setValue('eventoId', eventoId)
    const evento = eventos.find((ev) => String(ev.id) === eventoId)
    if (evento) {
      setValue('community', evento.community || '')
    }
  }

  const onSubmit = (data) => {
    const evento = eventos.find((ev) => String(ev.id) === data.eventoId)
    onSave({
      ...album,
      eventoId: data.eventoId,
      eventName: evento?.nome || '',
      eventDate: evento?.data_evento || '',
      community: data.community,
      photos,
    })
  }

  const isEditing = Boolean(album?.id)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-large ga-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Editar Álbum' : 'Novo Álbum de Fotos'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
          <div className="form-row">
            <div className="form-field">
              <label>
                <Calendar size={15} />
                Evento
              </label>
              <select
                {...register('eventoId', { required: 'Selecione um evento' })}
                onChange={handleEventoChange}
                defaultValue={album?.eventoId || ''}
              >
                <option value="">Selecione um evento...</option>
                {eventos.map((ev) => (
                  <option key={ev.id} value={String(ev.id)}>
                    {ev.nome} — {ev.data_evento}
                  </option>
                ))}
              </select>
              {errors.eventoId && <span className="field-error">{errors.eventoId.message}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label>
                <Users size={15} />
                Comunidade
              </label>
              <input
                type="text"
                placeholder="Ex: Cafe Bugado"
                {...register('community', { required: 'Comunidade é obrigatória' })}
              />
              {errors.community && <span className="field-error">{errors.community.message}</span>}
            </div>
          </div>

          <div className="ga-photos-section">
            <h3 className="ga-photos-title">
              <Images size={16} />
              Fotos ({photos.length})
            </h3>

            <PhotoForm onAdd={handleAddPhoto} />

            {photos.length > 0 ? (
              <div className="ga-photos-list">
                {photos.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} onDelete={handleRemovePhoto} />
                ))}
              </div>
            ) : (
              <p className="ga-no-photos">Nenhuma foto adicionada ainda.</p>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {isEditing ? 'Salvar Alterações' : 'Criar Álbum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ConfirmDeleteModal({ albumName, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content ga-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Excluir Álbum</h2>
          <button className="modal-close" onClick={onCancel} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>
        <div className="ga-confirm-body">
          <Trash2 size={40} className="ga-confirm-icon" />
          <p>
            Tem certeza que deseja excluir o álbum <strong>{albumName}</strong>? Esta ação não pode
            ser desfeita.
          </p>
        </div>
        <div className="form-actions">
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

function GalleryAdmin({ showNotification, eventos = [] }) {
  const [albums, setAlbums] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredAlbums = albums.filter(
    (a) =>
      a.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.community.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const openCreateModal = () => {
    setEditingAlbum(null)
    setShowModal(true)
  }

  const openEditModal = (album) => {
    setEditingAlbum(album)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingAlbum(null)
  }

  const handleSave = (albumData) => {
    if (albumData.id) {
      setAlbums((prev) => prev.map((a) => (a.id === albumData.id ? albumData : a)))
      showNotification('Álbum atualizado com sucesso!', 'success')
    } else {
      const newAlbum = { ...albumData, id: `album_${Date.now()}` }
      setAlbums((prev) => [newAlbum, ...prev])
      showNotification('Álbum criado com sucesso!', 'success')
    }
    closeModal()
  }

  const handleDeleteRequest = (albumId) => {
    const album = albums.find((a) => a.id === albumId)
    setConfirmDelete(album)
  }

  const handleDeleteConfirm = () => {
    setAlbums((prev) => prev.filter((a) => a.id !== confirmDelete.id))
    showNotification('Álbum excluído com sucesso!', 'success')
    setConfirmDelete(null)
  }

  return (
    <div className="events-section">
      <div className="section-header">
        <h2>Galeria de Fotos</h2>
        <button className="btn-primary" onClick={openCreateModal} aria-label="Novo Álbum">
          <Plus size={18} />
          <span className="btn-text">Novo Álbum</span>
        </button>
      </div>

      {albums.length > 1 && (
        <div className="ga-search-bar">
          <input
            type="text"
            placeholder="Buscar por evento ou comunidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ga-search-input"
          />
        </div>
      )}

      {albums.length === 0 ? (
        <div className="empty-state">
          <Images size={48} />
          <h3>Nenhum álbum cadastrado</h3>
          <p>Clique em &quot;Novo Álbum&quot; para adicionar fotos da comunidade.</p>
        </div>
      ) : filteredAlbums.length === 0 ? (
        <div className="empty-state">
          <Images size={48} />
          <h3>Nenhum álbum encontrado</h3>
          <p>Tente buscar por outro termo.</p>
        </div>
      ) : (
        <div className="ga-albums-list">
          {filteredAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              onEdit={openEditModal}
              onDelete={handleDeleteRequest}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AlbumModal
          album={editingAlbum || EMPTY_ALBUM}
          eventos={eventos}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          albumName={confirmDelete.eventName}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}

export default GalleryAdmin
