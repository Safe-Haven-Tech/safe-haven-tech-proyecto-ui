import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../context/useAuth';
import { useNavigate } from 'react-router-dom';
import {
  fetchEncuestas,
  crearEncuesta,
  desactivarEncuesta,
  eliminarEncuesta,
  activarEncuesta,
  actualizarEncuesta,
} from '../../services/surveysServices';
import styles from './SurveysManagement.module.css';

const ESCALA_OPCIONES = [
  'Nunca',
  'Raramente',
  'A veces',
  'Frecuentemente',
  'Siempre',
];
const validCategories = [
  { value: 'salud_mental', label: 'Salud mental' },
  { value: 'bienestar', label: 'Bienestar emocional' },
  { value: 'estres', label: 'Estrés' },
  { value: 'ansiedad', label: 'Ansiedad' },
  { value: 'depresion', label: 'Depresión' },
  { value: 'otro', label: 'Otro' },
];

const nivelesRiesgo = [
  { value: 'bajo', label: 'Bajo Riesgo', color: '#4CAF50' },
  { value: 'medio', label: 'Riesgo Medio', color: '#FF9800' },
  { value: 'alto', label: 'Alto Riesgo', color: '#FF5722' },
  { value: 'crítico', label: 'Riesgo Crítico', color: '#D32F2F' },
];

// Reutilizable: modal de confirmación
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

// Reutilizable: modal informativo / de éxito / error
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
          <p style={{ whiteSpace: 'pre-wrap' }}>{message}</p>
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

const SurveysManagement = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();

  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginacion, setPaginacion] = useState({});
  const [filtros, setFiltros] = useState({
    busqueda: '',
    categoria: '',
    activa: '',
    pagina: 1,
  });
  const [mostrarModal, setMostrarModal] = useState(false);
  const [encuestaEditando, setEncuestaEditando] = useState(null);
  const [modoModal, setModoModal] = useState('crear');
  const [formulario, setFormulario] = useState({
    titulo: '',
    descripcion: '',
    categoria: validCategories[0].value,
    activa: true,
    preguntas: [],
    recomendacionesPorNivel: [],
  });
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porCategoria: {},
    activas: 0,
    inactivas: 0,
    resumen: {},
  });
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);
  const [erroresValidacion, setErroresValidacion] = useState({});
  const [nuevaPregunta, setNuevaPregunta] = useState({
    texto: '',
    orden: 1,
  });
  const [nuevoNivel, setNuevoNivel] = useState({
    rangoMin: '',
    rangoMax: '',
    nivel: 'bajo', // Valor por defecto
    descripcion: '',
    recomendaciones: [''],
    colorHexadecimal: '#4CAF50',
  });
  const [datosInicializados, setDatosInicializados] = useState(false);
  const inicializandoRef = useRef(false);
  const estadisticasCargadasRef = useRef(false);

  // Estados de modal globales (confirmación + info)
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

  // Modal: animación, cerrar con Esc y enfocar primer campo
  const tituloInputRef = useRef(null);
  useEffect(() => {
    if (mostrarModal && tituloInputRef.current) {
      tituloInputRef.current.focus();
    }
  }, [mostrarModal]);
  useEffect(() => {
    if (!mostrarModal) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMostrarModal(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [mostrarModal]);

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

  const cargarEncuestas = useCallback(
    async (mostrarLoading = true) => {
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
        const response = await fetch(
          `http://localhost:3000/api/encuestas?${params}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

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
            total: encuestasArray.length,
          });
        }
      } catch (error) {
        setError(error.message);
        setEncuestas([]);
      } finally {
        if (mostrarLoading) setLoading(false);
      }
    },
    [filtros]
  );

  const cargarEstadisticas = useCallback(async () => {
    if (estadisticasCargadasRef.current || loadingEstadisticas === false)
      return;
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
        resumen: {},
      });
    } finally {
      setLoadingEstadisticas(false);
    }
  }, [loadingEstadisticas]);

  const calcularEstadisticasManualmente = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        'http://localhost:3000/api/encuestas?limite=1000',
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

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
          activas: todasLasEncuestas.filter((e) => e.activa === true).length,
          inactivas: todasLasEncuestas.filter((e) => e.activa === false).length,
          resumen: {
            totalPreguntas: todasLasEncuestas.reduce(
              (sum, e) => sum + (e.preguntas?.length || 0),
              0
            ),
            promedioPreguntas:
              todasLasEncuestas.length > 0
                ? Math.round(
                    todasLasEncuestas.reduce(
                      (sum, e) => sum + (e.preguntas?.length || 0),
                      0
                    ) / todasLasEncuestas.length
                  )
                : 0,
          },
        };

        todasLasEncuestas.forEach((encuesta) => {
          const categoria = encuesta.categoria || 'sin_categoria';
          estadisticasCalculadas.porCategoria[categoria] =
            (estadisticasCalculadas.porCategoria[categoria] || 0) + 1;
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
      inicializandoRef.current = true;
      setDatosInicializados(true);
      Promise.all([cargarEncuestas(true), cargarEstadisticas()]).finally(() => {
        inicializandoRef.current = false;
      });
    }
  }, [usuario, datosInicializados, cargarEncuestas, cargarEstadisticas]);

  useEffect(() => {
    if (datosInicializados && !inicializandoRef.current) {
      cargarEncuestas(true);
    }
  }, [filtros, datosInicializados, cargarEncuestas]);

  const validarFormulario = () => {
    const errores = {};
    if (!formulario.titulo?.trim()) {
      errores.titulo = 'El título es obligatorio';
    }
    if (!formulario.descripcion?.trim()) {
      errores.descripcion = 'La descripción es obligatoria';
    }
    if (
      !formulario.categoria ||
      !validCategories.map((c) => c.value).includes(formulario.categoria)
    ) {
      errores.categoria = 'Debe seleccionar una categoría válida';
    }
    if (!formulario.preguntas || formulario.preguntas.length === 0) {
      errores.preguntas = 'Debe agregar al menos una pregunta';
    } else {
      formulario.preguntas.forEach((pregunta, index) => {
        if (!pregunta.enunciado?.trim()) {
          errores[`pregunta_${index}`] =
            `La pregunta ${index + 1} no puede estar vacía`;
        }
      });
    }

    if (formulario.recomendacionesPorNivel && formulario.recomendacionesPorNivel.length > 0) {
      const rangos = formulario.recomendacionesPorNivel.map(n => ({
        min: n.rangoMin,
        max: n.rangoMax,
        nombre: n.nivel
      }));

      for (let i = 0; i < rangos.length; i++) {
        for (let j = i + 1; j < rangos.length; j++) {
          const r1 = rangos[i];
          const r2 = rangos[j];
          // Verificar si los rangos se superponen
          if (
            (r1.min >= r2.min && r1.min <= r2.max) ||
            (r1.max >= r2.min && r1.max <= r2.max) ||
            (r2.min >= r1.min && r2.min <= r1.max) ||
            (r2.max >= r1.min && r2.max <= r1.max)
          ) {
            errores.recomendaciones = 
              `Los rangos de "${r1.nombre}" y "${r2.nombre}" se superponen. Asegúrese de que los rangos no se traslapen.`;
            break;
          }
        }
        if (errores.recomendaciones) break;
      }

      // Validar que rangoMin < rangoMax
      formulario.recomendacionesPorNivel.forEach((nivel, index) => {
        if (nivel.rangoMin >= nivel.rangoMax) {
          errores[`nivel_${index}`] = 
            `En el nivel "${nivel.nivel}": el rango mínimo debe ser menor que el rango máximo`;
        }
      });
    }

    return errores;
  };

  const manejarCambioFiltro = (campo, valor) => {
    setFiltros((prev) => ({
      ...prev,
      [campo]: valor,
      pagina: 1,
    }));
  };

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

  const agregarPregunta = () => {
    const nuevaP = {
      enunciado: nuevaPregunta.texto.trim(),
      tipo: 'escala',
      opciones: ESCALA_OPCIONES,
      orden: formulario.preguntas.length + 1,
      obligatoria: true,
    };
    setFormulario((prev) => ({
      ...prev,
      preguntas: [...prev.preguntas, nuevaP],
    }));
    setNuevaPregunta({
      texto: '',
      orden: formulario.preguntas.length + 2,
    });
  };

  const eliminarPregunta = (index) => {
    setFormulario((prev) => ({
      ...prev,
      preguntas: prev.preguntas
        .filter((_, i) => i !== index)
        .map((p, i) => ({ ...p, orden: i + 1 })),
    }));
  };

  const editarPregunta = (index, nuevoTexto) => {
    setFormulario((prev) => ({
      ...prev,
      preguntas: prev.preguntas.map((p, i) =>
        i === index ? { ...p, enunciado: nuevoTexto } : p
      ),
    }));
  };

  // Funciones para gestionar niveles de recomendaciones
  const agregarNivel = () => {
    if (!nuevoNivel.rangoMin || !nuevoNivel.rangoMax || !nuevoNivel.nivel) {
      setInfoState({
        show: true,
        title: 'Campos incompletos',
        message: 'Debe completar al menos el rango mínimo, máximo y el nombre del nivel.',
        onClose: null,
      });
      return;
    }

    const recomendacionesLimpias = nuevoNivel.recomendaciones.filter(
      (r) => r.trim() !== ''
    );

    const nivelCompleto = {
      rangoMin: Number(nuevoNivel.rangoMin),
      rangoMax: Number(nuevoNivel.rangoMax),
      nivel: nuevoNivel.nivel.trim(),
      descripcion: nuevoNivel.descripcion.trim(),
      recomendaciones: recomendacionesLimpias,
      colorHexadecimal: nuevoNivel.colorHexadecimal,
    };

    setFormulario((prev) => ({
      ...prev,
      recomendacionesPorNivel: [...prev.recomendacionesPorNivel, nivelCompleto],
    }));

    // Obtener el color del siguiente nivel en la lista
    const siguienteIndice = (nivelesRiesgo.findIndex(n => n.value === nuevoNivel.nivel) + 1) % nivelesRiesgo.length;
    const siguienteNivel = nivelesRiesgo[siguienteIndice];
    
    setNuevoNivel({
      rangoMin: '',
      rangoMax: '',
      nivel: siguienteNivel.value,
      descripcion: '',
      recomendaciones: [''],
      colorHexadecimal: siguienteNivel.color,
    });
  };

  const eliminarNivel = (index) => {
    setFormulario((prev) => ({
      ...prev,
      recomendacionesPorNivel: prev.recomendacionesPorNivel.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const editarNivel = (index, campo, valor) => {
    setFormulario((prev) => ({
      ...prev,
      recomendacionesPorNivel: prev.recomendacionesPorNivel.map((n, i) =>
        i === index ? { ...n, [campo]: valor } : n
      ),
    }));
  };

  const agregarRecomendacionNuevoNivel = () => {
    setNuevoNivel((prev) => ({
      ...prev,
      recomendaciones: [...prev.recomendaciones, ''],
    }));
  };

  const eliminarRecomendacionNuevoNivel = (index) => {
    setNuevoNivel((prev) => ({
      ...prev,
      recomendaciones: prev.recomendaciones.filter((_, i) => i !== index),
    }));
  };

  const actualizarRecomendacionNuevoNivel = (index, valor) => {
    setNuevoNivel((prev) => ({
      ...prev,
      recomendaciones: prev.recomendaciones.map((r, i) =>
        i === index ? valor : r
      ),
    }));
  };

  const abrirModalCrear = () => {
    setModoModal('crear');
    setEncuestaEditando(null);
    setFormulario({
      titulo: '',
      descripcion: '',
      categoria: validCategories[0].value,
      activa: true,
      preguntas: [],
      recomendacionesPorNivel: [],
    });
    setErroresValidacion({});
    setNuevaPregunta({
      texto: '',
      orden: 1,
    });
    setNuevoNivel({
      rangoMin: '',
      rangoMax: '',
      nivel: 'bajo',
      descripcion: '',
      recomendaciones: [''],
      colorHexadecimal: '#4CAF50',
    });
    setMostrarModal(true);
  };

  const abrirModalEditar = (encuesta) => {
    console.log('📝 Abriendo modal de edición para encuesta:', encuesta);
    console.log('🎯 Niveles de recomendaciones:', encuesta.recomendacionesPorNivel);
    
    setModoModal('editar');
    setEncuestaEditando(encuesta);
    
    // Asegurar que recomendacionesPorNivel sea un array válido
    const nivelesExistentes = Array.isArray(encuesta.recomendacionesPorNivel) 
      ? encuesta.recomendacionesPorNivel 
      : [];
    
    console.log('✅ Niveles cargados en formulario:', nivelesExistentes);
    
    setFormulario({
      titulo: encuesta.titulo,
      descripcion: encuesta.descripcion,
      categoria: encuesta.categoria,
      activa: encuesta.activa,
      preguntas: encuesta.preguntas || [],
      recomendacionesPorNivel: nivelesExistentes,
    });
    setErroresValidacion({});
    setNuevaPregunta({
      texto: '',
      orden: (encuesta.preguntas?.length || 0) + 1,
    });
    setNuevoNivel({
      rangoMin: '',
      rangoMax: '',
      nivel: 'bajo',
      descripcion: '',
      recomendaciones: [''],
      colorHexadecimal: '#4CAF50',
    });
    setMostrarModal(true);
  };

  const guardarEncuesta = async () => {
    try {
      const errores = validarFormulario();
      if (Object.keys(errores).length > 0) {
        setErroresValidacion(errores);
        setInfoState({
          show: true,
          title: 'Errores en el formulario',
          message: 'Por favor corrija los errores antes de continuar.',
          onClose: null,
        });
        return;
      }
      setLoading(true);
      const token = localStorage.getItem('token');
      const preguntasLimpias = formulario.preguntas.map((p, idx) => ({
        enunciado: p.enunciado,
        tipo: 'escala',
        opciones: ESCALA_OPCIONES,
        orden: idx + 1,
        obligatoria: true,
      }));
      const datosLimpios = {
        titulo: formulario.titulo.trim(),
        descripcion: formulario.descripcion.trim(),
        categoria: formulario.categoria,
        activa: Boolean(formulario.activa),
        preguntas: preguntasLimpias,
        recomendacionesPorNivel: formulario.recomendacionesPorNivel || [],
      };
      
      console.log('💾 Guardando encuesta con los siguientes datos:', datosLimpios);
      console.log('📊 Niveles a guardar:', datosLimpios.recomendacionesPorNivel);
      console.log('📝 Cantidad de niveles:', datosLimpios.recomendacionesPorNivel?.length || 0);
      
      if (modoModal === 'crear') {
        const resultado = await crearEncuesta(datosLimpios, token);
        console.log('✅ Respuesta del servidor (crear):', resultado);
      } else if (modoModal === 'editar' && encuestaEditando) {
        const resultado = await actualizarEncuesta(encuestaEditando._id, datosLimpios, token);
        console.log('✅ Respuesta del servidor (actualizar):', resultado);
      }
      setMostrarModal(false);
      estadisticasCargadasRef.current = false;
      await Promise.all([cargarEncuestas(false), cargarEstadisticas()]);

      setInfoState({
        show: true,
        title: 'Encuesta guardada',
        message:
          modoModal === 'crear'
            ? 'Encuesta creada correctamente.'
            : 'Encuesta actualizada correctamente.',
        onClose: null,
      });
    } catch (error) {
      setError(error.message || 'Error al guardar la encuesta');
      setInfoState({
        show: true,
        title: 'Error',
        message: error.message || 'Error al guardar la encuesta.',
        onClose: null,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDesactivarEncuesta = async (encuestaId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    const res = await desactivarEncuesta(encuestaId, token);
    if (res.success) {
      await cargarEncuestas(false);
      estadisticasCargadasRef.current = false;
      await cargarEstadisticas();
      setInfoState({
        show: true,
        title: 'Encuesta desactivada',
        message: 'La encuesta se desactivó correctamente.',
        onClose: null,
      });
    } else {
      setError(res.mensaje || 'No se pudo desactivar la encuesta');
      setInfoState({
        show: true,
        title: 'Error',
        message: res.mensaje || 'No se pudo desactivar la encuesta.',
        onClose: null,
      });
    }
    setLoading(false);
  };

  const handleActivarEncuesta = async (encuestaId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setLoading(true);
    const res = await activarEncuesta(encuestaId, token);
    if (res.success) {
      await cargarEncuestas(false);
      estadisticasCargadasRef.current = false;
      await cargarEstadisticas();
      setInfoState({
        show: true,
        title: 'Encuesta activada',
        message: 'La encuesta se activó correctamente.',
        onClose: null,
      });
    } else {
      setError(res.mensaje || 'No se pudo activar la encuesta');
      setInfoState({
        show: true,
        title: 'Error',
        message: res.mensaje || 'No se pudo activar la encuesta.',
        onClose: null,
      });
    }
    setLoading(false);
  };

  // Ejecuta la eliminación real (llamada por el modal de confirmación)
  const ejecutarEliminarEncuesta = async (encuestaId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token no encontrado');

      const res = await eliminarEncuesta(encuestaId, token);
      if (res && res.success) {
        await cargarEncuestas(false);
        estadisticasCargadasRef.current = false;
        await cargarEstadisticas();
        setInfoState({
          show: true,
          title: 'Encuesta eliminada',
          message: 'La encuesta se eliminó correctamente.',
          onClose: null,
        });
      } else {
        const msg = (res && res.mensaje) || 'No se pudo eliminar la encuesta';
        setError(msg);
        setInfoState({
          show: true,
          title: 'Error',
          message: msg,
          onClose: null,
        });
      }
    } catch (err) {
      setError(err.message || 'Error eliminando encuesta');
      setInfoState({
        show: true,
        title: 'Error',
        message: err.message || 'Error eliminando encuesta.',
        onClose: null,
      });
    } finally {
      setLoading(false);
      setConfirmState((s) => ({ ...s, show: false, onConfirm: null }));
    }
  };

  const handleEliminarEncuesta = (encuestaId) => {
    setConfirmState({
      show: true,
      title: 'Eliminar encuesta',
      message:
        '¿Estás seguro de que deseas eliminar esta encuesta? Esta acción no se puede deshacer.',
      onConfirm: () => ejecutarEliminarEncuesta(encuestaId),
    });
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
              <h1>Gestión de Encuestas de Autoevaluación</h1>
              <p>Administra las encuestas de evaluación psicológica</p>
            </div>
          </div>
          <button className={styles.createButton} onClick={abrirModalCrear}>
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
                  {loadingEstadisticas
                    ? '...'
                    : estadisticas.porCategoria?.[value] || 0}
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
              <option key={value} value={value}>
                {label}
              </option>
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
                      {validCategories.find(
                        (c) => c.value === encuesta.categoria
                      )?.label || encuesta.categoria}
                    </span>
                    <span
                      className={`${styles.statusBadge} ${encuesta.activa ? styles.active : styles.inactive}`}
                    >
                      {encuesta.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className={styles.surveyContent}>
                    <h3 className={styles.surveyTitle}>{encuesta.titulo}</h3>
                    <p className={styles.surveyDescription}>
                      {encuesta.descripcion}
                    </p>
                    <div className={styles.surveyMeta}>
                      <div className={styles.surveyStats}>
                        <span>
                          {' '}
                          {encuesta.preguntas?.length || 0} preguntas
                        </span>
                        <span> {encuesta.totalRespuestas || 0} respuestas</span>
                        <span>
                          {' '}
                          {new Date(
                            encuesta.fechaCreacion
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.surveyActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => abrirModalEditar(encuesta)}
                      disabled={loading}
                    >
                      {loading ? 'Cargando...' : 'Editar'}
                    </button>
                    <button
                      className={`${styles.toggleButton} ${encuesta.activa ? styles.deactivate : styles.activate}`}
                      onClick={() =>
                        encuesta.activa
                          ? handleDesactivarEncuesta(encuesta._id)
                          : handleActivarEncuesta(encuesta._id)
                      }
                      disabled={loading}
                    >
                      {loading
                        ? encuesta.activa
                          ? 'Desactivando...'
                          : 'Activando...'
                        : encuesta.activa
                          ? 'Desactivar'
                          : 'Activar'}
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleEliminarEncuesta(encuesta._id)}
                      disabled={loading}
                    >
                      {loading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {paginacion.totalPaginas > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.paginationButton}
                  disabled={filtros.pagina <= 1 || loading}
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
                  disabled={
                    filtros.pagina >= paginacion.totalPaginas || loading
                  }
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

      {/* Modal principal de creación/edición */}
      {mostrarModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setMostrarModal(false)}
        >
          <div
            className={`${styles.modal} ${styles.modalSlideIn}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h2>
                {modoModal === 'crear'
                  ? 'Crear Nueva Encuesta'
                  : 'Editar Encuesta'}
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
                {/* Información básica */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>Información Básica</h3>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Título <span className={styles.required}>*</span>
                      </label>
                      <input
                        ref={tituloInputRef}
                        type="text"
                        className={`${styles.input} ${erroresValidacion.titulo ? styles.inputError : ''}`}
                        value={formulario.titulo}
                        onChange={(e) =>
                          manejarCambioFormulario('titulo', e.target.value)
                        }
                        placeholder="Título de la encuesta"
                      />
                      {erroresValidacion.titulo && (
                        <span className={styles.errorMessage}>
                          {erroresValidacion.titulo}
                        </span>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>
                        Categoría <span className={styles.required}>*</span>
                      </label>
                      <select
                        className={`${styles.select} ${erroresValidacion.categoria ? styles.inputError : ''}`}
                        value={formulario.categoria}
                        onChange={(e) =>
                          manejarCambioFormulario('categoria', e.target.value)
                        }
                      >
                        {validCategories.map(({ value, label }) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                      {erroresValidacion.categoria && (
                        <span className={styles.errorMessage}>
                          {erroresValidacion.categoria}
                        </span>
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
                      onChange={(e) =>
                        manejarCambioFormulario('descripcion', e.target.value)
                      }
                      placeholder="Descripción de la encuesta"
                    />
                    {erroresValidacion.descripcion && (
                      <span className={styles.errorMessage}>
                        {erroresValidacion.descripcion}
                      </span>
                    )}
                  </div>
                  <div className={styles.formGroup}>
                    <div className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        className={styles.checkbox}
                        checked={formulario.activa}
                        onChange={(e) =>
                          manejarCambioFormulario('activa', e.target.checked)
                        }
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
                      <span className={styles.errorMessage}>
                        {' '}
                        - {erroresValidacion.preguntas}
                      </span>
                    )}
                  </h3>
                  <div className={styles.questionsList}>
                    {formulario.preguntas.map((pregunta, index) => (
                      <div key={index} className={styles.questionCard}>
                        <div className={styles.questionHeader}>
                          <span className={styles.questionNumber}>
                            Pregunta {index + 1}
                          </span>
                          <button
                            type="button"
                            className={styles.deleteQuestionButton}
                            onClick={() => eliminarPregunta(index)}
                          >
                            🗑️
                          </button>
                        </div>
                        <div className={styles.questionContent}>
                          <input
                            type="text"
                            className={`${styles.input} ${erroresValidacion[`pregunta_${index}`] ? styles.inputError : ''}`}
                            value={pregunta.enunciado}
                            onChange={(e) =>
                              editarPregunta(index, e.target.value)
                            }
                            placeholder="Editar enunciado de la pregunta"
                          />
                          {erroresValidacion[`pregunta_${index}`] && (
                            <span className={styles.errorMessage}>
                              {erroresValidacion[`pregunta_${index}`]}
                            </span>
                          )}
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
                  <h3 className={styles.sectionTitle}>
                    Agregar Nueva Pregunta
                  </h3>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>
                      Enunciado de la pregunta
                    </label>
                    <input
                      type="text"
                      className={styles.input}
                      value={nuevaPregunta.texto}
                      onChange={(e) =>
                        setNuevaPregunta((prev) => ({
                          ...prev,
                          texto: e.target.value,
                        }))
                      }
                      placeholder="Escriba el enunciado"
                    />
                  </div>
                  <button
                    type="button"
                    className={styles.addQuestionButton}
                    onClick={agregarPregunta}
                    disabled={!nuevaPregunta.texto.trim() || loading}
                  >
                    ➕ Agregar Pregunta
                  </button>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: '0.95em',
                      color: '#5a6c6d',
                    }}
                  >
                    Todas las preguntas serán tipo <b>escala</b> con opciones:{' '}
                    {ESCALA_OPCIONES.join(', ')}
                  </div>
                </div>

                {/* Recomendaciones Personalizadas por Nivel */}
                <div className={styles.formSection}>
                  <h3 className={styles.sectionTitle}>
                    Recomendaciones Personalizadas por Nivel de Riesgo (Opcional)
                  </h3>
                  <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '15px' }}>
                    Configure rangos de puntaje y recomendaciones específicas para cada nivel. 
                    Si no configura niveles, se usarán las recomendaciones por defecto del sistema.
                  </p>

                  {/* Niveles existentes */}
                  {formulario.recomendacionesPorNivel.length > 0 ? (
                    <div className={styles.nivelesExistentes}>
                      <div style={{ 
                        padding: '12px', 
                        backgroundColor: '#e8f5e9', 
                        borderRadius: '8px', 
                        marginBottom: '15px',
                        fontSize: '0.9em',
                        color: '#2e7d32'
                      }}>
                        ✅ Esta encuesta tiene <strong>{formulario.recomendacionesPorNivel.length}</strong> nivel(es) de recomendaciones configurado(s)
                      </div>
                      {formulario.recomendacionesPorNivel.map((nivel, index) => {
                        const nivelInfo = nivelesRiesgo.find(n => n.value === nivel.nivel);
                        return (
                        <div key={index} className={styles.nivelCard}>
                          <div className={styles.nivelHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div
                                style={{
                                  width: '25px',
                                  height: '25px',
                                  borderRadius: '4px',
                                  backgroundColor: nivel.colorHexadecimal,
                                  border: '1px solid #ddd',
                                }}
                              ></div>
                              <span className={styles.nivelNombre}>
                                {nivelInfo?.label || nivel.nivel}
                              </span>
                              <span className={styles.nivelRango}>
                                ({nivel.rangoMin} - {nivel.rangoMax} puntos)
                              </span>
                            </div>
                            <button
                              type="button"
                              className={styles.deleteQuestionButton}
                              onClick={() => eliminarNivel(index)}
                            >
                              🗑️
                            </button>
                          </div>
                          <div className={styles.nivelContent}>
                            {nivel.descripcion && (
                              <p style={{ fontSize: '0.9em', color: '#666', marginBottom: '8px' }}>
                                {nivel.descripcion}
                              </p>
                            )}
                            <div style={{ fontSize: '0.85em', color: '#888' }}>
                              <strong>Recomendaciones:</strong>
                              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                {nivel.recomendaciones.map((rec, idx) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '15px', 
                      backgroundColor: '#fff3cd', 
                      borderRadius: '8px', 
                      marginBottom: '15px',
                      fontSize: '0.9em',
                      color: '#856404',
                      border: '1px solid #ffeaa7'
                    }}>
                      ℹ️ No hay niveles de recomendaciones configurados. Esta encuesta usará las recomendaciones por defecto del sistema. 
                      Puedes agregar niveles personalizados a continuación.
                    </div>
                  )}

                  {/* Agregar nuevo nivel */}
                  <div className={styles.nuevoNivelForm}>
                    <h4 style={{ fontSize: '1em', marginBottom: '10px', color: '#333' }}>
                      Agregar Nuevo Nivel
                    </h4>
                    
                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Rango Mínimo (puntos)</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={nuevoNivel.rangoMin}
                          onChange={(e) =>
                            setNuevoNivel((prev) => ({
                              ...prev,
                              rangoMin: e.target.value,
                            }))
                          }
                          placeholder="Ej: 0"
                          min="0"
                        />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Rango Máximo (puntos)</label>
                        <input
                          type="number"
                          className={styles.input}
                          value={nuevoNivel.rangoMax}
                          onChange={(e) =>
                            setNuevoNivel((prev) => ({
                              ...prev,
                              rangoMax: e.target.value,
                            }))
                          }
                          placeholder="Ej: 20"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className={styles.formRow}>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Nivel de Riesgo</label>
                        <select
                          className={styles.select}
                          value={nuevoNivel.nivel}
                          onChange={(e) => {
                            const nivelSeleccionado = nivelesRiesgo.find(n => n.value === e.target.value);
                            setNuevoNivel((prev) => ({
                              ...prev,
                              nivel: e.target.value,
                              colorHexadecimal: nivelSeleccionado?.color || prev.colorHexadecimal,
                            }));
                          }}
                        >
                          {nivelesRiesgo.map((nivel) => (
                            <option key={nivel.value} value={nivel.value}>
                              {nivel.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Color (auto-asignado)</label>
                        <input
                          type="color"
                          className={styles.colorInput}
                          value={nuevoNivel.colorHexadecimal}
                          onChange={(e) =>
                            setNuevoNivel((prev) => ({
                              ...prev,
                              colorHexadecimal: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Descripción del Nivel (opcional)</label>
                      <textarea
                        className={styles.textarea}
                        value={nuevoNivel.descripcion}
                        onChange={(e) =>
                          setNuevoNivel((prev) => ({
                            ...prev,
                            descripcion: e.target.value,
                          }))
                        }
                        placeholder="Breve descripción del nivel de riesgo"
                        maxLength={200}
                        rows={3}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.label}>Recomendaciones</label>
                      {nuevoNivel.recomendaciones.map((rec, index) => (
                        <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                          <textarea
                            className={styles.textarea}
                            value={rec}
                            onChange={(e) =>
                              actualizarRecomendacionNuevoNivel(index, e.target.value)
                            }
                            placeholder={`Escriba la recomendación ${index + 1}...`}
                            maxLength={500}
                            rows={4}
                            style={{ flex: 1, minHeight: '100px' }}
                          />
                          {nuevoNivel.recomendaciones.length > 1 && (
                            <button
                              type="button"
                              className={styles.deleteQuestionButton}
                              onClick={() => eliminarRecomendacionNuevoNivel(index)}
                              style={{ flexShrink: 0, height: 'fit-content' }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className={styles.addQuestionButton}
                        onClick={agregarRecomendacionNuevoNivel}
                        style={{ marginTop: '8px', fontSize: '0.9em' }}
                      >
                        ➕ Agregar otra recomendación
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.saveButton}
                      onClick={agregarNivel}
                      style={{ marginTop: '10px', width: '100%' }}
                    >
                      ✅ Agregar Nivel
                    </button>
                  </div>
                </div>
              </form>
            </div>
            <div className={styles.modalActions}>
              <button
                className={styles.cancelButton}
                onClick={() => setMostrarModal(false)}
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                className={styles.saveButton}
                onClick={guardarEncuesta}
                disabled={Object.keys(erroresValidacion).length > 0 || loading}
              >
                {loading
                  ? 'Guardando...'
                  : modoModal === 'crear'
                    ? 'Crear Encuesta'
                    : 'Actualizar Encuesta'}
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

export default SurveysManagement;
