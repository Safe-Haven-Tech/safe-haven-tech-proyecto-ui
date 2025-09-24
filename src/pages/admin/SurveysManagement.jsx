import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { fetchEncuestas, crearEncuesta } from '../../services/surveysServices';
import styles from './SurveysManagement.module.css';

const ESCALA_OPCIONES = ["Nunca", "Raramente", "A veces", "Frecuentemente", "Siempre"];
// SOLO usa los valores permitidos por el backend:
const validCategories = [
  { value: 'salud_mental', label: 'Salud mental' },
  { value: 'bienestar', label: 'Bienestar emocional' },
  { value: 'estres', label: 'Estrés' },
  { value: 'ansiedad', label: 'Ansiedad' },
  { value: 'depresion', label: 'Depresión' },
  { value: 'otro', label: 'Otro' }
];

const SurveysManagement = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Estados principales
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginacion, setPaginacion] = useState({});
  
  // Estados para filtros y búsqueda
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    activa: '',
    pagina: 1
  });

  // Estados para modales
  const [mostrarModal, setMostrarModal] = useState(false);
  const [encuestaEditando, setEncuestaEditando] = useState(null);
  const [modoModal, setModoModal] = useState('crear');

  // Estados para formulario
  const [formulario, setFormulario] = useState({
    titulo: '',
    descripcion: '',
    categoria: validCategories[0].value,
    activa: true,
    preguntas: []
  });

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porCategoria: {},
    activas: 0,
    inactivas: 0,
    resumen: {}
  });

  // Estado para loading de estadísticas
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);

  // Estados para validación
  const [erroresValidacion, setErroresValidacion] = useState({});

  // Solo para preguntas tipo escala
  const [nuevaPregunta, setNuevaPregunta] = useState({
    texto: '',
    orden: 1
  });

  // Estado para controlar si ya se cargaron los datos iniciales
  const [datosInicializados, setDatosInicializados] = useState(false);

  // Ref para evitar llamadas duplicadas
  const inicializandoRef = useRef(false);
  const estadisticasCargadasRef = useRef(false);

  // Verificar autenticación y permisos
  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    if (usuario.rol !== 'administrador' && usuario.rol !== 'profesional') {
      navigate('/');
      return;
    }
  }, [usuario, navigate]);

  // Función para cargar encuestas
  const cargarEncuestas = useCallback(async (mostrarLoading = true) => {
    try {
      if (mostrarLoading) setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      if (filtros.categoria) params.append('categoria', filtros.categoria);
      if (filtros.activa !== '') params.append('activa', filtros.activa);
      params.append('pagina', filtros.pagina);
      params.append('limite', 10);

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/encuestas?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Error al cargar encuestas');

      const data = await response.json();
      let encuestasArray = [];
      if (Array.isArray(data)) {
        encuestasArray = data;
      } else if (data.data && Array.isArray(data.data)) {
        encuestasArray = data.data;
      } else if (data.encuestas && Array.isArray(data.encuestas)) {
        encuestasArray = data.encuestas;
      } else {
        encuestasArray = [];
      }
      setEncuestas(encuestasArray);

      if (data.paginacion) {
        setPaginacion(data.paginacion);
      } else {
        setPaginacion({
          paginaActual: 1,
          totalPaginas: 1,
          total: encuestasArray.length
        });
      }
    } catch (error) {
      setError(error.message);
      setEncuestas([]);
    } finally {
      if (mostrarLoading) setLoading(false);
    }
  }, [filtros]);

  // Función para cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    if (estadisticasCargadasRef.current || loadingEstadisticas === false) return;
    estadisticasCargadasRef.current = true;
    setLoadingEstadisticas(true);
    try {
      await calcularEstadisticasManualmente();
    } catch (error) {
      setEstadisticas({
        total: 0,
        porCategoria: {},
        activas: 0,
        inactivas: 0,
        resumen: {}
      });
    } finally {
      setLoadingEstadisticas(false);
    }
  }, [loadingEstadisticas]);

  // Función para calcular estadísticas manualmente
  const calcularEstadisticasManualmente = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/encuestas?limite=1000', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        let todasLasEncuestas = [];
        if (Array.isArray(data)) {
          todasLasEncuestas = data;
        } else if (data.data && Array.isArray(data.data)) {
          todasLasEncuestas = data.data;
        } else if (data.encuestas && Array.isArray(data.encuestas)) {
          todasLasEncuestas = data.encuestas;
        } else {
          todasLasEncuestas = [];
        }

        const estadisticasCalculadas = {
          total: todasLasEncuestas.length,
          porCategoria: {},
          activas: todasLasEncuestas.filter(e => e.activa === true).length,
          inactivas: todasLasEncuestas.filter(e => e.activa === false).length,
          resumen: {
            totalPreguntas: todasLasEncuestas.reduce((sum, e) => sum + (e.preguntas?.length || 0), 0),
            promedioPreguntas: todasLasEncuestas.length > 0 
              ? Math.round(todasLasEncuestas.reduce((sum, e) => sum + (e.preguntas?.length || 0), 0) / todasLasEncuestas.length)
              : 0
          }
        };

        todasLasEncuestas.forEach(encuesta => {
          const categoria = encuesta.categoria || 'sin_categoria';
          estadisticasCalculadas.porCategoria[categoria] = (estadisticasCalculadas.porCategoria[categoria] || 0) + 1;
        });

        setEstadisticas(estadisticasCalculadas);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      setEstadisticas({
        total: 0,
        porCategoria: {},
        activas: 0,
        inactivas: 0,
        resumen: {}
      });
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    if (usuario && 
        (usuario.rol === 'administrador' || usuario.rol === 'profesional') && 
        !datosInicializados && 
        !inicializandoRef.current) {
      inicializandoRef.current = true;
      setDatosInicializados(true);
      Promise.all([
        cargarEncuestas(true),
        cargarEstadisticas()
      ]).finally(() => {
        inicializandoRef.current = false;
      });
    }
  }, [usuario, datosInicializados, cargarEncuestas, cargarEstadisticas]);

  // Cargar encuestas cuando cambien los filtros
  useEffect(() => {
    if (datosInicializados && !inicializandoRef.current) {
      cargarEncuestas(true);
    }
  }, [filtros, datosInicializados, cargarEncuestas]);

  // Validación
  const validarFormulario = () => {
    const errores = {};
    if (!formulario.titulo?.trim()) {
      errores.titulo = 'El título es obligatorio';
    }
    if (!formulario.descripcion?.trim()) {
      errores.descripcion = 'La descripción es obligatoria';
    }
    if (!formulario.categoria || !validCategories.map(c => c.value).includes(formulario.categoria)) {
      errores.categoria = 'Debe seleccionar una categoría válida';
    }
    if (!formulario.preguntas || formulario.preguntas.length === 0) {
      errores.preguntas = 'Debe agregar al menos una pregunta';
    } else {
      formulario.preguntas.forEach((pregunta, index) => {
        if (!pregunta.enunciado?.trim()) {
          errores[`pregunta_${index}`] = `La pregunta ${index + 1} no puede estar vacía`;
        }
      });
    }
    return errores;
  };

  // Filtros
  const manejarCambioFiltro = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor,
      pagina: 1
    }));
  };

  // Formulario
  const manejarCambioFormulario = (campo, valor) => {
    setFormulario(prev => ({
      ...prev,
      [campo]: valor
    }));
    if (erroresValidacion[campo]) {
      setErroresValidacion(prev => ({
        ...prev,
        [campo]: null
      }));
    }
  };

  // Preguntas tipo escala
  const agregarPregunta = () => {
    const nuevaP = {
      enunciado: nuevaPregunta.texto.trim(),
      tipo: 'escala',
      opciones: ESCALA_OPCIONES,
      orden: formulario.preguntas.length + 1,
      obligatoria: true
    };
    setFormulario(prev => ({
      ...prev,
      preguntas: [...prev.preguntas, nuevaP]
    }));
    setNuevaPregunta({
      texto: '',
      orden: formulario.preguntas.length + 2
    });
  };

  const eliminarPregunta = (index) => {
    setFormulario(prev => ({
      ...prev,
      preguntas: prev.preguntas.filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, orden: i + 1 }))
    }));
  };

  // Modal crear
  const abrirModalCrear = () => {
    setModoModal('crear');
    setEncuestaEditando(null);
    setFormulario({
      titulo: '',
      descripcion: '',
      categoria: validCategories[0].value,
      activa: true,
      preguntas: []
    });
    setErroresValidacion({});
    setNuevaPregunta({
      texto: '',
      orden: 1
    });
    setMostrarModal(true);
  };

  // Guardar encuesta (solo creación con preguntas tipo escala)
  const guardarEncuesta = async () => {
    try {
      const errores = validarFormulario();
      if (Object.keys(errores).length > 0) {
        setErroresValidacion(errores);
        alert('Por favor corrija los errores en el formulario');
        return;
      }
      const token = localStorage.getItem('token');
      const preguntasLimpias = formulario.preguntas.map((p, idx) => ({
        enunciado: p.enunciado,
        tipo: 'escala',
        opciones: ESCALA_OPCIONES,
        orden: idx + 1,
        obligatoria: true
      }));
      const datosLimpios = {
        titulo: formulario.titulo.trim(),
        descripcion: formulario.descripcion.trim(),
        categoria: formulario.categoria,
        activa: Boolean(formulario.activa),
        preguntas: preguntasLimpias
      };
      if (modoModal === 'crear') {
        await crearEncuesta(datosLimpios, token);
        alert('Encuesta creada exitosamente');
      }
      setMostrarModal(false);
      estadisticasCargadasRef.current = false;
      await Promise.all([
        cargarEncuestas(false),
        cargarEstadisticas()
      ]);
    } catch (error) {
      alert(error.message || 'Error al guardar la encuesta');
    }
  };

  if (!usuario || (usuario.rol !== 'administrador' && usuario.rol !== 'profesional')) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.backButton}
              onClick={() => navigate('/admin')}
            >
              ← Volver al Panel
            </button>
            <div className={styles.headerTitle}>
              <h1>Gestión de Encuestas de Autoevaluación</h1>
              <p>Administra las encuestas de evaluación psicológica</p>
            </div>
          </div>
          <button 
            className={styles.createButton}
            onClick={abrirModalCrear}
          >
            + Crear Encuesta
          </button>
        </div>
      </header>

      {/* Estadísticas */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '...' : estadisticas.total}
              </div>
              <div className={styles.statLabel}>Total Encuestas</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '...' : estadisticas.activas}
              </div>
              <div className={styles.statLabel}>Encuestas Activas</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '...' : estadisticas.inactivas}
              </div>
              <div className={styles.statLabel}>Encuestas Inactivas</div>
            </div>
          </div>
          {validCategories.map(({ value, label }) => (
            <div key={value} className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingEstadisticas ? '...' : (estadisticas.porCategoria?.[value] || 0)}
                </div>
                <div className={styles.statLabel}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filtros */}
      <section className={styles.filtersSection}>
        <div className={styles.filtersGrid}>
          <div className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar encuestas..."
              value={filtros.busqueda}
              onChange={(e) => manejarCambioFiltro('busqueda', e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={filtros.categoria}
            onChange={(e) => manejarCambioFiltro('categoria', e.target.value)}
          >
            <option value="">Todas las categorías</option>
            {validCategories.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <select
            className={styles.filterSelect}
            value={filtros.activa}
            onChange={(e) => manejarCambioFiltro('activa', e.target.value)}
          >
            <option value="">Todas</option>
            <option value="true">Activas</option>
            <option value="false">Inactivas</option>
          </select>
        </div>
      </section>

      {/* Encuestas */}
      <section className={styles.surveysSection}>
        {loading ? (
          <div className={styles.loading}>Cargando encuestas...</div>
        ) : error ? (
          <div className={styles.error}>Error: {error}</div>
        ) : !Array.isArray(encuestas) ? (
          <div className={styles.error}>Error: Formato de datos inválido</div>
        ) : encuestas.length === 0 ? (
          <div className={styles.noSurveys}>No se encontraron encuestas</div>
        ) : (
          <>
            <div className={styles.surveysGrid}>
              {encuestas.map((encuesta) => (
                <div key={encuesta._id} className={styles.surveyCard}>
                  <div className={styles.surveyHeader}>
                    <span className={styles.surveyCategory}>
                      {validCategories.find(c => c.value === encuesta.categoria)?.label || encuesta.categoria}
                    </span>
                    <span className={`${styles.statusBadge} ${encuesta.activa ? styles.active : styles.inactive}`}>
                      {encuesta.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className={styles.surveyContent}>
                    <h3 className={styles.surveyTitle}>{encuesta.titulo}</h3>
                    <p className={styles.surveyDescription}>{encuesta.descripcion}</p>
                    <div className={styles.surveyMeta}>
                      <div className={styles.surveyStats}>
                        <span> {encuesta.preguntas?.length || 0} preguntas</span>
                        <span> {encuesta.totalRespuestas || 0} respuestas</span>
                        <span> {new Date(encuesta.fechaCreacion).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.surveyActions}>
                    <button
                      className={styles.editButton}
                      // onClick={() => abrirModalEditar(encuesta)}
                      disabled
                    >
                      Editar
                    </button>
                    <button
                      className={`${styles.toggleButton} ${encuesta.activa ? styles.deactivate : styles.activate}`}
                      // onClick={() => alternarEstadoActivo(encuesta)}
                      disabled
                    >
                      {encuesta.activa ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      className={styles.deleteButton}
                      // onClick={() => eliminarEncuesta(encuesta._id)}
                      disabled
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {paginacion.totalPaginas > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  disabled={filtros.pagina <= 1}
                  onClick={() => manejarCambioFiltro('pagina', filtros.pagina - 1)}
                >
                  ← Anterior
                </button>
                <span className={styles.paginationInfo}>
                  Página {filtros.pagina} de {paginacion.totalPaginas}
                </span>
                <button
                  className={styles.paginationButton}
                  disabled={filtros.pagina >= paginacion.totalPaginas}
                  onClick={() => manejarCambioFiltro('pagina', filtros.pagina + 1)}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal */}
      {mostrarModal && (
        <div className={styles.modalOverlay} onClick={() => setMostrarModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{modoModal === 'crear' ? 'Crear Nueva Encuesta' : 'Editar Encuesta'}</h2>
              <button
                className={styles.closeButton}
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>
            <div className={styles.modalContent}>
              <form className={styles.form}>
                {/* Información básica */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Información Básica</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Título <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="text"
                        className={`${styles.input} ${erroresValidacion.titulo ? styles.inputError : ''}`}
                        value={formulario.titulo}
                        onChange={(e) => manejarCambioFormulario('titulo', e.target.value)}
                        placeholder="Título de la encuesta"
                      />
                      {erroresValidacion.titulo && (
                        <span className={styles.errorMessage}>{erroresValidacion.titulo}</span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Categoría <span className={styles.required}>*</span>
                      </label>
                      <select
                        className={`${styles.select} ${erroresValidacion.categoria ? styles.inputError : ''}`}
                        value={formulario.categoria}
                        onChange={(e) => manejarCambioFormulario('categoria', e.target.value)}
                      >
                        {validCategories.map(({ value, label }) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                      {erroresValidacion.categoria && (
                        <span className={styles.errorMessage}>{erroresValidacion.categoria}</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Descripción <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      className={`${styles.textarea} ${erroresValidacion.descripcion ? styles.inputError : ''}`}
                      value={formulario.descripcion}
                      onChange={(e) => manejarCambioFormulario('descripcion', e.target.value)}
                      placeholder="Descripción de la encuesta"
                    />
                    {erroresValidacion.descripcion && (
                      <span className={styles.errorMessage}>{erroresValidacion.descripcion}</span>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={formulario.activa}
                        onChange={(e) => manejarCambioFormulario('activa', e.target.checked)}
                      />
                      <label className={styles.checkboxLabel}>
                        Encuesta activa
                      </label>
                    </div>
                  </div>
                </div>
                {/* Preguntas existentes */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>
                    Preguntas ({formulario.preguntas.length})
                    {erroresValidacion.preguntas && (
                      <span className={styles.errorMessage}> - {erroresValidacion.preguntas}</span>
                    )}
                  </h3>
                  <div className={styles.questionsList}>
                    {formulario.preguntas.map((pregunta, index) => (
                      <div key={index} className={styles.questionCard}>
                        <div className={styles.questionHeader}>
                          <span className={styles.questionNumber}>Pregunta {index + 1}</span>
                          <button
                            type="button"
                            className={styles.deleteQuestionButton}
                            onClick={() => eliminarPregunta(index)}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className={styles.questionContent}>
                          <p className={styles.questionText}>{pregunta.enunciado}</p>
                          <div className={styles.questionMeta}>
                            <span className={styles.questionType}>escala</span>
                            <span className={styles.questionOptions}>
                              {ESCALA_OPCIONES.join(', ')}
                            </span>
                            <span className={styles.questionRequired}>
                              Obligatoria
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Nueva pregunta */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Agregar Nueva Pregunta</h3>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Enunciado de la pregunta</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={nuevaPregunta.texto}
                      onChange={(e) => setNuevaPregunta(prev => ({ ...prev, texto: e.target.value }))}
                      placeholder="Escriba el enunciado"
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.addQuestionButton}
                    onClick={agregarPregunta}
                    disabled={!nuevaPregunta.texto.trim()}
                  >
                    ➕ Agregar Pregunta
                  </button>
                  <div style={{marginTop: 10, fontSize: '0.95em', color: '#5a6c6d'}}>
                    Todas las preguntas serán tipo <b>escala</b> con opciones: {ESCALA_OPCIONES.join(', ')}
                  </div>
                </div>
              </form>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.saveButton}
                onClick={guardarEncuesta}
                disabled={Object.keys(erroresValidacion).length > 0}
              >
                {modoModal === 'crear' ? 'Crear Encuesta' : 'Actualizar Encuesta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveysManagement;