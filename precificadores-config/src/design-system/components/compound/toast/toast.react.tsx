/**
 * Toast — InfoPrice DS
 *
 * Notificacao flutuante com auto-dismiss. Container fixo no body via portal.
 * Padrao publish/subscribe via hook `useToast` e provider `ToastContainer`.
 *
 * 4 variantes semanticas: info | success | warning | error
 * 2 temas: long (default — title + body + action) | short (so body)
 *
 * Markup canonico: design-system/components/compound/toast/toast.html
 *
 * Uso:
 *
 *   // 1) No root da app, monte o container:
 *   import { ToastContainer } from '@ds/toast.react';
 *   <App>
 *     <Pages />
 *     <ToastContainer />
 *   </App>
 *
 *   // 2) Em qualquer componente:
 *   import { toast } from '@ds/toast.react';
 *   toast.success({ title: 'Salvo', body: '15 produtos atualizados' });
 *   toast.error({ title: 'Falha', body: 'Tente novamente', action: { label: 'Repetir', onClick: retry } });
 */

import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';
export type ToastTheme = 'long' | 'short';

export type ToastInput = {
  title?: ReactNode;
  body: ReactNode;
  variant?: ToastVariant;
  theme?: ToastTheme;
  /** ms ate auto-dismiss. 0 = nao some sozinho. Default 5000. */
  duration?: number;
  /** Botao de acao opcional (so em theme=long). */
  action?: { label: string; onClick: () => void };
  /** Mostra o icone semantico. Default true. */
  icon?: boolean;
};

type ToastItem = ToastInput & { id: number };

// ─── Store global (publish/subscribe sem React Context) ───────────
const listeners = new Set<() => void>();
let toasts: ToastItem[] = [];
let nextId = 1;

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
};

const getSnapshot = () => toasts;
const getServerSnapshot = () => toasts;

const emit = () => listeners.forEach(fn => fn());

const dismiss = (id: number) => {
  toasts = toasts.filter(t => t.id !== id);
  emit();
};

const push = (input: ToastInput) => {
  const id = nextId++;
  const item: ToastItem = { variant: 'info', theme: 'long', icon: true, duration: 5000, ...input, id };
  toasts = [...toasts, item];
  emit();
  return id;
};

// ─── API publica ─────────────────────────────────────────────────
export const toast = {
  show: push,
  dismiss,
  info:    (input: Omit<ToastInput, 'variant'>) => push({ ...input, variant: 'info' }),
  success: (input: Omit<ToastInput, 'variant'>) => push({ ...input, variant: 'success' }),
  warning: (input: Omit<ToastInput, 'variant'>) => push({ ...input, variant: 'warning' }),
  error:   (input: Omit<ToastInput, 'variant'>) => push({ ...input, variant: 'error' }),
};

const ICON_BY_VARIANT: Record<ToastVariant, string> = {
  info: 'info',
  success: 'check_circle',
  warning: 'warning',
  error: 'error',
};

// ─── Componente individual ───────────────────────────────────────
function ToastView({ item }: { item: ToastItem }) {
  const { id, title, body, variant = 'info', theme = 'long', action, icon = true, duration = 5000 } = item;

  // Auto-dismiss
  useEffect(() => {
    if (!duration) return;
    const t = setTimeout(() => dismiss(id), duration);
    return () => clearTimeout(t);
  }, [id, duration]);

  return (
    <div className={clsx('toast', `toast--${variant}`, theme === 'short' && 'toast--short')} role="status">
      {icon && (
        <span className="material-icons-outlined toast__icon">{ICON_BY_VARIANT[variant]}</span>
      )}
      <div className="toast__content">
        {title && theme === 'long' && (
          <span className="toast__title">{title}</span>
        )}
        <span className="toast__body">{body}</span>
        {action && theme === 'long' && (
          <button type="button" className="toast__action" onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
      {theme === 'long' && (
        <button
          type="button"
          className="toast__close"
          aria-label="Fechar"
          onClick={() => dismiss(id)}
        >
          <span className="material-icons-outlined" style={{ fontSize: 18 }}>close</span>
        </button>
      )}
    </div>
  );
}

// ─── Container (montar 1x na raiz da app) ────────────────────────
export function ToastContainer() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [mounted, setMounted] = useState(false);

  // Garante que createPortal só roda client-side (evita SSR mismatch)
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="toast-container">
      {items.map(item => (
        <ToastView key={item.id} item={item} />
      ))}
    </div>,
    document.body
  );
}

export default ToastContainer;
