import { useState, useCallback, useEffect, useRef } from 'react'
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
  User,
  Loader2,
} from 'lucide-react'
import { getCommunities } from '../services/communityService'
import {
  getAlbuns,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  uploadFoto,
  addFotoByUrl,
  deleteFoto,
  updateFotoLegenda,
} from '../services/galeriaService'
import './GalleryAdmin.css'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAuthorLabel(album) {
  const profile = album.user_profiles
  if (!profile) {
    return null
  }
  return profile.nome_completo || profile.username || null
}

// ─── PhotoCard ────────────────────────────────────────────────────────────────

function PhotoCard({ photo, onDelete, onLegendaUpdate }) {
  const [deleting, setDeleting] = useState(false)
  const [editingLegenda, setEditingLegenda] = useState(false)
  const [legendaValue, setLegendaValue] = useState(photo.legenda || '')
  const [saving, setSaving] = useState(false)
  const inputRef = useRef(null)

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(photo.id, photo.storage_path)
    setDeleting(false)
  }

  const handleEditLegenda = () => {
    setEditingLegenda(true)
    setTimeout(() => inputRef.current?.focus(), 50)
  }

  const handleSaveLegenda = async () => {
    setSaving(true)
    try {
      const updated = await updateFotoLegenda(photo.id, legendaValue)
      onLegendaUpdate(photo.id, updated.legenda)
      setEditingLegenda(false)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveLegenda()
    }
    if (e.key === 'Escape') {
      setLegendaValue(photo.legenda || '')
      setEditingLegenda(false)
    }
  }

  return (
    <div className="ga-photo-card">
      <div className="ga-photo-thumb-wrap">
        <img src={photo.url} alt={photo.legenda || 'Foto do evento'} loading="lazy" />
        <button
          type="button"
          className="ga-photo-delete"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Remover foto"
          title="Remover foto"
        >
          {deleting ? <Loader2 size={14} className="ga-spin" /> : <X size={14} />}
        </button>
      </div>

      {editingLegenda ? (
        <div className="ga-legenda-edit">
          <input
            ref={inputRef}
            type="text"
            value={legendaValue}
            onChange={(e) => setLegendaValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Legenda..."
            className="ga-legenda-input"
            disabled={saving}
          />
          <button
            type="button"
            className="ga-legenda-save"
            onClick={handleSaveLegenda}
            disabled={saving}
            title="Salvar legenda"
          >
            {saving ? <Loader2 size={12} className="ga-spin" /> : '✓'}
          </button>
          <button
            type="button"
            className="ga-legenda-cancel"
            onClick={() => {
              setLegendaValue(photo.legenda || '')
              setEditingLegenda(false)
            }}
            title="Cancelar"
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="ga-legenda-btn"
          onClick={handleEditLegenda}
          title="Editar legenda"
        >
          {legendaValue || <span className="ga-legenda-empty">+ legenda</span>}
        </button>
      )}
    </div>
  )
}

// ─── PhotoForm ────────────────────────────────────────────────────────────────

function PhotoForm({ albumId, onAdded, disabled }) {
  const [preview, setPreview] = useState(null)
  const [urlInput, setUrlInput] = useState('')
  const [caption, setCaption] = useState('')
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
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
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleUrlChange = (e) => {
    const val = e.target.value
    setUrlInput(val)
    setPreview(val || null)
    setSelectedFile(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClearPreview = () => {
    setPreview(null)
    setUrlInput('')
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAdd = async () => {
    if (!preview) {
      setError('Selecione um arquivo ou informe a URL da foto.')
      return
    }
    setUploading(true)
    setError('')
    try {
      let foto
      if (selectedFile) {
        foto = await uploadFoto(albumId, selectedFile, caption)
      } else {
        foto = await addFotoByUrl(albumId, urlInput, caption)
      }
      onAdded(foto)
      setPreview(null)
      setUrlInput('')
      setCaption('')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError('Erro ao adicionar foto. Tente novamente.')
      console.error(err)
    } finally {
      setUploading(false)
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
          <input
            type="url"
            placeholder="https://..."
            value={urlInput}
            onChange={handleUrlChange}
            disabled={uploading}
          />
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
              disabled={uploading}
            />
          </div>
          <button
            type="button"
            className="btn-primary ga-add-photo-btn"
            onClick={handleAdd}
            disabled={uploading || disabled || !preview}
          >
            {uploading ? <Loader2 size={16} className="ga-spin" /> : <Plus size={16} />}
            {uploading ? 'Enviando...' : 'Adicionar foto'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── AlbumCard ────────────────────────────────────────────────────────────────

function AlbumCard({ album, onEdit, onDelete, onAddFoto, isOwner, isModerador }) {
  const fotos = album.galeria_fotos || []
  const previewFotos = fotos.slice(0, 3)
  const author = getAuthorLabel(album)

  // Moderador só pode editar/excluir álbuns que criou; pode sempre adicionar fotos
  const canEdit = !isModerador || isOwner
  const canDelete = !isModerador || isOwner

  return (
    <div className="ga-album-card">
      <div className="ga-album-header">
        <div className="ga-album-info">
          <h3 className="ga-album-name">{album.eventos?.nome || '(Evento removido)'}</h3>
          <div className="ga-album-meta">
            <span className="ga-meta-item">
              <Calendar size={13} />
              {album.eventos?.data_evento || '—'}
            </span>
            <span className="ga-meta-item">
              <Users size={13} />
              {album.comunidades?.nome || '—'}
            </span>
            <span className="ga-meta-item">
              <Images size={13} />
              {fotos.length} foto{fotos.length !== 1 ? 's' : ''}
            </span>
            {author && (
              <span className="ga-meta-item ga-meta-author">
                <User size={13} />
                {author}
              </span>
            )}
          </div>
        </div>
        <div className="ga-album-actions">
          <button
            type="button"
            className="btn-icon btn-edit"
            onClick={() => onAddFoto(album)}
            title="Adicionar foto"
            aria-label="Adicionar foto"
          >
            <Plus size={16} />
          </button>
          {canEdit && (
            <button
              type="button"
              className="btn-icon btn-edit"
              onClick={() => onEdit(album)}
              title="Editar álbum"
              aria-label="Editar álbum"
            >
              <Edit2 size={16} />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              className="btn-icon btn-delete"
              onClick={() => onDelete(album)}
              title="Excluir álbum"
              aria-label="Excluir álbum"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {previewFotos.length > 0 && (
        <div className="ga-album-preview">
          {previewFotos.map((foto) => (
            <img
              key={foto.id}
              src={foto.url}
              alt={foto.legenda || 'Foto'}
              className="ga-preview-thumb"
              loading="lazy"
            />
          ))}
          {fotos.length > 3 && <span className="ga-preview-more">+{fotos.length - 3}</span>}
        </div>
      )}
    </div>
  )
}

// ─── AlbumModal (criar / editar álbum) ───────────────────────────────────────

function AlbumModal({
  album,
  eventos,
  comunidades,
  onClose,
  onSave,
  onFotoDeleted,
  onFotoLegendaUpdate,
  saving,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      evento_id: album?.evento_id || '',
      comunidade_id: album?.comunidade_id || '',
    },
  })

  const isEditing = Boolean(album?.id)
  const fotos = album?.galeria_fotos || []

  const onSubmit = (data) => {
    onSave({
      id: album?.id || null,
      evento_id: data.evento_id || null,
      comunidade_id: data.comunidade_id || null,
    })
  }

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
          {/* Evento */}
          <div className="form-row">
            <div className="form-field">
              <label>
                <Calendar size={15} />
                Evento
              </label>
              <select
                {...register('evento_id', { required: 'Selecione um evento' })}
                defaultValue={album?.evento_id || ''}
              >
                <option value="">Selecione um evento...</option>
                {eventos.map((ev) => (
                  <option key={ev.id} value={String(ev.id)}>
                    {ev.nome} — {ev.data_evento}
                  </option>
                ))}
              </select>
              {errors.evento_id && <span className="field-error">{errors.evento_id.message}</span>}
            </div>
          </div>

          {/* Comunidade */}
          <div className="form-row">
            <div className="form-field">
              <label>
                <Users size={15} />
                Comunidade
              </label>
              <select
                {...register('comunidade_id', { required: 'Selecione uma comunidade' })}
                defaultValue={album?.comunidade_id || ''}
              >
                <option value="">Selecione uma comunidade...</option>
                {comunidades.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {errors.comunidade_id && (
                <span className="field-error">{errors.comunidade_id.message}</span>
              )}
            </div>
          </div>

          {!isEditing && (
            <p className="ga-modal-hint">
              Após criar o álbum, clique no lápis para gerenciar as fotos.
            </p>
          )}

          {/* Fotos do álbum (somente ao editar) */}
          {isEditing && (
            <div className="ga-modal-fotos">
              <p className="ga-modal-fotos-title">
                <Images size={14} />
                Fotos ({fotos.length})
              </p>
              {fotos.length > 0 ? (
                <div className="ga-photos-list">
                  {fotos.map((foto) => (
                    <PhotoCard
                      key={foto.id}
                      photo={foto}
                      onDelete={(fotoId, storagePath) =>
                        onFotoDeleted(album.id, fotoId, storagePath)
                      }
                      onLegendaUpdate={(fotoId, legenda) =>
                        onFotoLegendaUpdate(album.id, fotoId, legenda)
                      }
                    />
                  ))}
                </div>
              ) : (
                <p className="ga-no-photos">Nenhuma foto ainda. Use o botão + para adicionar.</p>
              )}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? <Loader2 size={16} className="ga-spin" /> : null}
              {isEditing ? 'Salvar Alterações' : 'Criar Álbum'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── AddFotoModal ─────────────────────────────────────────────────────────────

function AddFotoModal({ album, onClose, onAdded }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ga-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adicionar Foto</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <X size={24} />
          </button>
        </div>
        <div className="ga-add-foto-modal-body">
          <p className="ga-add-foto-album-name">
            <Images size={14} />
            {album.eventos?.nome || 'Álbum'}
          </p>
          <PhotoForm albumId={album.id} onAdded={onAdded} />
        </div>
      </div>
    </div>
  )
}

// ─── ConfirmDeleteModal ───────────────────────────────────────────────────────

function ConfirmDeleteModal({ album, onConfirm, onCancel, deleting }) {
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
            Tem certeza que deseja excluir o álbum de{' '}
            <strong>{album.eventos?.nome || 'este evento'}</strong>? Todas as fotos serão removidas.
            Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={deleting}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm} disabled={deleting}>
            {deleting ? <Loader2 size={16} className="ga-spin" /> : <Trash2 size={16} />}
            Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── GalleryAdmin (componente principal) ─────────────────────────────────────

function GalleryAdmin({ showNotification, eventos = [], userRole, userId }) {
  const isModerador = userRole === 'moderador'
  const [albums, setAlbums] = useState([])
  const [comunidades, setComunidades] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [addFotoAlbum, setAddFotoAlbum] = useState(null)

  // Carrega comunidades imediatamente (não depende da migration da galeria)
  useEffect(() => {
    getCommunities()
      .then(setComunidades)
      .catch((err) => console.error('Erro ao carregar comunidades:', err))
  }, [])

  // Carrega álbuns separadamente (pode falhar se a migration ainda não foi executada)
  useEffect(() => {
    setLoading(true)
    getAlbuns()
      .then(setAlbums)
      .catch((err) => console.error('Erro ao carregar álbuns:', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredAlbums = albums.filter((a) => {
    const term = searchTerm.toLowerCase()
    return (
      a.eventos?.nome?.toLowerCase().includes(term) ||
      a.comunidades?.nome?.toLowerCase().includes(term)
    )
  })

  // ── Modais ──────────────────────────────────────────────────────────────────

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

  // ── Salvar álbum ────────────────────────────────────────────────────────────

  const handleSave = useCallback(
    async ({ id, evento_id, comunidade_id }) => {
      // Moderador só pode editar álbuns que criou
      if (isModerador && id) {
        const album = albums.find((a) => a.id === id)
        if (album?.created_by !== userId) {
          showNotification('Sem permissão para editar este álbum.', 'error')
          return
        }
      }
      setSaving(true)
      try {
        if (id) {
          // Ao editar, verificar duplicata excluindo o próprio álbum
          const duplicate = albums.find((a) => a.evento_id === evento_id && a.id !== id)
          if (duplicate) {
            showNotification('Já existe um álbum para este evento.', 'error')
            setSaving(false)
            return
          }
          const updated = await updateAlbum(id, { evento_id, comunidade_id })
          setAlbums((prev) => prev.map((a) => (a.id === id ? updated : a)))
          showNotification('Álbum atualizado com sucesso!', 'success')
        } else {
          const duplicate = albums.find((a) => a.evento_id === evento_id)
          if (duplicate) {
            showNotification('Já existe um álbum para este evento.', 'error')
            setSaving(false)
            return
          }
          const created = await createAlbum({ evento_id, comunidade_id })
          setAlbums((prev) => [created, ...prev])
          showNotification('Álbum criado com sucesso!', 'success')
        }
        closeModal()
      } catch (err) {
        console.error(err)
        const isDuplicate =
          err?.code === '23505' ||
          err?.message?.toLowerCase().includes('unique') ||
          err?.message?.toLowerCase().includes('duplicate')
        showNotification(
          isDuplicate ? 'Já existe um álbum para este evento.' : 'Erro ao salvar álbum.',
          'error'
        )
      } finally {
        setSaving(false)
      }
    },
    [albums, isModerador, userId, showNotification]
  )

  // ── Deletar álbum ───────────────────────────────────────────────────────────

  const handleDeleteConfirm = async () => {
    // Moderador só pode deletar álbuns que criou
    if (isModerador && confirmDelete?.created_by !== userId) {
      showNotification('Sem permissão para excluir este álbum.', 'error')
      setConfirmDelete(null)
      return
    }
    setDeleting(true)
    try {
      await deleteAlbum(confirmDelete.id)
      setAlbums((prev) => prev.filter((a) => a.id !== confirmDelete.id))
      showNotification('Álbum excluído com sucesso!', 'success')
      setConfirmDelete(null)
    } catch (err) {
      console.error(err)
      showNotification('Erro ao excluir álbum.', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── Foto adicionada inline ───────────────────────────────────────────────────

  const handleFotoAdded = useCallback(
    (albumId, foto) => {
      setAlbums((prev) =>
        prev.map((a) =>
          a.id === albumId ? { ...a, galeria_fotos: [...(a.galeria_fotos || []), foto] } : a
        )
      )
      showNotification('Foto adicionada!', 'success')
    },
    [showNotification]
  )

  // ── Foto deletada inline ─────────────────────────────────────────────────────

  const handleFotoDeleted = useCallback(
    async (albumId, fotoId, storagePath) => {
      try {
        await deleteFoto(fotoId, storagePath)
        setAlbums((prev) =>
          prev.map((a) =>
            a.id === albumId
              ? { ...a, galeria_fotos: (a.galeria_fotos || []).filter((f) => f.id !== fotoId) }
              : a
          )
        )
        showNotification('Foto removida.', 'success')
      } catch (err) {
        console.error(err)
        showNotification('Erro ao remover foto.', 'error')
      }
    },
    [showNotification]
  )

  const handleFotoLegendaUpdate = useCallback((albumId, fotoId, legenda) => {
    setAlbums((prev) =>
      prev.map((a) =>
        a.id === albumId
          ? {
              ...a,
              galeria_fotos: (a.galeria_fotos || []).map((f) =>
                f.id === fotoId ? { ...f, legenda } : f
              ),
            }
          : a
      )
    )
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="events-section">
        <div className="section-header">
          <h2>Galeria de Fotos</h2>
        </div>
        <div className="empty-state">
          <Loader2 size={40} className="ga-spin" />
          <p>Carregando galeria...</p>
        </div>
      </div>
    )
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
              onDelete={setConfirmDelete}
              onAddFoto={setAddFotoAlbum}
              isModerador={isModerador}
              isOwner={album.created_by === userId}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AlbumModal
          album={editingAlbum}
          eventos={eventos}
          comunidades={comunidades}
          onClose={closeModal}
          onSave={handleSave}
          onFotoDeleted={handleFotoDeleted}
          onFotoLegendaUpdate={handleFotoLegendaUpdate}
          saving={saving}
        />
      )}

      {confirmDelete && (
        <ConfirmDeleteModal
          album={confirmDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDelete(null)}
          deleting={deleting}
        />
      )}

      {addFotoAlbum && (
        <AddFotoModal
          album={addFotoAlbum}
          onClose={() => setAddFotoAlbum(null)}
          onAdded={(foto) => {
            handleFotoAdded(addFotoAlbum.id, foto)
            setAddFotoAlbum(null)
          }}
        />
      )}
    </div>
  )
}

export default GalleryAdmin
