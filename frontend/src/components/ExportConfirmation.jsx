import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useToast } from './Toast';

export default function ExportConfirmation({ open, onClose, blobUrl, filename, onEmail }) {
  const [sending, setSending] = useState(false);
  const [recipient, setRecipient] = useState('');
  const toast = useToast();
  useEffect(() => {
    if (!open) {
      setRecipient('');
      setSending(false);
    }
  }, [open]);

  if (!open) return null;

  const handleDownload = () => {
    if (!blobUrl) return;
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || 'report.pdf';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // close modal after download so parent can revoke the object URL
    try { onClose && onClose(); } catch(e){}
  };

  const isValidEmail = (s) => {
    if (!s) return false;
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRe.test(String(s).trim());
  };

  const handleEmail = async () => {
    // If parent provided an onEmail handler, use it (preferred)
      if (onEmail) {
      if (!isValidEmail(recipient)) { toast.show('Please enter a valid email address.', { type: 'error' }); return; }
      setSending(true);
      try {
        await onEmail(recipient);
        toast.show('Report emailed (or queued) successfully.', { type: 'success' });
        // close after short delay so user sees toast
        setTimeout(() => { try { onClose && onClose(); } catch(e){} }, 900);
      } catch (err) {
        console.error('onEmail handler failed', err);
        const msg = (err && err.response && err.response.data && (err.response.data.message || err.response.data.error)) || (err && err.message) || 'Email failed';
        toast.show(msg, { type: 'error' });
      } finally {
        setSending(false);
      }
      return;
    }

    // fallback behaviour (server endpoint /reports/email expects { to, filename } or { email })
    let email = window.prompt('Send report to (email address):');
    if (!email) return;
    email = String(email).trim();
    if (!isValidEmail(email)) { toast.show('Please enter a valid email address.', { type: 'error' }); return; }

    setSending(true);
    try {
      await api.post('/reports/email', { to: email, filename });
  toast.show('Report queued for email delivery.', { type: 'success' });
      try { onClose && onClose(); } catch(e){}
    } catch (e) {
      console.error('Email report failed', e);
      const serverMsg = (e && e.response && e.response.data && (e.response.data.message || e.response.data.error)) || null;
      const fallbackMessage = serverMsg || 'Mail sender is not configured on the server';
          const openMail = window.confirm(fallbackMessage + '\n\nWould you like to open your mail client to compose a message (you will need to attach the downloaded PDF)?');
      if (openMail) {
        try {
          const subject = encodeURIComponent(filename || 'report.pdf');
          const body = encodeURIComponent('Please find the exported report attached. Download it from the application and attach it to this email.');
          window.location.href = `mailto:${encodeURIComponent(email)}?subject=${subject}&body=${body}`;
          const dl = window.confirm('Would you like to download the PDF now so you can attach it to the email?');
          if (dl) handleDownload();
          } catch (ex) {
          console.error('open mail failed', ex);
          toast.show('Unable to open mail client on this device. Please download the report and attach it manually.', { type: 'error' });
        }
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="export-confirmation-modal" style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
      <div className="card shadow" style={{ width: 460 }}>
        <div className="card-body text-center p-4">
          <h5 className="mb-3">Export Confirmation</h5>
          <div style={{ fontSize: 40, color: '#34A853' }}>✅</div>
          <p className="mb-3">Report exported successfully</p>
          <div className="mb-3">
            <div style={{ display: 'inline-block', padding: 10, borderRadius: 8, background: '#fff8f0', border: '1px solid #eee' }}>
              <img src="/assets/pdf-icon.png" alt="pdf" style={{ width: 36, height: 36 }} onError={(e)=>{e.target.style.display='none'}} />
            </div>
          </div>

          {onEmail ? (
            <div style={{ marginBottom: 12 }}>
              <div style={{ marginBottom: 6, fontSize: 13, color: '#333' }}>Send report to</div>
              <div className="d-flex" style={{ gap: 8, justifyContent: 'center' }}>
                <input className="form-control" placeholder="recipient@domain.com" value={recipient} onChange={e => setRecipient(e.target.value)} style={{ maxWidth: 300 }} />
                <button className="btn btn-outline-secondary" onClick={handleEmail} disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
              </div>
            </div>
          ) : null}

          <div className="d-flex justify-content-center gap-2">
            <button className="btn btn-primary" onClick={handleDownload}>Download</button>
            {!onEmail && <button className="btn btn-outline-secondary" onClick={handleEmail} disabled={sending}>{sending ? 'Sending…' : 'Email Report'}</button>}
          </div>
        </div>
        <button className="btn btn-sm btn-link position-absolute" style={{ right: 8, top: 8 }} onClick={onClose}>✕</button>

        {/* toasts are shown globally by ToastProvider */}
      </div>
    </div>
  );
}
