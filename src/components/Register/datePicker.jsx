import React, { useState, useEffect, useRef } from 'react';

/*
  ManualDateInput
  - Entrada de texto para fecha en formato dd/mm/yyyy (teclado).
  - Insertado automático de '/' mientras el usuario escribe.
  - Validación de fecha real y edad (minAge/maxAge).
  - Devuelve fecha en formato ISO (YYYY-MM-DD) a través de onChange.
  - Mensajes de error mostrados inline y via modal informativo (no alert()).
*/

const InfoModal = ({ show, title, message, onClose, okText = 'Aceptar' }) => {
  if (!show) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.25)',
        zIndex: 1300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '18px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          minWidth: 300,
          maxWidth: 560,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h5 style={{ marginTop: 0, marginBottom: 8, color: '#603c7e' }}>
          {title}
        </h5>
        <div
          style={{ marginBottom: 16, color: '#333', whiteSpace: 'pre-wrap' }}
        >
          {message}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: '#603c7e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {okText}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManualDateInput = ({
  value,
  onChange,
  placeholder = 'dd/mm/yyyy',
  minAge = 1,
  maxAge = 120,
  disabled = false,
  className = '',
  style = {},
}) => {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [infoModal, setInfoModal] = useState({
    show: false,
    title: '',
    message: '',
  });
  const inputRef = useRef(null);

  useEffect(() => {
    // if parent passes ISO value, reflect it as dd/mm/yyyy
    if (value) {
      const d = parseISO(value);
      if (d) setText(formatDDMMYYYY(d));
    } else {
      setText('');
    }
  }, [value]);

  const onlyDigits = (s) => s.replace(/\D/g, '');

  const formatWithSlashes = (digits) => {
    // expect up to 8 digits (ddmmyyyy)
    const dd = digits.substring(0, 2);
    const mm = digits.substring(2, 4);
    const yyyy = digits.substring(4, 8);
    let out = dd;
    if (mm.length) out += '/' + mm;
    if (yyyy.length) out += '/' + yyyy;
    return out;
  };

  const parseFromDDMMYYYY = (str) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(str);
    if (!m) return null;
    const day = Number(m[1]);
    const month = Number(m[2]);
    const year = Number(m[3]);
    const d = new Date(year, month - 1, day);
    // verify components (to avoid 31/02 -> auto-corrected date)
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day
    )
      return null;
    return d;
  };

  const parseISO = (iso) => {
    if (!iso) return null;
    const parts = iso.split('-').map(Number);
    if (parts.length !== 3) return null;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (isNaN(d)) return null;
    return d;
  };

  const formatDDMMYYYY = (date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const calculateAgeFromDate = (date) => {
    if (!date || isNaN(date)) return null;
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const m = today.getMonth() - date.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
    return age;
  };

  const isAgeValid = (date) => {
    const age = calculateAgeFromDate(date);
    if (age === null) return false;
    return age >= minAge && age <= maxAge;
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    // allow user to delete; keep only digits then format
    const digits = onlyDigits(raw).slice(0, 8);
    const formatted = formatWithSlashes(digits);
    setText(formatted);
    setError('');
  };

  const handleBlur = () => {
    if (!text) {
      setError('');
      onChange?.('');
      return;
    }
    const date = parseFromDDMMYYYY(text);
    if (!date) {
      setError('Formato inválido. Usa dd/mm/yyyy.');
      setInfoModal({
        show: true,
        title: 'Fecha inválida',
        message:
          'La fecha ingresada no es válida. Usa el formato dd/mm/yyyy (ej. 25/12/1990).',
      });
      onChange?.('');
      return;
    }
    if (!isAgeValid(date)) {
      setError(`La edad debe estar entre ${minAge} y ${maxAge} años.`);
      setInfoModal({
        show: true,
        title: 'Edad inválida',
        message: `La edad resultante (${calculateAgeFromDate(date)} años) debe estar entre ${minAge} y ${maxAge} años.`,
      });
      onChange?.('');
      return;
    }
    // valid -> emit ISO
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setError('');
    onChange?.(iso);
    // normalize display (in case user typed 1/1/90 etc)
    setText(formatDDMMYYYY(date));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const handlePaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    // try to normalize common formats like dd-mm-yyyy or yyyy-mm-dd
    const normalized = paste.replace(/-/g, '/').trim();
    const digits = onlyDigits(normalized);
    if (digits.length === 8) {
      const formatted = formatWithSlashes(digits);
      setText(formatted);
      e.preventDefault();
    } else if (/^\d{4}\/\d{2}\/\d{2}$/.test(normalized)) {
      // YYYY/MM/DD -> convert to DD/MM/YYYY
      const parts = normalized.split('/');
      const reform = `${parts[2]}/${parts[1]}/${parts[0]}`;
      setText(reform);
      e.preventDefault();
    }
  };

  return (
    <div className={className} style={{ width: '100%', ...style }}>
      <label className="form-label visually-hidden" htmlFor="manual-dob">
        Fecha de nacimiento
      </label>
      <input
        id="manual-dob"
        ref={inputRef}
        type="text"
        inputMode="numeric"
        pattern="\d{2}\/\d{2}\/\d{4}"
        placeholder={placeholder}
        value={text}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? 'manual-dob-error' : undefined}
        className={`form-control ${error ? 'is-invalid' : ''}`}
        style={{ borderRadius: 8, padding: '10px 12px' }}
      />
      {error && (
        <div id="manual-dob-error" className="invalid-feedback" role="alert">
          {error}
        </div>
      )}

      <div
        style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}
      >
        <small className="text-muted">Formato: dd/mm/yyyy</small>
        {value && (
          <small className="text-muted ms-auto">
            {(() => {
              const d = parseISO(value);
              const age = calculateAgeFromDate(d);
              return d ? `${d.toLocaleDateString('es-ES')} • ${age} años` : '';
            })()}
          </small>
        )}
      </div>

      <InfoModal
        show={infoModal.show}
        title={infoModal.title}
        message={infoModal.message}
        onClose={() => setInfoModal({ show: false, title: '', message: '' })}
      />
    </div>
  );
};

export default ManualDateInput;
