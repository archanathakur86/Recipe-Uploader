import React, { useEffect } from 'react';

export default function Toast({ open, message, actionText, onAction, onClose, timeout = 8000 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose && onClose(), timeout);
    return () => clearTimeout(t);
  }, [open, timeout, onClose]);

  if (!open) return null;

  return (
    <div style={{ position: 'fixed', right: 20, bottom: 20, background: '#111827', color: '#fff', padding: '12px 16px', borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.2)', zIndex: 9999 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>{message}</div>
        {actionText && <button onClick={onAction} style={{ background: 'transparent', color: '#60a5fa', border: 'none', cursor: 'pointer' }}>{actionText}</button>}
        <button onClick={onClose} style={{ marginLeft: 8, background: 'transparent', color: '#9ca3af', border: 'none' }}>✕</button>
      </div>
    </div>
  );
}
