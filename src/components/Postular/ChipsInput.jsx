import React, { useState, useEffect, useRef } from 'react';
import styles from '../../pages/profesionals/Postulacion.module.css';

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++)
    if (String(a[i]) !== String(b[i])) return false;
  return true;
}

export default function ChipsInput({
  value = [],
  onChange = () => {},
  placeholder = '',
  max = 50,
  disabled = false,
}) {
  const [tags, setTags] = useState(Array.isArray(value) ? value.slice() : []);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    const incoming = Array.isArray(value) ? value.slice() : [];
    if (!arraysEqual(incoming, tags)) {
      setTags(incoming);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const flushOnChange = (next) => {
    Promise.resolve().then(() => {
      try {
        onChange(next);
      } catch (e) {}
    });
  };

  const addTag = (raw) => {
    const text = String(raw || '').trim();
    if (!text) return;
    const parts = text
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    if (!parts.length) return;

    setTags((prev) => {
      const next = [...prev];
      for (const p of parts) {
        if (next.length >= max) break;
        if (!next.includes(p)) next.push(p);
      }
      flushOnChange(next);
      if (process.env.NODE_ENV !== 'production')
        console.debug('ChipsInput added tags:', parts, '=>', next);
      return next;
    });

    setInput('');
    if (inputRef.current) inputRef.current.focus();
  };

  const removeAt = (index) => {
    setTags((prev) => {
      const next = prev.slice();
      next.splice(index, 1);
      flushOnChange(next);
      return next;
    });
    if (inputRef.current) inputRef.current.focus();
  };

  const onKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      e.stopPropagation();
      addTag(input);
      return;
    }
    if (e.key === 'Backspace' && input === '' && tags.length) {
      e.preventDefault();
      e.stopPropagation();
      removeAt(tags.length - 1);
      return;
    }
  };

  const onPaste = (e) => {
    if (disabled) return;
    const pasted = (e.clipboardData || window.clipboardData).getData('text');
    if (pasted) {
      e.preventDefault();
      addTag(pasted);
    }
  };

  const handleClick = (e) => {
    const btn = e.target.closest('button');
    if (btn && btn.classList && btn.classList.contains(styles.chipRemove))
      return;
    if (inputRef.current && !disabled) inputRef.current.focus();
  };

  return (
    <div className={styles.chipsRoot} aria-disabled={disabled}>
      <div className={styles.chipsList} onClick={handleClick}>
        {tags.map((t, i) => (
          <span key={`${t}-${i}`} className={styles.chip}>
            <span className={styles.chipText}>{t}</span>
            {!disabled && (
              <button
                type="button"
                aria-label={`Eliminar ${t}`}
                className={styles.chipRemove}
                onClick={() => removeAt(i)}
              >
                ×
              </button>
            )}
          </span>
        ))}

        <input
          ref={inputRef}
          type="text"
          className={styles.chipsInput}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          placeholder={placeholder}
          disabled={disabled || tags.length >= max}
          aria-label={placeholder || 'Añadir elemento'}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      <div className={styles.chipsHelp} aria-hidden>
        {tags.length}/{max}
      </div>
    </div>
  );
}
