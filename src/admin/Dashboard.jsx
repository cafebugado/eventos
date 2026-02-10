import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Plus,
  Calendar,
  Clock,
  Search,
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
  Users,
  Github,
  Linkedin,
  ExternalLink,
  Loader2,
  MapPin,
  Monitor,
  Video,
  Palette,
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
import {
  getContributors,
  createContributor,
  updateContributor,
  deleteContributor as deleteContributorService,
  fetchGitHubUser,
  isValidLinkedInUrl,
  isValidPortfolioUrl,
  isValidGitHubUsername,
} from '../services/contributorService'
import {
  getTags,
  createTag,
  updateTag,
  deleteTag as deleteTagService,
  getEventTags,
  setEventTags,
} from '../services/tagService'
import {
  parseDateValue,
  formatDateToInput,
  formatDateToDisplay,
  getDayName,
} from './utils/dateUtils'
import Pagination from '../components/Pagination'
import RichText from '../components/RichText'
import useMediaQuery from '../hooks/useMediaQuery'
import usePagination from '../hooks/usePagination'
import { filterEventsByQuery } from '../utils/eventSearch'
import { stripRichText } from '../utils/richText'
import './Admin.css'
import BgEventos from '../assets/eventos.png'
import AdminSidebar from '../components/admin/AdminSidebar'

const PAGE_SIZES = {
  desktop: 20,
  mobile: 10,
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
  const [searchTerm, setSearchTerm] = useState('')
  const [contributors, setContributors] = useState([])
  const [loadingContributors, setLoadingContributors] = useState(true)
  const [showContributorModal, setShowContributorModal] = useState(false)
  const [editingContributor, setEditingContributor] = useState(null)
  const [isSubmittingContributor, setIsSubmittingContributor] = useState(false)
  const [isFetchingGitHub, setIsFetchingGitHub] = useState(false)
  const [gitHubPreview, setGitHubPreview] = useState(null)
  const [tags, setTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(true)
  const [showTagModal, setShowTagModal] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [isSubmittingTag, setIsSubmittingTag] = useState(false)
  const [selectedTags, setSelectedTags] = useState([])
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()
  const descricaoValue = watch('descricao') || ''

  const {
    register: registerContributor,
    handleSubmit: handleSubmitContributor,
    reset: resetContributor,
    setValue: setContributorValue,
    formState: { errors: contributorErrors },
  } = useForm()

  const {
    register: registerTag,
    handleSubmit: handleSubmitTag,
    reset: resetTag,
    setValue: setTagValue,
    watch: watchTag,
    formState: { errors: tagErrors },
  } = useForm()

  const sortedEvents = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return [...eventos].sort((a, b) => {
      const dateA = parseDateValue(a.data_evento)
      const dateB = parseDateValue(b.data_evento)
      const isAFuture = dateA && dateA >= today
      const isBFuture = dateB && dateB >= today

      if (isAFuture && !isBFuture) {
        return -1
      }
      if (!isAFuture && isBFuture) {
        return 1
      }
      if (isAFuture) {
        return dateA - dateB
      }
      return dateB - dateA
    })
  }, [eventos])

  const filteredEvents = useMemo(
    () => filterEventsByQuery(sortedEvents, searchTerm),
    [sortedEvents, searchTerm]
  )
  const pageSize = isMobile ? PAGE_SIZES.mobile : PAGE_SIZES.desktop
  const { currentPage, totalPages, pagedItems, goToPage } = usePagination(filteredEvents, pageSize)
  const showSearch = !loading && eventos.length > 0

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
    setSelectedTags([])
    reset({
      nome: '',
      descricao: '',
      data_evento: '',
      horario: '',
      dia_semana: '',
      periodo: '',
      link: '',
      imagem: '',
      modalidade: '',
      endereco: '',
      cidade: '',
      estado: '',
    })
    setShowModal(true)
  }

  const openEditModal = async (evento) => {
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
    setValue('modalidade', evento.modalidade || '')
    setValue('endereco', evento.endereco || '')
    setValue('cidade', evento.cidade || '')
    setValue('estado', evento.estado || '')
    // Carregar tags do evento
    try {
      const eventTags = await getEventTags(evento.id)
      setSelectedTags(eventTags.map((t) => t.id))
    } catch {
      setSelectedTags([])
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingEvent(null)
    setImageFile(null)
    setImagePreview(null)
    setSelectedTags([])
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
        modalidade: data.modalidade || null,
        endereco: data.modalidade === 'Online' ? null : data.endereco || null,
        cidade: data.modalidade === 'Online' ? null : data.cidade || null,
        estado: data.modalidade === 'Online' ? null : data.estado || null,
      }

      let savedEvent
      if (editingEvent) {
        savedEvent = await updateEvent(editingEvent.id, eventData)
        await setEventTags(editingEvent.id, selectedTags)
        showNotification('Evento atualizado com sucesso!')
      } else {
        savedEvent = await createEvent(eventData)
        if (selectedTags.length > 0) {
          await setEventTags(savedEvent.id, selectedTags)
        }
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

  // === Contributor Functions ===
  const loadContributors = useCallback(async () => {
    try {
      setLoadingContributors(true)
      const data = await getContributors()
      setContributors(data)
    } catch (error) {
      console.error('Erro ao carregar contribuintes:', error)
      showNotification('Erro ao carregar contribuintes', 'error')
    } finally {
      setLoadingContributors(false)
    }
  }, [showNotification])

  useEffect(() => {
    if (activeTab === 'contribuintes') {
      loadContributors()
    }
  }, [activeTab, loadContributors])

  const handleFetchGitHub = async (username) => {
    if (!username || !isValidGitHubUsername(username)) {
      setGitHubPreview(null)
      return
    }

    setIsFetchingGitHub(true)
    try {
      const userData = await fetchGitHubUser(username)
      setGitHubPreview(userData)
      setContributorValue('nome', userData.nome)
    } catch (error) {
      showNotification(error.message || 'Erro ao buscar usuário do GitHub', 'error')
      setGitHubPreview(null)
    } finally {
      setIsFetchingGitHub(false)
    }
  }

  const openCreateContributorModal = () => {
    setEditingContributor(null)
    setGitHubPreview(null)
    resetContributor({
      github_username: '',
      nome: '',
      linkedin_url: '',
      portfolio_url: '',
    })
    setShowContributorModal(true)
  }

  const openEditContributorModal = (contributor) => {
    setEditingContributor(contributor)
    setGitHubPreview({
      github_username: contributor.github_username,
      nome: contributor.nome,
      avatar_url: contributor.avatar_url,
      github_url: contributor.github_url,
    })
    setContributorValue('github_username', contributor.github_username)
    setContributorValue('nome', contributor.nome)
    setContributorValue('linkedin_url', contributor.linkedin_url || '')
    setContributorValue('portfolio_url', contributor.portfolio_url || '')
    setShowContributorModal(true)
  }

  const closeContributorModal = () => {
    setShowContributorModal(false)
    setEditingContributor(null)
    setGitHubPreview(null)
    resetContributor()
  }

  const onSubmitContributor = async (data) => {
    if (!gitHubPreview) {
      showNotification('Busque um usuário do GitHub antes de salvar', 'error')
      return
    }

    if (data.linkedin_url && !isValidLinkedInUrl(data.linkedin_url)) {
      showNotification(
        'URL do LinkedIn inválida. Use o formato: https://linkedin.com/in/usuario',
        'error'
      )
      return
    }

    if (data.portfolio_url && !isValidPortfolioUrl(data.portfolio_url)) {
      showNotification('URL do portfólio inválida. Use uma URL válida com https://', 'error')
      return
    }

    setIsSubmittingContributor(true)
    try {
      const contributorData = {
        github_username: gitHubPreview.github_username,
        nome: data.nome || gitHubPreview.nome,
        avatar_url: gitHubPreview.avatar_url,
        github_url: gitHubPreview.github_url,
        linkedin_url: data.linkedin_url || null,
        portfolio_url: data.portfolio_url || null,
      }

      if (editingContributor) {
        await updateContributor(editingContributor.id, contributorData)
        showNotification('Contribuinte atualizado com sucesso!')
      } else {
        await createContributor(contributorData)
        showNotification('Contribuinte adicionado com sucesso!')
      }

      closeContributorModal()
      await loadContributors()
    } catch (error) {
      console.error('Erro ao salvar contribuinte:', error)
      showNotification(error.message || 'Erro ao salvar contribuinte', 'error')
    } finally {
      setIsSubmittingContributor(false)
    }
  }

  const handleDeleteContributor = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este contribuinte?')) {
      try {
        await deleteContributorService(id)
        showNotification('Contribuinte excluído com sucesso!')
        await loadContributors()
      } catch (error) {
        console.error('Erro ao excluir contribuinte:', error)
        showNotification('Erro ao excluir contribuinte', 'error')
      }
    }
  }

  // === Tag Functions ===
  const loadTags = useCallback(async () => {
    try {
      setLoadingTags(true)
      const data = await getTags()
      setTags(data)
    } catch (error) {
      console.error('Erro ao carregar tags:', error)
      showNotification('Erro ao carregar tags', 'error')
    } finally {
      setLoadingTags(false)
    }
  }, [showNotification])

  useEffect(() => {
    if (activeTab === 'tags') {
      loadTags()
    }
  }, [activeTab, loadTags])

  // Carrega tags quando abre o modal de evento (para o select de tags)
  useEffect(() => {
    if (showModal) {
      loadTags()
    }
  }, [showModal, loadTags])

  const openCreateTagModal = () => {
    setEditingTag(null)
    resetTag({ nome: '', cor: '#2563eb' })
    setShowTagModal(true)
  }

  const openEditTagModal = (tag) => {
    setEditingTag(tag)
    setTagValue('nome', tag.nome)
    setTagValue('cor', tag.cor || '#2563eb')
    setShowTagModal(true)
  }

  const closeTagModal = () => {
    setShowTagModal(false)
    setEditingTag(null)
    resetTag()
  }

  const onSubmitTag = async (data) => {
    setIsSubmittingTag(true)
    try {
      if (editingTag) {
        await updateTag(editingTag.id, data)
        showNotification('Tag atualizada com sucesso!')
      } else {
        await createTag(data)
        showNotification('Tag criada com sucesso!')
      }
      closeTagModal()
      await loadTags()
    } catch (error) {
      console.error('Erro ao salvar tag:', error)
      showNotification(error.message || 'Erro ao salvar tag', 'error')
    } finally {
      setIsSubmittingTag(false)
    }
  }

  const handleDeleteTag = async (id) => {
    if (
      window.confirm(
        'Tem certeza que deseja excluir esta tag? Ela será removida de todos os eventos.'
      )
    ) {
      try {
        await deleteTagService(id)
        showNotification('Tag excluída com sucesso!')
        await loadTags()
      } catch (error) {
        console.error('Erro ao excluir tag:', error)
        showNotification('Erro ao excluir tag', 'error')
      }
    }
  }

  const toggleTagSelection = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const watchModalidade = watch('modalidade')

  const ESTADOS_BR = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ]

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}


      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCreateModal={openCreateModal}
        handleLogout={handleLogout}
        userEmail={userEmail}
      />
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
          {activeTab !== 'contribuintes' && activeTab !== 'tags' && (
            <>
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
                  <button
                    className="btn-primary"
                    onClick={openCreateModal}
                    aria-label="Novo Evento"
                  >
                    <Plus size={18} />
                    <span className="btn-text">Novo Evento</span>
                  </button>
                </div>

                {showSearch && (
                  <div className="events-toolbar">
                    <div className="events-search">
                      <Search size={18} className="events-search-icon" />
                      <input
                        type="text"
                        placeholder="Buscar por nome, descricao ou data..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        aria-label="Buscar eventos"
                      />
                      {searchTerm && (
                        <button
                          type="button"
                          className="events-search-clear"
                          onClick={() => setSearchTerm('')}
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  </div>
                )}

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
                ) : filteredEvents.length === 0 ? (
                  <div className="empty-state">
                    <Search size={48} />
                    <h3>Nenhum evento encontrado</h3>
                    <p>Tente ajustar sua busca para encontrar o evento desejado.</p>
                  </div>
                ) : (
                  <>
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
                          {pagedItems.map((evento) => {
                            const eventDate = parseDateValue(evento.data_evento)
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            const isPast = eventDate && eventDate < today

                            return (
                              <tr key={evento.id} className={isPast ? 'event-row-past' : ''}>
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
                                    <span className="event-desc-preview">
                                      {stripRichText(evento.descricao)}
                                    </span>
                                  )}
                                  {isPast && (
                                    <span className="badge badge-encerrado">Encerrado</span>
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
                                    {!isPast && (
                                      <>
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
                                      </>
                                    )}
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
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={goToPage}
                    />
                  </>
                )}
              </div>
            </>
          )}

          {/* Tags Section */}
          {activeTab === 'tags' && (
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
                      <div
                        className="tag-admin-color"
                        style={{ backgroundColor: tag.cor || '#2563eb' }}
                      />
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
          )}

          {/* Contributors Section */}
          {activeTab === 'contribuintes' && (
            <div className="events-section">
              <div className="section-header">
                <h2>Contribuintes do Projeto</h2>
                <button
                  className="btn-primary"
                  onClick={openCreateContributorModal}
                  aria-label="Novo Contribuinte"
                >
                  <Plus size={18} />
                  <span className="btn-text">Novo Contribuinte</span>
                </button>
              </div>

              {loadingContributors ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Carregando contribuintes...</p>
                </div>
              ) : contributors.length === 0 ? (
                <div className="empty-state">
                  <Users size={48} />
                  <h3>Nenhum contribuinte cadastrado</h3>
                  <p>
                    Clique em &quot;Novo Contribuinte&quot; para adicionar o primeiro contribuinte.
                  </p>
                </div>
              ) : (
                <div className="contributors-admin-grid">
                  {contributors.map((contributor) => (
                    <div key={contributor.id} className="contributor-admin-card">
                      <img
                        src={contributor.avatar_url}
                        alt={contributor.nome}
                        className="contributor-admin-avatar"
                      />
                      <div className="contributor-admin-info">
                        <span className="contributor-admin-name">{contributor.nome}</span>
                        <span className="contributor-admin-username">
                          @{contributor.github_username}
                        </span>
                        <div className="contributor-admin-links">
                          <a
                            href={contributor.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="GitHub"
                          >
                            <Github size={14} />
                          </a>
                          {contributor.linkedin_url && (
                            <a
                              href={contributor.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="LinkedIn"
                            >
                              <Linkedin size={14} />
                            </a>
                          )}
                          {contributor.portfolio_url && (
                            <a
                              href={contributor.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Portfólio"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => openEditContributorModal(contributor)}
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteContributor(contributor.id)}
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
          )}
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

      {/* Contributor Modal */}
      {showContributorModal && (
        <div className="modal-overlay" onClick={closeContributorModal}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingContributor ? 'Editar Contribuinte' : 'Adicionar Contribuinte'}</h2>
              <button className="modal-close" onClick={closeContributorModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitContributor(onSubmitContributor)} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label>
                    <Github size={16} />
                    Username do GitHub
                  </label>
                  <div className="github-search-row">
                    <input
                      type="text"
                      placeholder="Ex: octocat"
                      {...registerContributor('github_username', {
                        required: 'Username do GitHub é obrigatório',
                        validate: (value) =>
                          isValidGitHubUsername(value) || 'Username do GitHub inválido',
                      })}
                    />
                    <button
                      type="button"
                      className="btn-primary btn-fetch-github"
                      onClick={() => {
                        const input = document.querySelector('input[name="github_username"]')
                        if (input) {
                          handleFetchGitHub(input.value)
                        }
                      }}
                      disabled={isFetchingGitHub}
                    >
                      {isFetchingGitHub ? (
                        <Loader2 size={16} className="spinning" />
                      ) : (
                        <Search size={16} />
                      )}
                      Buscar
                    </button>
                  </div>
                  {contributorErrors.github_username && (
                    <span className="field-error">{contributorErrors.github_username.message}</span>
                  )}
                </div>
              </div>

              {gitHubPreview && (
                <div className="github-preview">
                  <img
                    src={gitHubPreview.avatar_url}
                    alt={gitHubPreview.nome}
                    className="github-preview-avatar"
                  />
                  <div className="github-preview-info">
                    <span className="github-preview-name">{gitHubPreview.nome}</span>
                    <span className="github-preview-username">
                      @{gitHubPreview.github_username}
                    </span>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-field">
                  <label>
                    <Users size={16} />
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do contribuinte (preenchido pelo GitHub)"
                    {...registerContributor('nome', { required: 'Nome é obrigatório' })}
                  />
                  {contributorErrors.nome && (
                    <span className="field-error">{contributorErrors.nome.message}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>
                    <Linkedin size={16} />
                    LinkedIn (opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/usuario"
                    {...registerContributor('linkedin_url', {
                      validate: (value) =>
                        !value ||
                        isValidLinkedInUrl(value) ||
                        'URL do LinkedIn inválida. Use: https://linkedin.com/in/usuario',
                    })}
                  />
                  {contributorErrors.linkedin_url && (
                    <span className="field-error">{contributorErrors.linkedin_url.message}</span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>
                    <ExternalLink size={16} />
                    Portfólio (opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://meusite.com"
                    {...registerContributor('portfolio_url', {
                      validate: (value) =>
                        !value ||
                        isValidPortfolioUrl(value) ||
                        'URL do portfólio inválida. Use uma URL válida com https://',
                    })}
                  />
                  {contributorErrors.portfolio_url && (
                    <span className="field-error">{contributorErrors.portfolio_url.message}</span>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeContributorModal}>
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmittingContributor || !gitHubPreview}
                >
                  {isSubmittingContributor ? (
                    <>
                      <span className="button-spinner"></span>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {editingContributor ? 'Salvar Alterações' : 'Adicionar Contribuinte'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
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
              <div className="form-row">
                <div className="form-field">
                  <span className="preview-label">Preview</span>
                  <div className="tag-preview-container">
                    <span
                      className="tag-preview-badge"
                      style={{
                        '--tag-color': watchTag('cor') || '#2563eb',
                      }}
                    >
                      {watchTag('nome') || 'Nome da Tag'}
                    </span>
                  </div>
                </div>
              </div>

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
