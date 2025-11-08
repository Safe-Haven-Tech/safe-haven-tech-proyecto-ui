import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import { fetchEstadisticas } from '../../services/informationalResourcesService';
import styles from './ResourcesManagement.module.css';

const ConfirmModal = ({
  show,
  title,
  message,
  onCancel,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
}) => {
  if (!show) return null;
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <p>{message}</p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={styles.saveButton} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoModal = ({ show, title, message, onClose, okText = 'Aceptar' }) => {
  if (!show) return null;
  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
        <div className={styles.modalContent}>
          <p>{message}</p>
        </div>
        <div className={styles.modalActions}>
          <button className={styles.saveButton} onClick={onClose}>
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ResourcesManagement = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  // Estados principales
  const [recursos, setRecursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paginacion, setPaginacion] = useState({});

  // Estados para filtros y búsqueda
  const [filtros, setFiltros] = useState({
    busqueda: '',
    tipo: '',
    destacado: '',
    topico: '',
    pagina: 1,
  });

  // Estados para modales
  const [mostrarModal, setMostrarModal] = useState(false);
  const [recursoEditando, setRecursoEditando] = useState(null);
  const [modoModal, setModoModal] = useState('crear');

  // Estados para formulario
  const [formulario, setFormulario] = useState({
    titulo: '',
    contenido: '',
    contenidoHTML: '',
    resumen: '',
    topicos: [],
    fuente: '',
    descripcion: '',
    tipo: 'articulo',
    etiquetas: [],
    destacado: false,
  });

  // Estados para estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porTipo: {},
    masVisitados: [],
    resumen: {},
  });

  // Estado para loading de estadísticas
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);

  // Estados para validación
  const [erroresValidacion, setErroresValidacion] = useState({});

  // Estados para etiquetas y tópicos temporales
  const [nuevaEtiqueta, setNuevaEtiqueta] = useState('');
  const [nuevoTopico, setNuevoTopico] = useState('');

  // Estado para controlar si ya se cargaron los datos iniciales
  const [datosInicializados, setDatosInicializados] = useState(false);

  // Ref para evitar llamadas duplicadas
  const inicializandoRef = useRef(false);
  const estadisticasCargadasRef = useRef(false);

  // Confirm / Info modals state
  const [confirmState, setConfirmState] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
  });
  const [infoState, setInfoState] = useState({
    show: false,
    title: '',
    message: '',
    onClose: null,
  });

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

  // Función para cargar recursos - OPTIMIZADA
  const cargarRecursos = useCallback(
    async (mostrarLoading = true) => {
      try {
        if (mostrarLoading) {
          setLoading(true);
        }
        setError(null);

        const params = new URLSearchParams();
        if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
        if (filtros.tipo) params.append('tipo', filtros.tipo);
        if (filtros.destacado !== '')
          params.append('destacado', filtros.destacado);
        if (filtros.topico) params.append('topico', filtros.topico);
        params.append('pagina', filtros.pagina);
        params.append('limite', 10);

        const token = localStorage.getItem('token');
        const response = await fetch(
          `http://localhost:3000/api/recursos-informativos?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Error al cargar recursos');
        }

        const data = await response.json();
        setRecursos(data.data);
        setPaginacion(data.paginacion);
      } catch (error) {
        console.error('Error cargando recursos:', error);
        setError(error.message);
      } finally {
        if (mostrarLoading) {
          setLoading(false);
        }
      }
    },
    [filtros]
  );

  // Función para cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    // Evitar cargas duplicadas
    if (estadisticasCargadasRef.current || loadingEstadisticas === false) {
      return;
    }

    console.log('📊 Cargando estadísticas...');
    estadisticasCargadasRef.current = true;
    setLoadingEstadisticas(true);

    try {
      const estadisticasData = await fetchEstadisticas();

      setEstadisticas({
        total: estadisticasData.total || 0,
        porTipo: estadisticasData.porTipo || {},
        masVisitados: estadisticasData.masVisitados || [],
        resumen: estadisticasData.resumen || {},
      });

      console.log('✅ Estadísticas cargadas exitosamente');
    } catch (error) {
      console.warn(error);
      await calcularEstadisticasManualmente();
    } finally {
      setLoadingEstadisticas(false);
    }
  }, [loadingEstadisticas]);

  const calcularEstadisticasManualmente = async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        'http://localhost:3000/api/recursos-informativos?limite=1000',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const todosLosRecursos = data.data || [];

        const estadisticasCalculadas = {
          total: todosLosRecursos.length,
          porTipo: {},
          masVisitados: todosLosRecursos
            .sort((a, b) => (b.visitas || 0) - (a.visitas || 0))
            .slice(0, 5),
          resumen: {
            totalVisitas: todosLosRecursos.reduce(
              (sum, r) => sum + (r.visitas || 0),
              0
            ),
            totalDescargas: todosLosRecursos.reduce(
              (sum, r) => sum + (r.descargas || 0),
              0
            ),
            destacados: todosLosRecursos.filter((r) => r.destacado).length,
          },
        };

        todosLosRecursos.forEach((recurso) => {
          const tipo = recurso.tipo || 'sin_tipo';
          estadisticasCalculadas.porTipo[tipo] =
            (estadisticasCalculadas.porTipo[tipo] || 0) + 1;
        });

        console.log('✅ Estadísticas calculadas manualmente');
        setEstadisticas(estadisticasCalculadas);
      }
    } catch (error) {
      console.error('❌ Error calculando estadísticas manualmente:', error);
      setEstadisticas({
        total: 0,
        porTipo: {},
        masVisitados: [],
        resumen: {},
      });
    }
  };

  useEffect(() => {
    if (
      usuario &&
      (usuario.rol === 'administrador' || usuario.rol === 'profesional') &&
      !datosInicializados &&
      !inicializandoRef.current
    ) {
      console.log('🚀 Inicializando datos...');
      inicializandoRef.current = true;
      setDatosInicializados(true);

      Promise.all([cargarRecursos(true), cargarEstadisticas()]).finally(() => {
        console.log('✅ Datos inicializados correctamente');
        inicializandoRef.current = false;
      });
    }
  }, [usuario, datosInicializados, cargarRecursos, cargarEstadisticas]);

  useEffect(() => {
    if (datosInicializados && !inicializandoRef.current) {
      console.log('🔄 Actualizando recursos por filtros...');
      cargarRecursos(true);
    }
  }, [filtros, datosInicializados, cargarRecursos]);

  const validarFormulario = () => {
    const errores = {};

    if (!formulario.titulo?.trim()) {
      errores.titulo = 'El título es obligatorio';
    } else if (formulario.titulo.trim().length < 5) {
      errores.titulo = 'El título debe tener al menos 5 caracteres';
    }

    if (!formulario.contenido?.trim()) {
      errores.contenido = 'El contenido es obligatorio';
    } else if (formulario.contenido.trim().length < 20) {
      errores.contenido = 'El contenido debe tener al menos 20 caracteres';
    }

    if (!formulario.descripcion?.trim()) {
      errores.descripcion = 'La descripción es obligatoria';
    } else if (formulario.descripcion.trim().length < 10) {
      errores.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }

    if (!formulario.tipo) {
      errores.tipo = 'Debe seleccionar un tipo de recurso';
    }

    if (!formulario.fuente?.trim()) {
      errores.fuente = 'La fuente es obligatoria';
    }

    if (formulario.topicos.length === 0) {
      errores.topicos = 'Debe agregar al menos un tópico';
    }

    return errores;
  };

  // Función para convertir texto a HTML básico
  const convertirTextoAHTML = (texto) => {
    if (!texto) return '';

    return texto
      .split('\n')
      .map((parrafo) => parrafo.trim())
      .filter((parrafo) => parrafo.length > 0)
      .map((parrafo) => `<p>${parrafo}</p>`)
      .join('\n');
  };

  // Función para manejar cambios en filtros
  const manejarCambioFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
      pagina: 1,
    }));
  };

  // Función para manejar cambios en el formulario
  const manejarCambioFormulario = (campo, valor) => {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    if (erroresValidacion[campo]) {
      setErroresValidacion((prev) => ({
        ...prev,
        [campo]: null,
      }));
    }
  };

  // Función para agregar etiqueta
  const agregarEtiqueta = (e) => {
    if (e.key === 'Enter' && nuevaEtiqueta.trim()) {
      e.preventDefault();
      if (!formulario.etiquetas.includes(nuevaEtiqueta.trim())) {
        setFormulario((prev) => ({
          ...prev,
          etiquetas: [...prev.etiquetas, nuevaEtiqueta.trim()],
        }));
      }
      setNuevaEtiqueta('');
    }
  };

  const eliminarEtiqueta = (index) => {
    setFormulario((prev) => ({
      ...prev,
      etiquetas: prev.etiquetas.filter((_, i) => i !== index),
    }));
  };

  // Función para agregar tópico
  const agregarTopico = (e) => {
    if (e.key === 'Enter' && nuevoTopico.trim()) {
      e.preventDefault();
      if (!formulario.topicos.includes(nuevoTopico.trim())) {
        setFormulario((prev) => ({
          ...prev,
          topicos: [...prev.topicos, nuevoTopico.trim()],
        }));

        // Limpiar error de tópicos si se agrega uno
        if (erroresValidacion.topicos) {
          setErroresValidacion((prev) => ({
            ...prev,
            topicos: null,
          }));
        }
      }
      setNuevoTopico('');
    }
  };

  const eliminarTopico = (index) => {
    setFormulario((prev) => ({
      ...prev,
      topicos: prev.topicos.filter((_, i) => i !== index),
    }));
  };

  // Validar formulario cuando cambie
  useEffect(() => {
    if (mostrarModal) {
      const errores = validarFormulario();
      setErroresValidacion(errores);
    }
  }, [formulario, mostrarModal]);

  // Función para abrir modal de creación
  const abrirModalCrear = () => {
    setModoModal('crear');
    setRecursoEditando(null);
    setFormulario({
      titulo: '',
      contenido: '',
      contenidoHTML: '',
      resumen: '',
      topicos: [],
      fuente: '',
      descripcion: '',
      tipo: 'articulo',
      etiquetas: [],
      destacado: false,
    });
    setErroresValidacion({});
    setNuevaEtiqueta('');
    setNuevoTopico('');
    setMostrarModal(true);
  };

  // Función para abrir modal de edición
  const abrirModalEditar = (recurso) => {
    setModoModal('editar');
    setRecursoEditando(recurso);
    setFormulario({
      titulo: recurso.titulo || '',
      contenido: recurso.contenido || '',
      contenidoHTML: recurso.contenidoHTML || '',
      resumen: recurso.resumen || '',
      topicos: recurso.topicos || [],
      fuente: recurso.fuente || '',
      descripcion: recurso.descripcion || '',
      tipo: recurso.tipo || 'articulo',
      etiquetas: recurso.etiquetas || [],
      destacado: recurso.destacado || false,
    });
    setErroresValidacion({});
    setNuevaEtiqueta('');
    setNuevoTopico('');
    setMostrarModal(true);
  };

  // Función para guardar recurso - reemplaza alerts por modal infoState
  const guardarRecurso = async () => {
    try {
      console.log('💾 Guardando recurso...');

      // Validar formulario
      const errores = validarFormulario();
      if (Object.keys(errores).length > 0) {
        setErroresValidacion(errores);
        setInfoState({
          show: true,
          title: 'Errores en el formulario',
          message:
            'Por favor corrija los errores en el formulario antes de continuar.',
          onClose: null,
        });
        return;
      }

      // Preparar datos limpios
      const datosLimpios = {
        titulo: formulario.titulo.trim(),
        contenido: formulario.contenido.trim(),
        descripcion: formulario.descripcion.trim(),
        tipo: formulario.tipo,
        fuente: formulario.fuente.trim(),
        topicos: formulario.topicos.filter((t) => t.trim() !== ''),
        etiquetas: formulario.etiquetas.filter((e) => e.trim() !== ''),
        destacado: Boolean(formulario.destacado),
        contenidoHTML:
          formulario.contenidoHTML?.trim() ||
          convertirTextoAHTML(formulario.contenido.trim()),
        ...(formulario.resumen?.trim() && {
          resumen: formulario.resumen.trim(),
        }),
      };

      const token = localStorage.getItem('token');

      if (!token) {
        setInfoState({
          show: true,
          title: 'Sesión expirada',
          message:
            'No se encontró token de autenticación. Por favor, inicia sesión nuevamente.',
          onClose: () => {
            setInfoState({
              show: false,
              title: '',
              message: '',
              onClose: null,
            });
            navigate('/login');
          },
        });
        return;
      }

      const url =
        modoModal === 'crear'
          ? 'http://localhost:3000/api/recursos-informativos'
          : `http://localhost:3000/api/recursos-informativos/${recursoEditando._id}`;

      const method = modoModal === 'crear' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosLimpios),
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(parseError);
      }

      if (response.ok) {
        console.log('✅ Recurso guardado exitosamente');
        setMostrarModal(false);

        // Resetear flags para permitir recarga de estadísticas
        estadisticasCargadasRef.current = false;

        // Recargar datos
        await Promise.all([cargarRecursos(false), cargarEstadisticas()]);

        // Resetear formulario
        setFormulario({
          titulo: '',
          contenido: '',
          contenidoHTML: '',
          resumen: '',
          topicos: [],
          fuente: '',
          descripcion: '',
          tipo: 'articulo',
          etiquetas: [],
          destacado: false,
        });

        // Mostrar modal de éxito
        setInfoState({
          show: true,
          title:
            modoModal === 'crear' ? 'Recurso creado' : 'Recurso actualizado',
          message:
            modoModal === 'crear'
              ? 'El recurso se creó correctamente.'
              : 'El recurso se actualizó correctamente.',
          onClose: null,
        });
      } else {
        let mensajeError = 'Error desconocido';

        if (responseData && responseData.mensaje) {
          mensajeError = responseData.mensaje;
        } else if (responseData && responseData.error) {
          mensajeError = responseData.error;
        } else if (
          responseData &&
          responseData.errors &&
          Array.isArray(responseData.errors)
        ) {
          mensajeError = responseData.errors.join('\n');
        }

        setInfoState({
          show: true,
          title: `Error (${response.status})`,
          message: mensajeError,
          onClose: null,
        });
      }
    } catch (error) {
      console.error('❌ Error guardando recurso:', error);
      setInfoState({
        show: true,
        title: 'Error al guardar',
        message: error.message || 'Error desconocido al guardar el recurso',
        onClose: null,
      });
    }
  };

  // Ejecuta la petición de eliminación (llamada interna tras confirmar)
  const ejecutarEliminarRecurso = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/recursos-informativos/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        estadisticasCargadasRef.current = false;
        await Promise.all([cargarRecursos(false), cargarEstadisticas()]);

        // Mostrar modal de éxito
        setInfoState({
          show: true,
          title: 'Recurso eliminado',
          message: 'El recurso se eliminó correctamente.',
          onClose: null,
        });
      } else {
        throw new Error('Error al eliminar el recurso');
      }
    } catch (error) {
      console.error('Error eliminando recurso:', error);
      setInfoState({
        show: true,
        title: 'Error',
        message: 'Error al eliminar el recurso. Intenta de nuevo.',
        onClose: null,
      });
    } finally {
      // Cerrar confirm modal si aún está abierta
      setConfirmState((s) => ({ ...s, show: false, onConfirm: null }));
    }
  };

  // Abre modal de confirmación para eliminar recurso
  const confirmarEliminarRecurso = (id) => {
    setConfirmState({
      show: true,
      title: 'Eliminar recurso',
      message:
        '¿Estás seguro de que deseas eliminar este recurso? Esta acción no se puede deshacer.',
      onConfirm: () => ejecutarEliminarRecurso(id),
    });
  };

  // Función para alternar destacado
  const alternarDestacado = async (recurso) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `http://localhost:3000/api/recursos-informativos/${recurso._id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            destacado: !recurso.destacado,
          }),
        }
      );

      if (response.ok) {
        estadisticasCargadasRef.current = false;
        await Promise.all([cargarRecursos(false), cargarEstadisticas()]);
      } else {
        throw new Error('Error al actualizar el recurso');
      }
    } catch (error) {
      console.error('Error actualizando recurso:', error);
      setInfoState({
        show: true,
        title: 'Error al actualizar',
        message: 'No se pudo actualizar el recurso. Intenta nuevamente.',
        onClose: null,
      });
    }
  };

  if (
    !usuario ||
    (usuario.rol !== 'administrador' && usuario.rol !== 'profesional')
  ) {
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
              onClick={() => navigate('/admin/panel')}
            >
              ← Volver al Panel
            </button>
            <div className={styles.headerTitle}>
              <h1>Gestión de Recursos Informativos</h1>
              <p>Administra el contenido educativo de la plataforma</p>
            </div>
          </div>
          <button className={styles.createButton} onClick={abrirModalCrear}>
            + Crear Recurso
          </button>
        </div>
      </header>

      {/* Estadísticas */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {/* Tarjeta de Total - Siempre primera */}
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '...' : estadisticas.total || 0}
              </div>
              <div className={styles.statLabel}>Total Recursos</div>
            </div>
          </div>

          {/* Tarjetas dinámicas por tipo */}
          {[
            { key: 'articulo', label: 'Artículos' },
            { key: 'guia', label: 'Guías' },
            { key: 'video', label: 'Videos' },
            { key: 'infografia', label: 'Infografías' },
            { key: 'podcast', label: 'Podcasts' },
            { key: 'libro', label: 'Libros' },
            { key: 'curso', label: 'Cursos' },
          ].map(({ key, label }) => (
            <div key={key} className={styles.statCard}>
              <div className={styles.statContent}>
                <div className={styles.statNumber}>
                  {loadingEstadisticas
                    ? '...'
                    : estadisticas.porTipo?.[key] || 0}
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
              placeholder="Buscar recursos..."
              value={filtros.busqueda}
              onChange={(e) => manejarCambioFiltro('busqueda', e.target.value)}
            />
          </div>
          <select
            className={styles.filterSelect}
            value={filtros.tipo}
            onChange={(e) => manejarCambioFiltro('tipo', e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="articulo">Artículos</option>
            <option value="guia">Guías</option>
            <option value="infografia">Infografías</option>
            <option value="video">Videos</option>
            <option value="podcast">Podcasts</option>
            <option value="libro">Libros</option>
            <option value="curso">Cursos</option>
          </select>
          <select
            className={styles.filterSelect}
            value={filtros.destacado}
            onChange={(e) => manejarCambioFiltro('destacado', e.target.value)}
          >
            <option value="">Todos</option>
            <option value="true">Destacados</option>
            <option value="false">No destacados</option>
          </select>
          <input
            type="text"
            className={styles.filterInput}
            placeholder="Filtrar por tópico..."
            value={filtros.topico}
            onChange={(e) => manejarCambioFiltro('topico', e.target.value)}
          />
        </div>
      </section>

      {/* Recursos */}
      <section className={styles.resourcesSection}>
        {loading ? (
          <div className={styles.loading}>Cargando recursos...</div>
        ) : error ? (
          <div className={styles.error}>Error: {error}</div>
        ) : recursos.length === 0 ? (
          <div className={styles.noResources}>No se encontraron recursos</div>
        ) : (
          <>
            <div className={styles.resourcesGrid}>
              {recursos.map((recurso) => (
                <div key={recurso._id} className={styles.resourceCard}>
                  <div className={styles.resourceHeader}>
                    <span className={styles.resourceType}>{recurso.tipo}</span>
                    {recurso.destacado && (
                      <span className={styles.featuredBadge}>Destacado</span>
                    )}
                  </div>

                  <div className={styles.resourceContent}>
                    <h3 className={styles.resourceTitle}>{recurso.titulo}</h3>
                    <p className={styles.resourceDescription}>
                      {recurso.descripcion}
                    </p>

                    <div className={styles.resourceMeta}>
                      {recurso.topicos && recurso.topicos.length > 0 && (
                        <div className={styles.resourceTopics}>
                          {recurso.topicos.slice(0, 3).map((topico, index) => (
                            <span key={index} className={styles.topicTag}>
                              {topico}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className={styles.resourceStats}>
                        <span> {recurso.visitas || 0} visitas</span>
                        <span> {recurso.descargas || 0} descargas</span>
                        <span> {recurso.compartidos || 0} compartidos</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.resourceActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => abrirModalEditar(recurso)}
                    >
                      Editar
                    </button>
                    <button
                      className={`${styles.featuredToggle} ${recurso.destacado ? styles.featured : ''}`}
                      onClick={() => alternarDestacado(recurso)}
                    >
                      {recurso.destacado ? 'Quitar' : 'Destacar'}
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => confirmarEliminarRecurso(recurso._id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {paginacion.totalPaginas > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  disabled={filtros.pagina <= 1}
                  onClick={() =>
                    manejarCambioFiltro('pagina', filtros.pagina - 1)
                  }
                >
                  ← Anterior
                </button>
                <span className={styles.paginationInfo}>
                  Página {filtros.pagina} de {paginacion.totalPaginas}
                </span>
                <button
                  className={styles.paginationButton}
                  disabled={filtros.pagina >= paginacion.totalPaginas}
                  onClick={() =>
                    manejarCambioFiltro('pagina', filtros.pagina + 1)
                  }
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Modal crear/editar */}
      {mostrarModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setMostrarModal(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>
                {modoModal === 'crear'
                  ? 'Crear Nuevo Recurso'
                  : 'Editar Recurso'}
              </h2>
              <button
                className={styles.closeButton}
                onClick={() => setMostrarModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles.modalContent}>
              <form className={styles.form}>
                {/* Título y Tipo */}
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Título <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={`${styles.input} ${erroresValidacion.titulo ? styles.inputError : ''}`}
                      value={formulario.titulo}
                      onChange={(e) =>
                        manejarCambioFormulario('titulo', e.target.value)
                      }
                      placeholder="Título del recurso"
                    />
                    {erroresValidacion.titulo && (
                      <span className={styles.errorMessage}>
                        {erroresValidacion.titulo}
                      </span>
                    )}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Tipo <span className={styles.required}>*</span>
                    </label>
                    <select
                      className={`${styles.select} ${erroresValidacion.tipo ? styles.inputError : ''}`}
                      value={formulario.tipo}
                      onChange={(e) =>
                        manejarCambioFormulario('tipo', e.target.value)
                      }
                    >
                      <option value="">Seleccionar tipo</option>
                      <option value="articulo">Artículo</option>
                      <option value="guia">Guía</option>
                      <option value="infografia">Infografía</option>
                      <option value="video">Video</option>
                      <option value="podcast">Podcast</option>
                      <option value="libro">Libro</option>
                      <option value="curso">Curso</option>
                    </select>
                    {erroresValidacion.tipo && (
                      <span className={styles.errorMessage}>
                        {erroresValidacion.tipo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Descripción */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Descripción <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={`${styles.textarea} ${erroresValidacion.descripcion ? styles.inputError : ''}`}
                    value={formulario.descripcion}
                    onChange={(e) =>
                      manejarCambioFormulario('descripcion', e.target.value)
                    }
                    placeholder="Descripción breve del recurso"
                  />
                  {erroresValidacion.descripcion && (
                    <span className={styles.errorMessage}>
                      {erroresValidacion.descripcion}
                    </span>
                  )}
                </div>

                {/* Fuente */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Fuente <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={`${styles.input} ${erroresValidacion.fuente ? styles.inputError : ''}`}
                    value={formulario.fuente}
                    onChange={(e) =>
                      manejarCambioFormulario('fuente', e.target.value)
                    }
                    placeholder="Fuente del recurso (URL, autor, organización, etc.)"
                  />
                  {erroresValidacion.fuente && (
                    <span className={styles.errorMessage}>
                      {erroresValidacion.fuente}
                    </span>
                  )}
                </div>

                {/* Contenido */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Contenido <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    className={`${styles.textareaLarge} ${erroresValidacion.contenido ? styles.inputError : ''}`}
                    value={formulario.contenido}
                    onChange={(e) =>
                      manejarCambioFormulario('contenido', e.target.value)
                    }
                    placeholder="Contenido completo del recurso"
                  />
                  {erroresValidacion.contenido && (
                    <span className={styles.errorMessage}>
                      {erroresValidacion.contenido}
                    </span>
                  )}
                </div>

                {/* Resumen (opcional) */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Resumen</label>
                  <textarea
                    className={styles.textarea}
                    value={formulario.resumen}
                    onChange={(e) =>
                      manejarCambioFormulario('resumen', e.target.value)
                    }
                    placeholder="Resumen del contenido (opcional)"
                  />
                  <span className={styles.helpText}>
                    Campo opcional - Resumen breve del contenido
                  </span>
                </div>

                {/* Tópicos */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Tópicos <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.tagsContainer}>
                    <div
                      className={`${styles.tagsDisplay} ${erroresValidacion.topicos ? styles.inputError : ''}`}
                    >
                      {formulario.topicos.map((topico, index) => (
                        <div key={index} className={styles.tag}>
                          {topico}
                          <button
                            type="button"
                            className={styles.tagRemove}
                            onClick={() => eliminarTopico(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      className={styles.tagInput}
                      value={nuevoTopico}
                      onChange={(e) => setNuevoTopico(e.target.value)}
                      onKeyPress={agregarTopico}
                      placeholder="Escriba un tópico y presione Enter"
                    />
                    {erroresValidacion.topicos && (
                      <span className={styles.errorMessage}>
                        {erroresValidacion.topicos}
                      </span>
                    )}
                    <span className={styles.helpText}>
                      Presione Enter para agregar cada tópico. Debe agregar al
                      menos uno.
                    </span>
                  </div>
                </div>

                {/* Etiquetas */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Etiquetas</label>
                  <div className={styles.tagsContainer}>
                    <div className={styles.tagsDisplay}>
                      {formulario.etiquetas.map((etiqueta, index) => (
                        <div key={index} className={styles.tag}>
                          {etiqueta}
                          <button
                            type="button"
                            className={styles.tagRemove}
                            onClick={() => eliminarEtiqueta(index)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="text"
                      className={styles.tagInput}
                      value={nuevaEtiqueta}
                      onChange={(e) => setNuevaEtiqueta(e.target.value)}
                      onKeyPress={agregarEtiqueta}
                      placeholder="Escriba una etiqueta y presione Enter"
                    />
                    <span className={styles.helpText}>
                      Presione Enter para agregar cada etiqueta
                    </span>
                  </div>
                </div>

                {/* Destacado */}
                <div className={styles.formGroup}>
                  <div className={styles.checkboxContainer}>
                    <input
                      type="checkbox"
                      className={styles.checkbox}
                      checked={formulario.destacado}
                      onChange={(e) =>
                        manejarCambioFormulario('destacado', e.target.checked)
                      }
                    />
                    <label className={styles.checkboxLabel}>
                      Marcar como recurso destacado
                    </label>
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
                onClick={guardarRecurso}
                disabled={Object.keys(erroresValidacion).length > 0}
              >
                {modoModal === 'crear' ? 'Crear Recurso' : 'Actualizar Recurso'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmación global */}
      <ConfirmModal
        show={confirmState.show}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={() =>
          setConfirmState((s) => ({ ...s, show: false, onConfirm: null }))
        }
        onConfirm={() => {
          // cerrar modal inmediatamente para evitar dobles clicks
          setConfirmState((s) => ({ ...s, show: false }));
          if (typeof confirmState.onConfirm === 'function')
            confirmState.onConfirm();
        }}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de información / éxito */}
      <InfoModal
        show={infoState.show}
        title={infoState.title}
        message={infoState.message}
        onClose={() => {
          if (typeof infoState.onClose === 'function') {
            infoState.onClose();
          } else {
            setInfoState({
              show: false,
              title: '',
              message: '',
              onClose: null,
            });
          }
        }}
        okText="Aceptar"
      />
    </div>
  );
};

export default ResourcesManagement;
