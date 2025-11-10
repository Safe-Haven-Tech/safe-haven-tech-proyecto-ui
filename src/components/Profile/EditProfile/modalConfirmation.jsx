import { createPortal } from 'react-dom';

const ModalConfirmacion = ({
  mostrar,
  titulo,
  mensaje,
  onConfirmar,
  onCancelar,
  backdrop = 'rgba(0,0,0,0.4)',
}) => {
  if (!mostrar) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: backdrop,
        pointerEvents: 'auto',
      }}
    >
      <div
        style={{
          width: 'min(640px, calc(100% - 2rem))',
          maxHeight: '90vh',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="modal-content"
          style={{
            width: '100%',
            borderRadius: 12,
            overflowY: 'auto',
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            background: '#fff',
            padding: '1rem 1.25rem',
            boxSizing: 'border-box',
          }}
        >
          <div
            className="modal-header"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 0,
              marginBottom: '0.5rem',
            }}
          >
            <h5 className="modal-title" style={{ margin: 0 }}>{titulo}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onCancelar}
              aria-label="Close"
              style={{ border: 'none', background: 'transparent' }}
            />
          </div>

          <div
            className="modal-body"
            style={{
              padding: '0.5rem 0 0.75rem 0',
              color: '#222',
              lineHeight: 1.45,
            }}
          >
            {typeof mensaje === 'string' ? (
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{mensaje}</p>
            ) : (
              mensaje
            )}
          </div>

          <div
            className="modal-footer"
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
              paddingTop: '0.5rem',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelar}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={onConfirmar}
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(content, document.body)
    : content;
};

export default ModalConfirmacion;