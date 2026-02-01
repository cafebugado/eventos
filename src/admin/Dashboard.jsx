import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Plus,
  Calendar,
  Clock,
  Link as LinkIcon,
  Image,
  LogOut,
  X,
  Sun,
  Moon,
  CalendarDays,
  Tag,
  Trash2,
  Eye,
  Edit2,
  Save,
  AlertCircle,
  CheckCircle,
  Upload,
  FileText,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import { getSession, signOut, getCurrentUser } from '../services/authService'
import {
  getEvents,
  createEvent,
  updateEvent,
  deleteEvent as deleteEventService,
  getEventStats,
  uploadEventImage,
} from '../services/eventService'
import './Admin.css'
import BgEventos from '../../public/eventos.png'

const DAY_NAMES = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

const DATE_INPUT_REGEX = /^\d{4}-\d{2}-\d{2}$/
const DATE_BR_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/

const parseDateValue = (value) => {
  if (!value) {
    return null
  }

  if (DATE_INPUT_REGEX.test(value)) {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
  }

  const brMatch = value.match(DATE_BR_REGEX)
  if (brMatch) {
    const [, day, month, year] = brMatch
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDateToInput = (value) => {
  const date = parseDateValue(value)
  if (!date) {
    return ''
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDateToDisplay = (value) => {
  const date = parseDateValue(value)
  if (!date) {
    return ''
  }
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const getDayName = (value) => {
  const date = parseDateValue(value)
  if (!date) {
    return ''
  }
  return DAY_NAMES[date.getDay()]
}

function Dashboard() {
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [notification, setNotification] = useState(null)
  const [activeTab, setActiveTab] = useState('eventos')
  const [stats, setStats] = useState({ total: 0, noturno: 0, diurno: 0 })
  const [userEmail, setUserEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true)
      const [eventsData, statsData] = await Promise.all([getEvents(), getEventStats()])
      setEventos(eventsData)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar eventos:', error)
      showNotification('Erro ao carregar eventos', 'error')
    } finally {
      setLoading(false)
    }
  }, [showNotification])

  useEffect(() => {
    async function init() {
      const session = await getSession()
      if (!session) {
        navigate('/admin')
        return
      }

      const user = await getCurrentUser()
      if (user) {
        setUserEmail(user.email)
      }

      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark') {
        setIsDarkMode(true)
        document.documentElement.setAttribute('data-theme', 'dark')
      }

      await loadEvents()
    }

    init()
  }, [navigate, loadEvents])

  const toggleTheme = () => {
    const newTheme = !isDarkMode
    setIsDarkMode(newTheme)

    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/admin')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      showNotification('Erro ao fazer logout', 'error')
    }
  }

  const openCreateModal = () => {
    setEditingEvent(null)
    setImageFile(null)
    setImagePreview(null)
    reset({
      nome: '',
      descricao: '',
      data_evento: '',
      horario: '',
      dia_semana: '',
      periodo: '',
      link: '',
      imagem: '',
    })
    setShowModal(true)
  }

  const openEditModal = (evento) => {
    const normalizedDate = formatDateToInput(evento.data_evento)
    const dayName = getDayName(normalizedDate || evento.data_evento) || evento.dia_semana || ''
    setEditingEvent(evento)
    setImageFile(null)
    setImagePreview(evento.imagem || null)
    setValue('nome', evento.nome)
    setValue('descricao', evento.descricao || '')
    setValue('data_evento', normalizedDate)
    setValue('horario', evento.horario)
    setValue('dia_semana', dayName)
    setValue('periodo', evento.periodo)
    setValue('link', evento.link)
    setValue('imagem', evento.imagem || '')
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvent(null)
    setImageFile(null)
    setImagePreview(null)
    reset()
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification('Imagem deve ter no máximo 5MB', 'error')
        return
      }
      if (!file.type.startsWith('image/')) {
        showNotification('Arquivo deve ser uma imagem', 'error')
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setValue('imagem', '')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const syncDayOfWeek = (value) => {
    const dayName = getDayName(value)
    setValue('dia_semana', dayName, { shouldValidate: true })
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      let imageUrl = data.imagem || null

      // Se tem arquivo de imagem, faz upload
      if (imageFile) {
        setIsUploading(true)
        try {
          imageUrl = await uploadEventImage(imageFile)
        } catch (uploadError) {
          console.error('Erro no upload:', uploadError)
          showNotification('Erro ao fazer upload da imagem', 'error')
          setIsSubmitting(false)
          setIsUploading(false)
          return
        }
        setIsUploading(false)
      }

      const displayDate = formatDateToDisplay(data.data_evento) || data.data_evento
      const resolvedDayName = getDayName(data.data_evento) || data.dia_semana

      const eventData = {
        nome: data.nome,
        descricao: data.descricao || null,
        data_evento: displayDate,
        horario: data.horario,
        dia_semana: resolvedDayName,
        periodo: data.periodo,
        link: data.link,
        imagem: imageUrl,
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, eventData)
        showNotification('Evento atualizado com sucesso!')
      } else {
        await createEvent(eventData)
        showNotification('Evento criado com sucesso!')
      }

      closeModal()
      await loadEvents()
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      showNotification('Erro ao salvar evento', 'error')
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await deleteEventService(id)
        showNotification('Evento excluído com sucesso!')
        await loadEvents()
      } catch (error) {
        console.error('Erro ao excluir evento:', error)
        showNotification('Erro ao excluir evento', 'error')
      }
    }
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Eventos</h2>
          <span>Café Bugado Admin</span>
        </div>

        <nav className="sidebar-menu">
          <button
            className={`menu-item ${activeTab === 'eventos' ? 'active' : ''}`}
            onClick={() => setActiveTab('eventos')}
          >
            <Calendar size={20} />
            <span>Eventos</span>
          </button>
          <button
            className={`menu-item ${activeTab === 'criar' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('criar')
              openCreateModal()
            }}
          >
            <Plus size={20} />
            <span>Criar Evento</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{userEmail?.charAt(0).toUpperCase() || 'A'}</div>
            <div className="user-details">
              <span className="user-name">Admin</span>
              <span className="user-email">{userEmail}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <LayoutDashboard size={24} />
            <h1>Dashboard</h1>
          </div>
          <div className="topbar-right">
            <button className="theme-btn" onClick={toggleTheme}>
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="admin-content">
          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <Calendar size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.total}</span>
                <span className="stat-label">Total de Eventos</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.noturno}</span>
                <span className="stat-label">Eventos Noturnos</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">
                <Sun size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">{stats.diurno}</span>
                <span className="stat-label">Eventos Diurnos</span>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="events-section">
            <div className="section-header">
              <h2>Eventos Cadastrados</h2>
              <button className="btn-primary" onClick={openCreateModal} aria-label="Novo Evento">
                <Plus size={18} />
                <span className="btn-text">Novo Evento</span>
              </button>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Carregando eventos...</p>
              </div>
            ) : eventos.length === 0 ? (
              <div className="empty-state">
                <Calendar size={48} />
                <h3>Nenhum evento cadastrado</h3>
                <p>Clique em "Novo Evento" para criar seu primeiro evento.</p>
              </div>
            ) : (
              <div className="events-table-container">
                <table className="events-table">
                  <thead>
                    <tr>
                      <th>Imagem</th>
                      <th>Nome do Evento</th>
                      <th>Data</th>
                      <th>Horário</th>
                      <th>Período</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.map((evento) => (
                      <tr key={evento.id}>
                        <td data-label="Imagem">
                          <img
                            src={evento.imagem || BgEventos}
                            alt={evento.nome}
                            className="event-thumbnail"
                          />
                        </td>
                        <td data-label="Nome do Evento">
                          <span className="event-name">{evento.nome}</span>
                          {evento.descricao && (
                            <span className="event-desc-preview">{evento.descricao}</span>
                          )}
                        </td>
                        <td data-label="Data">{evento.data_evento}</td>
                        <td data-label="Horário">{evento.horario}</td>
                        <td data-label="Período">
                          <span className={`badge badge-${evento.periodo?.toLowerCase()}`}>
                            {evento.periodo}
                          </span>
                        </td>
                        <td data-label="Ações">
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-view"
                              onClick={() => window.open(evento.link, '_blank')}
                              title="Ver evento"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="btn-icon btn-edit"
                              onClick={() => openEditModal(evento)}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => handleDeleteEvent(evento.id)}
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Editar Evento' : 'Criar Novo Evento'}</h2>
              <button className="modal-close" onClick={closeModal}>
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
                  <textarea
                    placeholder="Descreva o evento..."
                    rows="3"
                    {...register('descricao')}
                  />
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
                      <div
                        className="image-upload-area"
                        onClick={() => fileInputRef.current?.click()}
                      >
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
                <button type="button" className="btn-secondary" onClick={closeModal}>
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
      )}

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  )
}

export default Dashboard
