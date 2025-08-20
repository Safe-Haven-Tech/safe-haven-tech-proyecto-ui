import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

export default function ConfigurarPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [contraseña, setContraseña] = useState('');
  const [anonimo, setAnonimo] = useState(false);
  const [visibilidadPerfil, setVisibilidadPerfil] = useState('publico');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login', { replace: true });

    const fetchUsuario = async () => {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/usuarios/${decoded.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setUsuario(data.usuario);
        setAnonimo(data.usuario.anonimo);
        setVisibilidadPerfil(data.usuario.visibilidadPerfil || 'publico');
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del usuario');
      }
    };

    fetchUsuario();
  }, [navigate]);

  const validarContraseña = (pass) => {
    if (!pass) return 'La contraseña es obligatoria';
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
    if (!regex.test(pass))
      return 'Debe tener 8-128 caracteres, al menos una mayúscula, una minúscula y un número';
    return null;
  };

  const handleGuardar = async () => {
    setError('');
    setMensaje('');

    const errorValidacion = contraseña ? validarContraseña(contraseña) : null;
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setCargando(true);

    try {
      const token = localStorage.getItem('token');
      const decoded = JSON.parse(atob(token.split('.')[1]));
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuarios/${decoded.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...(contraseña && { contraseña }),
            anonimo,
            visibilidadPerfil,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.detalles?.join?.(', ') || data.error || 'Error al actualizar'
        );
      setMensaje('Configuración actualizada correctamente');
      setContraseña('');
      setTimeout(() => setMensaje(''), 4000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 4000);
    } finally {
      setCargando(false);
    }
  };

  if (!usuario)
    return <div className="text-center mt-5 pt-5">Cargando usuario...</div>;

  const handleDeleteAccount = async () => {
    setCargando(true);
    setDeleteError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/usuarios/delete`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ password: passwordConfirm }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al eliminar la cuenta');

      localStorage.removeItem('token');
      navigate('/');
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setCargando(false);
      setPasswordConfirm('');
    }
  };

  const handleCerrarSesion = () => {
    setCargando(true); // desactiva botones
    localStorage.removeItem('token');
    setMensaje('Sesión cerrada. Redirigiendo...');
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setPasswordConfirm('');
    setDeleteError('');
  };

  return (
    <div
      style={{
        paddingTop: '100px', // espacio para el navbar
        paddingBottom: '50px',
        minHeight: '100vh',
        background: '#f0f2f5',
        display: 'flex',
        justifyContent: 'center', // centra horizontalmente
        alignItems: 'flex-start', // empieza debajo del navbar
        width: '100%',
        paddingLeft: '15px', // margen lateral mínimo
        paddingRight: '15px',
      }}
    >
      <div
        className="card p-4"
        style={{
          width: '100%',
          maxWidth: '620px', // no excede 620px en pantallas grandes
          borderRadius: '24px',
          boxShadow: '0 14px 30px rgba(0,0,0,0.1)',
          background: '#fff',
        }}
      >
        <h3 className="text-center mb-4">Configurar perfil</h3>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        {/* Contraseña */}
        <div
          className="d-flex align-items-start gap-3 mb-3 p-3"
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '16px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#e9ecef')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = '#f8f9fa')
          }
        >
          <div style={{ fontSize: '1.8rem', color: '#22c55e' }}>🔒</div>
          <div className="flex-grow-1">
            <label className="form-label fw-semibold">Nueva contraseña</label>
            <input
              type="password"
              className="form-control"
              placeholder="Ingrese nueva contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              style={{
                borderRadius: '14px',
                padding: '0.5rem',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
              }}
            />
            <small className="text-muted d-block">
              La contraseña debe tener entre 8 y 128 caracteres, incluyendo al
              menos una mayúscula, una minúscula y un número.
            </small>
          </div>
        </div>

        {/* Anonimato */}
        <div
          className="d-flex align-items-start gap-3 mb-3 p-3"
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '16px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#e9ecef')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = '#f8f9fa')
          }
        >
          <div style={{ fontSize: '1.8rem', color: '#6c757d' }}>👤</div>
          <div className="flex-grow-1">
            <label className="form-label fw-semibold">Anonimato</label>
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                id="anonimoSwitch"
                checked={anonimo}
                onChange={() => setAnonimo(!anonimo)}
              />
              <label className="form-check-label" htmlFor="anonimoSwitch">
                Activar anonimato
              </label>
            </div>
            <small className="text-muted d-block">
              Activando esto, tu nombre y detalles personales no serán visibles
              públicamente en tu perfil.
            </small>
          </div>
        </div>

        {/* Visibilidad del perfil */}
        <div
          className="d-flex align-items-start gap-3 mb-4 p-3"
          style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '16px',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = '#e9ecef')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = '#f8f9fa')
          }
        >
          <div style={{ fontSize: '1.8rem', color: '#0d6efd' }}>👁️</div>
          <div className="flex-grow-1">
            <label className="form-label fw-semibold">
              Visibilidad del perfil
            </label>
            <select
              className="form-select"
              value={visibilidadPerfil}
              onChange={(e) => setVisibilidadPerfil(e.target.value)}
              style={{
                borderRadius: '14px',
                padding: '0.5rem',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
              }}
            >
              <option value="publico">Público</option>
              <option value="privado">Privado</option>
            </select>
            <small className="text-muted d-block">
              Selecciona "Público" para que todos puedan ver tu perfil, o
              "Privado" para limitar la visibilidad a tus seguidores aprobados.
            </small>
          </div>
        </div>

        <button
          className="btn btn-success w-100 py-2 fw-semibold"
          onClick={handleGuardar}
          disabled={cargando}
          style={{
            borderRadius: '14px',
            boxShadow: '0 6px 18px rgba(34,197,94,0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = 'scale(1.03)')
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>

        {/* Botón cerrar sesión */}
        <button
          className="btn btn-secondary w-100 mt-3 fw-semibold"
          onClick={handleCerrarSesion} // tu función para cerrar sesión
          style={{
            borderRadius: '14px',
            boxShadow: '0 6px 18px rgba(108,117,125,0.3)',
            transition:
              'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.backgroundColor = '#5a6268';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#6c757d';
          }}
        >
          Cerrar sesión
        </button>

        {/* Botón eliminar cuenta */}
        <button
          className="btn btn-danger w-100 mt-3 fw-semibold"
          onClick={() => setShowModal(true)} // abre modal para confirmar eliminación
          style={{
            borderRadius: '14px',
            boxShadow: '0 6px 18px rgba(220,53,69,0.3)',
            transition:
              'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.backgroundColor = '#c82333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.backgroundColor = '#dc3545';
          }}
        >
          Eliminar cuenta
        </button>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Eliminar cuenta</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p style={{ color: '#dc3545', fontWeight: '600' }}>
              ⚠️ Esta acción es <strong>permanente</strong>.
            </p>
            <p>
              Entendemos que esta decisión puede ser difícil. Al eliminar tu
              cuenta, toda tu información, publicaciones y conexiones se
              borrarán de manera irreversible. Si quieres tomarte un tiempo para
              pensarlo, puedes cancelar y volver más tarde.
            </p>
            <label>Ingresa tu contraseña para confirmar:</label>
            <input
              type="password"
              className="form-control"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              style={{ borderRadius: '14px', marginTop: '0.5rem' }}
            />
            {deleteError && (
              <div className="text-danger mt-2">{deleteError}</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Confirmar eliminación
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}
