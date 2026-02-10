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
import './Admin.css'
import BgEventos from '../assets/eventos.png'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminTopbar from '../components/admin/AdminTopbar'
import EventStats from '../components/admin/EventStats'
import EventsTable from '../components/admin/EventsTable'
import ContributorsSection from '../components/admin/ContributorsSection'
import AdminEventModal from '../components/admin/AdminEventModal'
import ContributorModal from '../components/admin/ContributorModal'

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
        <AdminTopbar isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
        {/* Content */}
        <div className="admin-content">
          {activeTab !== 'contribuintes' && activeTab !== 'tags' && (
            <>
              {/* Stats */}
              <EventStats stats={stats} />

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
                    <EventsTable
                      handleDeleteEvent={handleDeleteEvent}
                      openEditModal={openEditModal}
                      pagedItems={pagedItems}
                    />
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
            <ContributorsSection
              contributors={contributors}
              handleDeleteContributor={handleDeleteContributor}
              loadingContributors={loadingContributors}
              onOpenCreateContributorModal={openCreateContributorModal}
              onOpenEditContributorModal={openEditContributorModal}
            />
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <AdminEventModal
          descricaoValue={descricaoValue}
          editingEvent={editingEvent}
          errors={errors}
          handleSubmit={handleSubmit}
          handleImageSelect={handleImageSelect}
          onCloseModal={closeModal}
          onSubmit={onSubmit}
          register={register}
          syncDayOfWeek={syncDayOfWeek}
          imagePreview={imagePreview}
          fileInputRef={fileInputRef}
          isSubmitting={isSubmitting}
          imageFile={imageFile}
          isUploading={isUploading}
          removeImage={removeImage}
          setImagePreview={setImagePreview}
          watchModalidade={watchModalidade}
          tags={tags}
          selectedTags={selectedTags}
          toggleTagSelection={toggleTagSelection}
        />
      )}

      {/* Contributor Modal */}
      {showContributorModal && (
        <ContributorModal
          closeContributorModal={closeContributorModal}
          handleSubmitContributor={handleSubmitContributor}
          handleFetchGitHub={handleFetchGitHub}
          isEditingContributor={editingContributor}
          isValidGitHubUsername={isValidGitHubUsername}
          isValidLinkedInUrl={isValidLinkedInUrl}
          isValidPortfolioUrl={isValidPortfolioUrl}
          isFetchingGitHub={isFetchingGitHub}
          isSubmittingContributor={isSubmittingContributor}
          onSubmitContributor={onSubmitContributor}
          registerContributor={registerContributor}
          contributorErrors={contributorErrors}
          gitHubPreview={gitHubPreview}
        />
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
