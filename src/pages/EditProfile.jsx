import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function EditarPerfil() {
  const [usuario, setUsuario] = useState(null);
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [bio, setBio] = useState('');
  const [pronombres, setPronombres] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

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
        setNombreCompleto(data.usuario.nombreCompleto || '');
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del usuario');
      }
    };

    fetchUsuario();
  }, [navigate]);

  useEffect(() => {
    if (mensaje || error) {
      const timer = setTimeout(() => {
        setMensaje('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [nombreCompleto, bio, pronombres, mensaje, error]);

  const validarNombre = (nombre) => {
    if (!nombre) return 'El nombre completo es obligatorio';
    const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
    if (!regex.test(nombre.trim()))
      return 'El nombre completo solo puede contener letras, espacios y acentos';
    if (nombre.trim().length < 2)
      return 'El nombre completo debe tener al menos 2 caracteres';
    if (nombre.trim().length > 100)
      return 'El nombre completo no puede superar los 100 caracteres';
    return null;
  };

  const handleGuardar = async () => {
    const errorValidacion = validarNombre(nombreCompleto);
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setError('');
    setMensaje('');
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
          body: JSON.stringify({ nombreCompleto }),
        }
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(
          data.detalles?.join?.(', ') || data.error || 'Error al actualizar'
        );
      setMensaje('Perfil actualizado correctamente');
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  if (!usuario)
    return <div className="text-center mt-5 pt-5">Cargando usuario...</div>;

  return (
    <div
      style={{
        paddingTop: '100px',
        paddingBottom: '50px',
        minHeight: '100vh',
        background: '#f0f2f5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '30px', // separa los cards
      }}
    >
      {/* Card de edición */}
      <div
        className="card p-4"
        style={{
          width: '550px',
          borderRadius: '24px',
          boxShadow: '0 14px 30px rgba(0,0,0,0.1)',
          background: '#fff',
        }}
      >
        <h3 className="text-center mb-4">Editar perfil</h3>

        {/* Botón de volver */}
        <div style={{ marginBottom: '10px', alignSelf: 'flex-start' }}>
          <span
            onClick={() => navigate('/perfil')}
            style={{
              cursor: 'pointer',
              color: '#555',
              fontSize: '0.9rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#22c55e')} // verde sutil
            onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
          >
            ← Volver a mi perfil
          </span>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        {/* Avatar dentro del card */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.5rem',
              color: '#888',
              cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              const overlay = e.currentTarget.querySelector('.avatar-overlay');
              if (overlay) overlay.style.opacity = 1;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              const overlay = e.currentTarget.querySelector('.avatar-overlay');
              if (overlay) overlay.style.opacity = 0;
            }}
          >
            {usuario.avatar ? (
              <img
                src={usuario.avatar}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              '👤'
            )}

            {/* Overlay del lápiz */}
            <div
              className="avatar-overlay"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.5rem',
                opacity: 0,
                transition: 'opacity 0.2s',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            >
              ✏️
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="mb-3">
          <label className="form-label fw-semibold">Nombre completo</label>
          <input
            type="text"
            className="form-control"
            value={nombreCompleto}
            onChange={(e) => setNombreCompleto(e.target.value)}
            style={{
              borderRadius: '14px',
              padding: '0.6rem 0.75rem',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
            }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Biografía</label>
          <textarea
            className="form-control"
            placeholder="Bio del usuario"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled
            style={{
              borderRadius: '14px',
              minHeight: '60px',
              padding: '0.5rem',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
            }}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Pronombres</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: él/ella/elle"
            value={pronombres}
            onChange={(e) => setPronombres(e.target.value)}
            disabled
            style={{
              borderRadius: '14px',
              padding: '0.6rem 0.75rem',
              boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.05)',
            }}
          />
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
      </div>

      {/* Card preview */}
      <div
        className="card p-3"
        style={{
          width: '550px',
          borderRadius: '24px',
          boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
          backgroundColor: '#fff',
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: '#ddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: '#888',
            }}
          >
            {usuario.avatar ? (
              <img
                src={usuario.avatar}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              '👤'
            )}
          </div>
          <div>
            <h5 className="mb-1">
              {nombreCompleto || usuario.nombreCompleto || 'Nombre de usuario'}
            </h5>
            <p className="mb-0 text-muted" style={{ fontSize: '0.85rem' }}>
              {pronombres || 'Pronombres'}
            </p>
          </div>
        </div>
        <p className="mt-3" style={{ fontSize: '0.9rem', color: '#333' }}>
          {bio || 'Biografía del usuario'}
        </p>
      </div>
    </div>
  );
}
