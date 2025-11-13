import React from 'react';
import './confirmModal.css';

export default function ConfirmModal({ open, title = 'Confirm', message = '', confirmText = 'Yes, delete', cancelText = 'Cancel', onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="cm-overlay" role="dialog" aria-modal="true">
      <div className="cm-box">
        <div className="cm-title">{title}</div>
        <div className="cm-message">{message}</div>
        <div className="cm-actions">
          <button className="cm-btn cm-cancel" onClick={onCancel}>{cancelText}</button>
          <button className="cm-btn cm-confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
