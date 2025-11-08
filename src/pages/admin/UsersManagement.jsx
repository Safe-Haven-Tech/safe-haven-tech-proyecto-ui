import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import * as usersService from '../../services/userServices';
import styles from './ResourcesManagement.module.css';
import placeholderAvatar from '../../assets/perfil_placeholder.png';

const ROLES = ['', 'usuario', 'profesional', 'administrador'];

const emptyForm = {
  nombreCompleto: '',
  username: '',
  email: '',
  rol: 'usuario',
  contraseña: '',
  bio: '',
  activo: true,
  fotoPerfilUrl: '',
};

const parseActivo = (val) => {
  if (val === '') return undefined;
  if (val === 'true' || val === true) return true;
  if (val === 'false' || val === false) return false;
  return undefined;
};

const getErrorMessage = (err) => {
  return (
    err?.response?.data?.message ||
    err?.message ||
    String(err || 'Error inesperado')
  );
};

const normalizeUser = (raw) => {
  if (!raw) return null;
  const u = raw.usuario || raw.user || raw.data || raw || {};
  return {
    _id: u._id || u.id || u.uid || '',
    username: u.username || u.nombreUsuario || u.user || '',
    nombreCompleto: u.nombreCompleto || u.fullName || u.name || '',
    email: u.email || u.correo || u.mail || '',
    rol: u.rol || u.role || 'usuario',
    bio: u.bio || u.biografia || u.descripcion || '',
    fotoPerfilUrl:
      u.fotoPerfilUrl || u.avatarUrl || u.fotoPerfil || u.foto || '',
    activo:
      u.activo !== undefined
        ? u.activo
        : u.active !== undefined
          ? u.active
          : true,
    estado: u.estado || u.state || '',
    ultimoLogin: u.ultimoLogin || u.lastLogin || u.updatedAt || null,
    fechaCreacion: u.createdAt || u.fechaCreacion || u.created_at || null,
    raw: u,
  };
};

const UsersManagement = () => {
  const { usuario, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [paginacion, setPaginacion] = useState({
    pagina: 1,
    limite: 10,
    total: 0,
    totalPaginas: 1,
  });
  const [filtros, setFiltros] = useState({ busqueda: '', rol: '', activo: '' });
  const [error, setError] = useState(null);

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    porRol: {
      usuario: 0,
      profesional: 0,
      administrador: 0,
    },
  });
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(true);

  const [mostrarModalForm, setMostrarModalForm] = useState(false);
  const [modo, setModo] = useState('crear');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const fotoInputRef = useRef(null);

  const [confirm, setConfirm] = useState({
    tipo: '',
    abierto: false,
    objetivoId: null,
    mensaje: '',
    displayMensaje: '',
  });

  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const requestIdRef = useRef(0);

  const filtrosKey = JSON.stringify(filtros);

  const loadUsers = useCallback(
    async (pagina = 1) => {
      if (!token || !usuario || usuario.rol !== 'administrador') return;
      const reqId = ++requestIdRef.current;
      try {
        setLoading(true);
        setError(null);
        const query = {
          pagina,
          limite: paginacion.limite,
          rol: filtros.rol || undefined,
          activo: parseActivo(filtros.activo),
          busqueda: filtros.busqueda || undefined,
        };
        const data = await usersService.getUsers(token, query);
        if (requestIdRef.current !== reqId) return;
        const rawList = data?.usuarios || data?.users || data?.data || [];
        const normalized = Array.isArray(rawList)
          ? rawList.map(normalizeUser).filter(Boolean)
          : [];
        setUsuarios(normalized);
        setPaginacion(
          data.paginacion || {
            pagina: pagina,
            limite: paginacion.limite,
            total: 0,
            totalPaginas: 1,
          }
        );
      } catch (err) {
        if (requestIdRef.current !== reqId) return;
        const msg = getErrorMessage(err);
        setError(msg);
        setToast({ tipo: 'error', texto: msg });
      } finally {
        if (requestIdRef.current === reqId) setLoading(false);
      }
    },
    [token, usuario, paginacion.limite, filtrosKey]
  );

  // Cargar usuarios inicial y cuando cambian filtros
  useEffect(() => {
    if (!usuario || usuario.rol !== 'administrador') return;
    loadUsers(1);
  }, [usuario, loadUsers]);

  useEffect(() => {
    if (!usuario || usuario.rol !== 'administrador') return;
    loadUsers(1);
  }, [filtrosKey, usuario]);

  // Función para calcular estadísticas desde datos existentes (fallback)
  const calcularEstadisticasManualmente = useCallback(() => {
    const totals = {
      usuario: 0,
      profesional: 0,
      administrador: 0,
    };
    for (const u of usuarios) {
      const r = (u && u.rol) || 'usuario';
      if (r === 'administrador') totals.administrador += 1;
      else if (r === 'profesional') totals.profesional += 1;
      else totals.usuario += 1;
    }
    const totalGeneral = paginacion.total || usuarios.length || 0; // paginacion.total es preferible si backend lo entrega
    setEstadisticas({ total: totalGeneral, porRol: totals });
    setLoadingEstadisticas(false);
  }, [usuarios, paginacion.total]);

  // Intentar cargar estadísticas desde servicio; si falla, usar cálculo manual
  const cargarEstadisticas = useCallback(async () => {
    if (!token || !usuario || usuario.rol !== 'administrador') return;
    setLoadingEstadisticas(true);
    try {
      // Intento usar un endpoint de estadísticas si existe
      if (typeof usersService.getUserStats === 'function') {
        const res = await usersService.getUserStats(token);
        // Se espera: { total, porRol: { usuario, profesional, administrador } }
        if (res) {
          const total =
            res.total ?? res.totalUsers ?? paginacion.total ?? usuarios.length;
          const porRol = {
            usuario: (res.porRol && res.porRol.usuario) ?? res.usuario ?? 0,
            profesional:
              (res.porRol && res.porRol.profesional) ?? res.profesional ?? 0,
            administrador:
              (res.porRol && res.porRol.administrador) ??
              res.administrador ??
              0,
          };
          setEstadisticas({ total, porRol });
          setLoadingEstadisticas(false);
          return;
        }
      }
      // Fallback: cálculo local (puede reflejar solo la página actual si backend no provee totales)
      calcularEstadisticasManualmente();
    } catch (err) {
      // En caso de error, usar fallback y mostrar aviso leve
      calcularEstadisticasManualmente();
      // no bloquear UI con error de estadisticas
    }
  }, [
    token,
    usuario,
    usuarios,
    calcularEstadisticasManualmente,
    paginacion.total,
  ]);

  // Cargar estadísticas al montar y cuando cambien usuarios/paginación
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const handlePageChange = (n) => {
    loadUsers(n);
  };

  const handleInputChange = (campo, valor) =>
    setFiltros((prev) => ({ ...prev, [campo]: valor }));

  const clearFileInput = () => {
    try {
      if (fotoInputRef.current) fotoInputRef.current.value = '';
    } catch (e) {}
  };

  const openCrear = () => {
    setModo('crear');
    setForm({ ...emptyForm });
    setEditingId(null);
    clearFileInput();
    setMostrarModalForm(true);
  };

  const openEditar = async (id) => {
    const reqId = ++requestIdRef.current;
    try {
      setLoading(true);
      const dato = await usersService.getUserById(token, id);
      if (requestIdRef.current !== reqId) return;
      const u = normalizeUser(dato);
      if (!u) throw new Error('Usuario no encontrado');
      setForm({
        nombreCompleto: u.nombreCompleto,
        username: u.username,
        email: u.email,
        rol: u.rol,
        contraseña: '',
        bio: u.bio,
        activo: u.activo,
        fotoPerfilUrl: u.fotoPerfilUrl,
      });
      setEditingId(id);
      setModo('editar');
      clearFileInput();
      setMostrarModalForm(true);
    } catch (e) {
      const msg = getErrorMessage(e);
      setToast({ tipo: 'error', texto: msg || 'No se pudo cargar usuario' });
    } finally {
      if (requestIdRef.current === reqId) setLoading(false);
    }
  };

  const openVer = async (id) => {
    const reqId = ++requestIdRef.current;
    setModo('ver');
    setForm({ ...emptyForm });
    setEditingId(id);
    clearFileInput();
    setMostrarModalForm(true);
    try {
      setLoading(true);
      const dato = await usersService.getUserById(token, id);
      if (requestIdRef.current !== reqId) return;
      const u = normalizeUser(dato);
      if (!u) {
        const msg = 'Usuario no encontrado';
        setToast({ tipo: 'error', texto: msg });
        return;
      }
      setForm({
        nombreCompleto: u.nombreCompleto,
        username: u.username,
        email: u.email,
        rol: u.rol,
        contraseña: '',
        bio: u.bio,
        activo: u.activo,
        fotoPerfilUrl: u.fotoPerfilUrl,
      });
    } catch (e) {
      const msg = getErrorMessage(e);
      setToast({ tipo: 'error', texto: msg || 'No se pudo cargar usuario' });
    } finally {
      if (requestIdRef.current === reqId) setLoading(false);
    }
  };

  const closeModal = () => {
    setMostrarModalForm(false);
    setForm({ ...emptyForm });
    setEditingId(null);
    setModo('crear');
    clearFileInput();
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let payload;
      const hasFile =
        fotoInputRef.current &&
        fotoInputRef.current.files &&
        fotoInputRef.current.files.length > 0;
      if (hasFile) {
        payload = new FormData();
        payload.append('nombreCompleto', form.nombreCompleto);
        payload.append('username', form.username);
        payload.append('email', form.email);
        payload.append('rol', form.rol);
        if (form.contraseña) payload.append('password', form.contraseña);
        payload.append('bio', form.bio || '');
        payload.append('activo', String(Boolean(form.activo)));
        payload.append('fotoPerfil', fotoInputRef.current.files[0]);
      } else {
        payload = {
          nombreCompleto: form.nombreCompleto,
          username: form.username,
          email: form.email,
          rol: form.rol,
          password: form.contraseña || undefined,
          bio: form.bio || '',
          activo: Boolean(form.activo),
          fotoPerfilUrl: form.fotoPerfilUrl || undefined,
        };
        if (!payload.password) delete payload.password;
        if (!payload.fotoPerfilUrl) delete payload.fotoPerfilUrl;
      }

      if (modo === 'crear') {
        await usersService.createUser(token, payload);
        setToast({ tipo: 'success', texto: 'Usuario creado' });
      } else if (modo === 'editar' && editingId) {
        await usersService.updateUser(token, editingId, payload);
        setToast({ tipo: 'success', texto: 'Usuario actualizado' });
      }
      closeModal();
      loadUsers(paginacion.pagina || 1);
      // refrescar estadísticas
      cargarEstadisticas();
    } catch (err) {
      const msg = getErrorMessage(err);
      setToast({ tipo: 'error', texto: msg || 'Error al guardar' });
    } finally {
      setLoading(false);
    }
  };

  const abrirConfirm = (tipo, id, displayMensaje = '') => {
    setConfirm({
      tipo,
      abierto: true,
      objetivoId: id,
      mensaje: '',
      displayMensaje,
    });
  };
  const cerrarConfirm = () =>
    setConfirm({
      tipo: '',
      abierto: false,
      objetivoId: null,
      mensaje: '',
      displayMensaje: '',
    });

  const ejecutarConfirm = async () => {
    const { tipo, objetivoId, mensaje } = confirm;
    try {
      setLoading(true);
      if (tipo === 'eliminar') {
        await usersService.deleteUser(token, objetivoId);
        setToast({ tipo: 'success', texto: 'Usuario eliminado' });
      } else if (tipo === 'desactivar') {
        await usersService.deactivateUser(
          token,
          objetivoId,
          mensaje || 'Desactivado por admin'
        );
        setToast({ tipo: 'success', texto: 'Usuario desactivado' });
      } else if (tipo === 'activar') {
        await usersService.activateUser(token, objetivoId);
        setToast({ tipo: 'success', texto: 'Usuario activado' });
      } else if (tipo === 'suspender') {
        await usersService.changeUserState(
          token,
          objetivoId,
          'suspendido',
          mensaje || ''
        );
        setToast({ tipo: 'success', texto: 'Usuario suspendido' });
      }
      cerrarConfirm();
      loadUsers(paginacion.pagina || 1);
      cargarEstadisticas();
    } catch (err) {
      const msg = getErrorMessage(err);
      setToast({ tipo: 'error', texto: msg || 'Error en la acción' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : '-');

  if (!usuario || usuario.rol !== 'administrador') {
    return (
      <div className={styles.container}>
        <p>No autorizado</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.headerTitle}>
              <h1>Gestión de usuarios</h1>
              <p>Listado y acciones administrativas</p>
            </div>
          </div>
          <div>
            <button className={styles.createButton} onClick={openCrear}>
              Crear usuario
            </button>
          </div>
        </div>
      </header>

      {/* Estadísticas */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.total}
              </div>
              <div className={styles.statLabel}>Total de usuarios</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.porRol.usuario}
              </div>
              <div className={styles.statLabel}>Usuarios</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.porRol.profesional}
              </div>
              <div className={styles.statLabel}>Profesionales</div>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statContent}>
              <div className={styles.statNumber}>
                {loadingEstadisticas ? '—' : estadisticas.porRol.administrador}
              </div>
              <div className={styles.statLabel}>Administradores</div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.filtersSection}>
        <div className={styles.filtersGrid} style={{ alignItems: 'center' }}>
          <div className={styles.searchBox} style={{ minWidth: 0 }}>
            <input
              className={styles.searchInput}
              placeholder="Buscar por nombre, usuario o email"
              value={filtros.busqueda}
              onChange={(e) => handleInputChange('busqueda', e.target.value)}
            />
          </div>

          <select
            value={filtros.rol}
            onChange={(e) => handleInputChange('rol', e.target.value)}
            className={styles.filterSelect}
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r || 'Rol'}
              </option>
            ))}
          </select>

          <select
            value={filtros.activo}
            onChange={(e) => handleInputChange('activo', e.target.value)}
            className={styles.filterSelect}
          >
            <option value="">Estado</option>
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>

          <div style={{ justifySelf: 'end' }}>
            <button
              className={styles.createButton}
              onClick={() => loadUsers(1)}
              style={{
                background: 'linear-gradient(135deg, #6c9b4f 0%, #7cb342 100%)',
              }}
            >
              Buscar
            </button>
          </div>
        </div>
      </section>

      <section className={styles.resourcesSection}>
        {loading ? (
          <p className={styles.loading}>Cargando...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : usuarios.length === 0 ? (
          <p className={styles.noResources}>No hay usuarios</p>
        ) : (
          <>
            <div className={styles.resourcesGrid}>
              {usuarios.map((u) => (
                <article key={u._id} className={styles.resourceCard}>
                  <div className={styles.resourceHeader}>
                    <span className={styles.resourceType}>{u.rol}</span>
                    {u.activo ? (
                      <span className={styles.featuredBadge}>Activo</span>
                    ) : (
                      <span
                        className={styles.featuredBadge}
                        style={{ background: '#f1f5f9', color: '#333' }}
                      >
                        {u.estado || 'Inactivo'}
                      </span>
                    )}
                  </div>

                  <div className={styles.resourceContent}>
                    <h3 className={styles.resourceTitle}>{u.username}</h3>
                    <p className={styles.resourceDescription}>
                      {u.nombreCompleto} — {u.email}
                    </p>
                  </div>

                  <div
                    className={styles.resourceMeta}
                    style={{ marginBottom: 14 }}
                  >
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                    >
                      <img
                        src={u.fotoPerfilUrl || placeholderAvatar}
                        alt=""
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 12,
                          objectFit: 'cover',
                        }}
                      />
                      <div style={{ fontWeight: 600, color: '#2e4d3a' }}>
                        Creado: {formatDate(u.fechaCreacion)}
                        <br />
                        Últ. login: {formatDate(u.ultimoLogin)}
                      </div>
                    </div>
                  </div>

                  <div
                    className={styles.resourceActions}
                    style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                  >
                    <button
                      onClick={() => openVer(u._id)}
                      className={styles.editButton}
                      title="Ver"
                      style={{ padding: '8px 12px' }}
                    >
                      Ver
                    </button>

                    <button
                      onClick={() => openEditar(u._id)}
                      className={styles.editButton}
                      title="Editar"
                      style={{ padding: '8px 12px' }}
                    >
                      Editar
                    </button>

                    {u.activo ? (
                      <button
                        onClick={() =>
                          abrirConfirm(
                            'desactivar',
                            u._id,
                            'Desactivar usuario?'
                          )
                        }
                        className={styles.featuredToggle}
                        title="Desactivar"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          abrirConfirm('activar', u._id, 'Activar usuario?')
                        }
                        className={styles.featuredToggle}
                        title="Activar"
                      >
                        Activar
                      </button>
                    )}

                    <button
                      onClick={() =>
                        abrirConfirm(
                          'eliminar',
                          u._id,
                          'Eliminar usuario? Esta acción es irreversible'
                        )
                      }
                      className={styles.deleteButton}
                      title="Eliminar"
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.pagination} style={{ marginTop: 20 }}>
              <button
                className={styles.paginationButton}
                disabled={paginacion.pagina <= 1}
                onClick={() => handlePageChange(paginacion.pagina - 1)}
              >
                Anterior
              </button>
              <div className={styles.paginationInfo}>
                Página {paginacion.pagina} de {paginacion.totalPaginas}
              </div>
              <button
                className={styles.paginationButton}
                disabled={paginacion.pagina >= paginacion.totalPaginas}
                onClick={() => handlePageChange(paginacion.pagina + 1)}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </section>

      {mostrarModalForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <h2>
                {modo === 'crear'
                  ? 'Crear usuario'
                  : modo === 'editar'
                    ? 'Editar usuario'
                    : 'Ver usuario'}
              </h2>
              <button className={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </header>

            <form className={styles.form} onSubmit={submitForm}>
              <div className={styles.formRow}>
                <label className={styles.label}>Nombre completo</label>
                <input
                  className={styles.input}
                  value={form.nombreCompleto}
                  onChange={(e) =>
                    setForm({ ...form, nombreCompleto: e.target.value })
                  }
                  required
                  disabled={modo === 'ver'}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Usuario (username)</label>
                <input
                  className={styles.input}
                  value={form.username}
                  onChange={(e) =>
                    setForm({ ...form, username: e.target.value })
                  }
                  required
                  disabled={modo === 'ver'}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  disabled={modo === 'ver'}
                />
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Rol</label>
                <select
                  className={styles.select}
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  disabled={modo === 'ver'}
                >
                  {ROLES.filter((r) => r).map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {modo !== 'ver' && (
                <>
                  <div className={styles.formRow}>
                    <label className={styles.label}>
                      Contraseña{' '}
                      {modo === 'crear'
                        ? '(requerida)'
                        : '(dejar en blanco para no cambiar)'}
                    </label>
                    <input
                      className={styles.input}
                      type="password"
                      value={form.contraseña}
                      onChange={(e) =>
                        setForm({ ...form, contraseña: e.target.value })
                      }
                      {...(modo === 'crear' ? { required: true } : {})}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <label className={styles.label}>
                      Foto de perfil (archivo)
                    </label>
                    <input type="file" accept="image/*" ref={fotoInputRef} />
                  </div>
                </>
              )}

              <div className={styles.formRow}>
                <label className={styles.label}>Bio</label>
                <textarea
                  className={styles.textarea}
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  disabled={modo === 'ver'}
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                {modo !== 'ver' && (
                  <button
                    type="submit"
                    className={styles.saveButton}
                    disabled={loading}
                  >
                    {modo === 'crear' ? 'Crear' : 'Guardar'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {confirm.abierto && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <header className={styles.modalHeader}>
              <h2>Confirmar acción</h2>
            </header>
            <div className={styles.modalContent} style={{ padding: 16 }}>
              <p>{confirm.displayMensaje || '¿Estás seguro?'}</p>
              {(confirm.tipo === 'desactivar' ||
                confirm.tipo === 'suspender') && (
                <textarea
                  className={styles.textarea}
                  placeholder="Motivo (opcional)"
                  value={confirm.mensaje}
                  onChange={(e) =>
                    setConfirm((c) => ({ ...c, mensaje: e.target.value }))
                  }
                />
              )}
            </div>
            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={cerrarConfirm}>
                Cancelar
              </button>
              <button className={styles.saveButton} onClick={ejecutarConfirm}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`${styles.toast} ${toast.tipo === 'error' ? styles.toastError : styles.toastSuccess}`}
        >
          {toast.texto}
        </div>
      )}
    </div>
  );
};

export default UsersManagement;
