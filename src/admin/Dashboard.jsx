import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
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
  CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import './Admin.css';
import BgEventos from '../../public/eventos.png';

function Dashboard() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [notification, setNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('eventos');
  const navigate = useNavigate();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const GOOGLE_SHEET_URL = import.meta.env.VITE_GOOGLE_SHEET_URL;

  useEffect(() => {
    // Verifica autenticação
    const isAuth = localStorage.getItem('adminAuth');
    if (!isAuth) {
      navigate('/admin');
      return;
    }

    // Carrega tema
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Carrega eventos do Google Sheets
    Papa.parse(GOOGLE_SHEET_URL, {
      download: true,
      header: true,
      complete: (results) => {
        setEventos(results.data.filter(item => item['Nome do evento']));
        setLoading(false);
      },
      error: () => {
        setLoading(false);
      }
    });
  }, [navigate]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);

    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    localStorage.removeItem('adminEmail');
    navigate('/admin');
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const openCreateModal = () => {
    setEditingEvent(null);
    reset({
      nome: '',
      data: '',
      horario: '',
      diaSemana: '',
      periodo: '',
      link: '',
      imagem: ''
    });
    setShowModal(true);
  };

  const openEditModal = (evento, index) => {
    setEditingEvent({ ...evento, index });
    setValue('nome', evento['Nome do evento']);
    setValue('data', evento['Data do evento']);
    setValue('horario', evento['Horario do evento']);
    setValue('diaSemana', evento['Dia da Semana']);
    setValue('periodo', evento['Periodo']);
    setValue('link', evento['Link do evento']);
    setValue('imagem', evento['Imagem do evento']);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    reset();
  };

  const onSubmit = (data) => {
    const novoEvento = {
      'Nome do evento': data.nome,
      'Data do evento': data.data,
      'Horario do evento': data.horario,
      'Dia da Semana': data.diaSemana,
      'Periodo': data.periodo,
      'Link do evento': data.link,
      'Imagem do evento': data.imagem
    };

    if (editingEvent) {
      // Atualiza evento existente
      const updatedEventos = [...eventos];
      updatedEventos[editingEvent.index] = novoEvento;
      setEventos(updatedEventos);
      showNotification('Evento atualizado com sucesso!');
    } else {
      // Cria novo evento
      setEventos([...eventos, novoEvento]);
      showNotification('Evento criado com sucesso!');
    }

    closeModal();
  };

  const deleteEvent = (index) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      const updatedEventos = eventos.filter((_, i) => i !== index);
      setEventos(updatedEventos);
      showNotification('Evento excluído com sucesso!');
    }
  };

  const adminEmail = localStorage.getItem('adminEmail');

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>EventFlow</h2>
          <span>Admin</span>
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
              setActiveTab('criar');
              openCreateModal();
            }}
          >
            <Plus size={20} />
            <span>Criar Evento</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {adminEmail?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">Admin</span>
              <span className="user-email">{adminEmail}</span>
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
                <span className="stat-value">{eventos.length}</span>
                <span className="stat-label">Total de Eventos</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {eventos.filter(e => e['Periodo'] === 'Noturno').length}
                </span>
                <span className="stat-label">Eventos Noturnos</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange">
                <Sun size={24} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {eventos.filter(e => e['Periodo'] === 'Matinal' || e['Periodo'] === 'Diurno').length}
                </span>
                <span className="stat-label">Eventos Diurnos</span>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="events-section">
            <div className="section-header">
              <h2>Eventos Cadastrados</h2>
              <button className="btn-primary" onClick={openCreateModal}>
                <Plus size={18} />
                Novo Evento
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
                    {eventos.map((evento, index) => (
                      <tr key={index}>
                        <td>
                          <img
                            src={evento['Imagem do evento'] || BgEventos}
                            alt={evento['Nome do evento']}
                            className="event-thumbnail"
                          />
                        </td>
                        <td>
                          <span className="event-name">{evento['Nome do evento']}</span>
                        </td>
                        <td>{evento['Data do evento']}</td>
                        <td>{evento['Horario do evento']}</td>
                        <td>
                          <span className={`badge badge-${evento['Periodo']?.toLowerCase()}`}>
                            {evento['Periodo']}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon btn-view"
                              onClick={() => window.open(evento['Link do evento'], '_blank')}
                              title="Ver evento"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              className="btn-icon btn-edit"
                              onClick={() => openEditModal(evento, index)}
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => deleteEvent(index)}
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
          <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                    {...register("nome", { required: "Nome é obrigatório" })}
                  />
                  {errors.nome && <span className="field-error">{errors.nome.message}</span>}
                </div>
              </div>

              <div className="form-row two-cols">
                <div className="form-field">
                  <label>
                    <CalendarDays size={16} />
                    Data do Evento
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 15/02/2025"
                    {...register("data", { required: "Data é obrigatória" })}
                  />
                  {errors.data && <span className="field-error">{errors.data.message}</span>}
                </div>
                <div className="form-field">
                  <label>
                    <Clock size={16} />
                    Horário
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 19:00"
                    {...register("horario", { required: "Horário é obrigatório" })}
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
                  <select {...register("diaSemana", { required: "Dia da semana é obrigatório" })}>
                    <option value="">Selecione...</option>
                    <option value="Segunda-feira">Segunda-feira</option>
                    <option value="Terça-feira">Terça-feira</option>
                    <option value="Quarta-feira">Quarta-feira</option>
                    <option value="Quinta-feira">Quinta-feira</option>
                    <option value="Sexta-feira">Sexta-feira</option>
                    <option value="Sábado">Sábado</option>
                    <option value="Domingo">Domingo</option>
                  </select>
                  {errors.diaSemana && <span className="field-error">{errors.diaSemana.message}</span>}
                </div>
                <div className="form-field">
                  <label>
                    <Tag size={16} />
                    Período
                  </label>
                  <select {...register("periodo", { required: "Período é obrigatório" })}>
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
                    {...register("link", { required: "Link é obrigatório" })}
                  />
                  {errors.link && <span className="field-error">{errors.link.message}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>
                    <Image size={16} />
                    URL da Imagem (opcional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    {...register("imagem")}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <Save size={18} />
                  {editingEvent ? 'Salvar Alterações' : 'Criar Evento'}
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
  );
}

export default Dashboard;
