import {useEffect, useState} from 'react';
import {Check, Copy, ExternalLink, MessageCircle, X} from 'lucide-react';
import {buildWhatsappUrl} from '../data/peruData';

interface WhatsappModalProps {
  isOpen: boolean;
  recipientName: string;
  phone: string;
  initialMessage: string;
  subtitle?: string;
  onClose: () => void;
}

export function WhatsappModal({
  isOpen,
  recipientName,
  phone,
  initialMessage,
  subtitle,
  onClose,
}: WhatsappModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMessage(initialMessage);
      setCopied(false);
    }
  }, [initialMessage, isOpen]);

  if (!isOpen) return null;

  const formattedPhone = phone.startsWith('51')
    ? `+51 ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`
    : `+51 ${phone}`;
  const waUrl = buildWhatsappUrl(phone, message);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/50 backdrop-blur-xs p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="wa-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
          <div>
            <h2 id="wa-modal-title" className="text-lg font-bold text-slate-900">
              Contacto directo por WhatsApp
            </h2>
            <p className="text-sm text-slate-600 mt-0.5">
              {recipientName} · <span className="font-mono tabular-nums">{formattedPhone}</span>
              {subtitle ? ` · ${subtitle}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar ventana de WhatsApp"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-2 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label
              htmlFor="whatsapp-message-input"
              className="block text-sm font-medium text-slate-700 mb-2"
            >
              Mensaje prellenado (editable antes de enviar)
            </label>
            <textarea
              id="whatsapp-message-input"
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:border-[#0E6245] focus:outline-none focus:ring-2 focus:ring-[#0E6245]/20 leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E6245] hover:bg-[#0A4D36] text-white text-sm font-semibold px-5 py-2.5 transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              Abrir en WhatsApp (+51)
              <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-80" />
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="min-h-[46px] inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium px-4 py-2.5 transition-colors whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-[#0E6245]" />
                  Texto copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  Copiar texto
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
