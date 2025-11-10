import React, { useState, useRef, useEffect } from 'react';

const MAX_FILES = 6;
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024,
    sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const MessageInput = ({ onSend = async () => {} }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  // ephemeral message state
  const [esTemporal, setEsTemporal] = useState(false);
  const [expiraOpcion, setExpiraOpcion] = useState('24'); // horas

  // files: { file, previewUrl (optional), isImage }
  const [files, setFiles] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    // revoke object URLs on unmount
    return () => {
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
  }, [files]);

  const computeExpiraEn = () => {
    if (!esTemporal) return null;
    const horas = Number(expiraOpcion) || 24;
    return new Date(Date.now() + horas * 3600 * 1000).toISOString();
  };

  const handleFiles = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    const currentCount = files.length;
    const availableSlots = Math.max(0, MAX_FILES - currentCount);
    const toAdd = incoming.slice(0, availableSlots);

    const processed = toAdd
      .map((f) => {
        const isImage = f.type.startsWith('image/');
        const previewUrl = isImage ? URL.createObjectURL(f) : null;
        return { file: f, previewUrl, isImage };
      })
      .filter((item) => {
        if (!ALLOWED_TYPES.includes(item.file.type)) return false;
        if (item.file.size > MAX_FILE_SIZE) return false;
        return true;
      });

    setFiles((prev) => [...prev, ...processed]);

    if (fileRef.current) fileRef.current.value = '';
  };

  const removeFile = (index) => {
    setFiles((prev) => {
      const next = [...prev];
      const removed = next.splice(index, 1)[0];
      if (removed && removed.previewUrl)
        URL.revokeObjectURL(removed.previewUrl);
      return next;
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && files.length === 0) return;
    setSending(true);
    try {
      const expiraEn = computeExpiraEn();
      // pass raw File objects array to onSend
      await onSend(
        text.trim(),
        files.map((f) => f.file),
        esTemporal,
        expiraEn
      );
      setText('');
      setEsTemporal(false);
      setExpiraOpcion('24');
      // revoke previews and clear
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
      setFiles([]);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      console.error('Error en send:', err);
      // keep files so user can retry
      alert(err.message || 'Error al enviar el mensaje');
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="d-flex gap-2 align-items-end">
      <div className="flex-grow-1">
        <textarea
          className="form-control"
          rows="2"
          placeholder="Escribe un mensaje..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="d-flex align-items-center gap-2 mt-2">


        
          <div className="ms-auto small text-muted">
            {files.length}/{MAX_FILES} archivos
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-2 d-flex flex-wrap gap-2">
            {files.map((f, i) => (
              <div
                key={i}
                className="border rounded p-1 bg-white"
                style={{ width: 100 }}
              >
                {f.isImage ? (
                  <img
                    src={f.previewUrl}
                    alt={f.file.name}
                    style={{
                      width: '100%',
                      height: 60,
                      objectFit: 'cover',
                      borderRadius: 4,
                    }}
                  />
                ) : (
                  <div className="small text-truncate" style={{ height: 60 }}>
                    {f.file.name}
                  </div>
                )}
                <div className="d-flex justify-content-between align-items-center mt-1">
                  <small className="text-muted" style={{ fontSize: 11 }}>
                    {formatBytes(f.file.size)}
                  </small>
                  <button
                    type="button"
                    className="btn btn-sm btn-link p-0"
                    onClick={() => removeFile(i)}
                    aria-label={`Eliminar ${f.file.name}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="d-flex flex-column align-items-end">
        <input
          ref={fileRef}
          type="file"
          className="form-control form-control-sm mb-2"
          onChange={handleFiles}
          multiple
          accept={ALLOWED_TYPES.join(',')}
        />
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
