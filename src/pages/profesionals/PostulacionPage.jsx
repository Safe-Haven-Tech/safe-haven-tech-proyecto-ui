import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import { createPostulacion } from '../../services/postulacionService';
import ChipsInput from '../../components/Postular/ChipsInput';
import HeroCard from '../../components/Postular/HeroCard';
import WelcomeCard from '../../components/Postular/WelcomeCard';
import Testimonials from '../../components/Postular/Testimonials';
import styles from './Postulacion.module.css';

function PreviewModal({ open, onClose, data = {}, onConfirm, loading }) {
  if (!open) return null;

  const experiencia = Number.isFinite(Number(data.experienciaAnios))
    ? data.experienciaAnios
    : '—';
  const titulos = Array.isArray(data.titulos)
    ? data.titulos
    : data.titulos
      ? String(data.titulos)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
  const especialidades = Array.isArray(data.especialidades)
    ? data.especialidades
    : data.especialidades
      ? String(data.especialidades)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h2>Previsualizar postulación</h2>

        <div className={styles.previewRow}>
          <strong>Nombre:</strong> {data.nombreCompleto}
        </div>
        <div className={styles.previewRow}>
          <strong>Correo:</strong> {data.correo}
        </div>
        <div className={styles.previewRow}>
          <strong>Teléfono:</strong> {data.telefono || '—'}
        </div>
        <div className={styles.previewRow}>
          <strong>Ciudad:</strong> {data.ciudad}
        </div>

        <div className={styles.previewRow}>
          <strong>Títulos:</strong>
          <div style={{ marginLeft: 8 }}>
            {titulos.length ? titulos.join(' • ') : '—'}
          </div>
        </div>

        <div className={styles.previewRow}>
          <strong>Especialidades:</strong>
          <div style={{ marginLeft: 8 }}>
            {especialidades.length ? especialidades.join(' • ') : '—'}
          </div>
        </div>

        <div className={styles.previewRow}>
          <strong>Registro:</strong> {data.registroProfesional || '—'}
        </div>
        <div className={styles.previewRow}>
          <strong>Institución:</strong> {data.institucionTitulo || '—'}
        </div>
        <div className={styles.previewRow}>
          <strong>Experiencia (años):</strong> {experiencia}
        </div>
        <div className={styles.previewRow}>
          <strong>Disponible:</strong> {data.disponible ? 'Sí' : 'No'}
        </div>

        <div className={styles.previewBox}>
          <strong>Carta de motivación</strong>
          <p>{data.cartaMotivacion}</p>
        </div>

        <div className={styles.modalActions}>
          <button
            className={styles.btnGhost}
            onClick={onClose}
            disabled={loading}
          >
            Volver
          </button>
          <button
            className={styles.btnPrimary}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Enviando…' : 'Confirmar y enviar'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostulacionPage() {
  const { token, usuario } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    getValues,
    reset,
  } = useForm({
    defaultValues: {
      nombreCompleto: usuario?.nombreCompleto || '',
      correo: usuario?.correo || usuario?.email || '',
      telefono: '',
      ciudad: '',
      titulos: [],
      especialidades: [],
      registroProfesional: '',
      institucionTitulo: '',
      cartaMotivacion: '',
      experienciaAnios: '',
      disponible: true,
    },
  });

  const watched = watch();

  const onSubmit = (data) => {
    setServerError(null);
    setPreviewData(data);
    setPreviewOpen(true);
  };

  const normalizeList = (value) => {
    if (!value) return [];
    if (Array.isArray(value))
      return value
        .map(String)
        .map((s) => s.trim())
        .filter(Boolean);
    return String(value)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const handleConfirmSend = async () => {
    const raw = previewData || getValues();
    const payload = {
      nombreCompleto: raw.nombreCompleto,
      correo: raw.correo,
      telefono: raw.telefono || '',
      ubicacion: { ciudad: raw.ciudad || '' },
      biografia: raw.biografia || '',
      infoProfesional: {
        titulos: normalizeList(raw.titulos),
        especialidades: normalizeList(raw.especialidades),
        registroProfesional: raw.registroProfesional || '',
        institucionTitulo: raw.institucionTitulo || '',
        añosExperiencia:
          raw.experienciaAnios === '' || raw.experienciaAnios === null
            ? null
            : Number(raw.experienciaAnios),
        disponible: Boolean(raw.disponible),
      },
      motivacion: raw.cartaMotivacion || '',
      experiencia: raw.experienciaAnios || '',
      especialidad: normalizeList(raw.especialidades).length
        ? normalizeList(raw.especialidades)[0]
        : '',
    };

    setSubmitting(true);
    setServerError(null);
    try {
      await createPostulacion(token, payload);
      setSuccessMsg(
        'Postulación enviada correctamente. Gracias por postularte.'
      );
      reset();
      setPreviewOpen(false);
    } catch (err) {
      setServerError(err.message || 'Error enviando la postulación');
    } finally {
      setSubmitting(false);
    }
  };

  const focusForm = () => {
    const el =
      document.getElementById('postulacion-form') ||
      document.querySelector('form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const firstInput = el.querySelector('input, textarea, select, button');
      if (firstInput) firstInput.focus();
    }
  };

  const openPreviewFromPanel = () => {
    const current = getValues();
    setPreviewData(current);
    setPreviewOpen(true);
  };

  return (
    <>
      <main className={styles.container}>
        <HeroCard onStart={focusForm} />
        <div className={styles.grid}>
          <div className={styles.formColumn}>
            <h2 className={styles.sectionTitle}>Formulario de postulación</h2>

            {successMsg && <div className={styles.success}>{successMsg}</div>}
            {serverError && (
              <div className={styles.error}>Error: {serverError}</div>
            )}

            <form
              id="postulacion-form"
              className={styles.form}
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              <div className={styles.row}>
                <label className={styles.label}>Nombre completo</label>
                <input
                  className={styles.input}
                  {...register('nombreCompleto', {
                    required: 'Ingrese su nombre completo',
                    minLength: { value: 3, message: 'Nombre demasiado corto' },
                  })}
                />
                {errors.nombreCompleto && (
                  <p className={styles.fieldError}>
                    {errors.nombreCompleto.message}
                  </p>
                )}
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Correo</label>
                <input
                  className={styles.input}
                  type="email"
                  {...register('correo', {
                    required: 'Ingrese su correo',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Correo inválido',
                    },
                  })}
                />
                {errors.correo && (
                  <p className={styles.fieldError}>{errors.correo.message}</p>
                )}
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Teléfono</label>
                <input
                  className={styles.input}
                  {...register('telefono', {
                    maxLength: {
                      value: 30,
                      message: 'Teléfono demasiado largo',
                    },
                  })}
                />
                {errors.telefono && (
                  <p className={styles.fieldError}>{errors.telefono.message}</p>
                )}
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Ciudad</label>
                <input
                  className={styles.input}
                  {...register('ciudad', { required: 'Ingrese la ciudad' })}
                />
                {errors.ciudad && (
                  <p className={styles.fieldError}>{errors.ciudad.message}</p>
                )}
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Títulos</label>
                <Controller
                  control={control}
                  name="titulos"
                  render={({ field }) => (
                    <ChipsInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Añade títulos y presiona Enter o Comma"
                    />
                  )}
                />
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Especialidades</label>
                <Controller
                  control={control}
                  name="especialidades"
                  rules={{
                    validate: (v) =>
                      (Array.isArray(v) && v.length > 0) ||
                      'Indique al menos una especialidad',
                  }}
                  render={({ field }) => (
                    <ChipsInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Añade especialidades y presiona Enter o Comma"
                    />
                  )}
                />
                {errors.especialidades && (
                  <p className={styles.fieldError}>
                    {errors.especialidades.message}
                  </p>
                )}
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Registro profesional</label>
                <input
                  className={styles.input}
                  {...register('registroProfesional')}
                  placeholder="Ej: PSI-12345"
                />
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Institución del título</label>
                <input
                  className={styles.input}
                  {...register('institucionTitulo')}
                  placeholder="Ej: Universidad de Chile"
                />
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Años de experiencia</label>
                <input
                  className={styles.input}
                  type="number"
                  min="0"
                  {...register('experienciaAnios', {
                    valueAsNumber: true,
                    validate: (value) =>
                      value === '' ||
                      value === undefined ||
                      (Number.isFinite(Number(value)) && Number(value) >= 0) ||
                      'Valor inválido',
                  })}
                />
                {errors.experienciaAnios && (
                  <p className={styles.fieldError}>
                    {errors.experienciaAnios.message}
                  </p>
                )}
              </div>

              <div className={styles.row}>
                <label className={styles.label}>
                  <input
                    type="checkbox"
                    {...register('disponible')}
                    defaultChecked
                  />{' '}
                  Disponible para atención
                </label>
              </div>

              <div className={styles.row}>
                <label className={styles.label}>Carta de motivación</label>
                <textarea
                  className={styles.textarea}
                  rows="6"
                  {...register('cartaMotivacion', {
                    required: 'Escribe una carta de motivación',
                    minLength: {
                      value: 20,
                      message: 'Escribe al menos 20 caracteres',
                    },
                  })}
                />
                {errors.cartaMotivacion && (
                  <p className={styles.fieldError}>
                    {errors.cartaMotivacion.message}
                  </p>
                )}
              </div>

              <div className={styles.actions}>
                <button
                  type="button"
                  className={styles.btnGhost}
                  onClick={() => {
                    setPreviewData(getValues());
                    setPreviewOpen(true);
                  }}
                >
                  Previsualizar
                </button>

                <button
                  type="submit"
                  className={styles.btnPrimary}
                  disabled={submitting}
                >
                  {submitting ? 'Enviando…' : 'Enviar postulación'}
                </button>
              </div>
            </form>
          </div>

          <div className={styles.summaryColumn}>
            <WelcomeCard onStart={focusForm} />

            <Testimonials />
          </div>
        </div>

        <PreviewModal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          data={previewData || {}}
          onConfirm={handleConfirmSend}
          loading={submitting}
        />
      </main>
    </>
  );
}
