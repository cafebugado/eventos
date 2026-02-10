import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X, Tag, Trash2, Edit2, Save, AlertCircle, CheckCircle, Palette } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { getSession, signOut, getCurrentUser } from '../services/authService'
import {
  getTags,
  createTag,
  updateTag,
  deleteTag as deleteTagService,
} from '../services/tagService'
import { parseDateValue, getDayName } from './utils/dateUtils'
import useMediaQuery from '../hooks/useMediaQuery'
import usePagination from '../hooks/usePagination'
import { filterEventsByQuery } from '../utils/eventSearch'
import './Admin.css'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminTopbar from '../components/admin/AdminTopbar'
import EventStats from '../components/admin/EventStats'
import ContributorsSection from '../components/admin/ContributorsSection'
import AdminEventModal from '../components/admin/AdminEventModal'
import ContributorModal from '../components/admin/ContributorModal'
import EventsSection from '../components/admin/EventsSection'
import useEvents from '../hooks/useEvents'
import useContributors from '../hooks/useContributors'
import { isValidLinkedInUrl, isValidPortfolioUrl } from '../services/contributorService'
import useEventForm from '../hooks/useEventForm'
import useEventTags from '../hooks/useEventTags'
import useEventModal from '../hooks/useEventModal'
import TagsSection from '../components/admin/TagsSection'

const PAGE_SIZES = {
  desktop: 20,
  mobile: 10,
}

function Dashboard() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [notification, setNotification] = useState(null)
  const [activeTab, setActiveTab] = useState('eventos')
  const [userEmail, setUserEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showContributorModal, setShowContributorModal] = useState(false)
  const [editingContributor, setEditingContributor] = useState(null)
  const [isSubmittingContributor, setIsSubmittingContributor] = useState(false)
  const [tags, setTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(true)
  const [showTagModal, setShowTagModal] = useState(false)
  const [editingTag, setEditingTag] = useState(null)
  const [isSubmittingTag, setIsSubmittingTag] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()
  const isMobile = useMediaQuery('(max-width: 768px)')
  const { buildEventData } = useEventForm()
  const { selectedTags, setSelectedTags, loadTagsByEvent, resetTags } = useEventTags()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm()
  const {
    isOpen: showModal,
    editingEvent,
    openCreateModal,
    openEditModal,
    closeModal,
  } = useEventModal({
    resetForm: reset,
    setValue,
    resetTags,
    loadTagsByEvent,
    setImageFile,
    setImagePreview,
  })

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
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  const { eventos, stats, loading, isUploading, loadEvents, saveEvent, deleteEventById } =
    useEvents(showNotification)

  const {
    contributors,
    loading: loadingContributors,
    gitHubPreview,
    isFetchingGitHub,
    loadContributors,
    fetchGitHub,
    setGitHubPreview,
    saveContributor,
    deleteContributorById,
  } = useContributors(showNotification)

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
      const eventData = buildEventData(data)
      await saveEvent({
        id: editingEvent?.id,
        data: eventData,
        imageFile,
        selectedTags,
      })
      showNotification(
        editingEvent ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!'
      )
      closeModal()
    } catch (error) {
      if (error.message.includes('UPLOAD_ERROR')) {
        console.error(error)
        showNotification('Erro ao fazer upload da imagem', 'error')
      } else {
        console.error('Erro ao salvar evento:', error)
        showNotification('Erro ao salvar evento', 'error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        await deleteEventById(id)
        showNotification('Evento excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir evento:', error)
        showNotification('Erro ao excluir evento', 'error')
      }
    }
  }

  // === Contributor Functions ===
  useEffect(() => {
    if (activeTab === 'contribuintes') {
      loadContributors()
    }
  }, [activeTab, loadContributors])

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
      if (editingContributor !== null) {
        await saveContributor(editingContributor.id, contributorData)
      } else {
        await saveContributor(null, contributorData)
      }
      showNotification('Contribuinte salvo com sucesso!')
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
        await deleteContributorById(id)
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
              <EventsSection
                currentPage={currentPage}
                filteredEvents={filteredEvents}
                goToPage={goToPage}
                handleDeleteEvent={handleDeleteEvent}
                isLoading={loading}
                isShowingSearch={showSearch}
                openCreateModal={openCreateModal}
                openEditModal={openEditModal}
                pagedItems={pagedItems}
                searchTerm={searchTerm}
                totalPages={totalPages}
                eventos={eventos}
                setSearchTerm={setSearchTerm}
              />
            </>
          )}

          {/* Tags Section */}
          {activeTab === 'tags' && (
            <TagsSection
              loadingTags={loadingTags}
              openCreateTagModal={openCreateTagModal}
              openEditTagModal={openEditTagModal}
              handleDeleteTag={handleDeleteTag}
              tags={tags}
            />
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
          fetchGitHub={fetchGitHub}
          isEditingContributor={editingContributor}
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
