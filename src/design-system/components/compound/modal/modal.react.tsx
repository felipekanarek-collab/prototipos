/**
 * Modal — InfoPrice DS
 *
 * Janela modal com backdrop escurecido. Renderiza via createPortal no body
 * para evitar conflitos de z-index/overflow com containers ancestrais.
 *
 * Comportamento canonico do DS:
 * - Backdrop click fecha (mesma logica do prototipo HTML)
 * - ESC fecha
 * - Body scroll bloqueado enquanto aberto
 * - 3 tamanhos via prop `size`: small (400px) | medium (default 600px) | large (800px)
 *
 * Markup canonico: design-system/components/compound/modal/modal.html
 */

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

export type ModalSize = 'small' | 'medium' | 'large';

export type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  size?: ModalSize;
  /** Conteudo do .modal__body */
  children?: ReactNode;
  /** Botoes do .modal__footer. Quando omitido, footer nao e renderizado. */
  footer?: ReactNode;
  /** Esconde o botao X no header. Default false. */
  hideCloseButton?: boolean;
  /** Desabilita fechar via backdrop/ESC. Default false. */
  disableDismiss?: boolean;
  /** className extra opcional no .modal */
  className?: string;
};

export default function Modal({
  isOpen,
  onClose,
  title,
  size = 'medium',
  children,
  footer,
  hideCloseButton = false,
  disableDismiss = false,
  className,
}: ModalProps) {
  // ESC fecha
  useEffect(() => {
    if (!isOpen || disableDismiss) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, disableDismiss, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass =
    size === 'small' ? 'modal--small' :
    size === 'large' ? 'modal--large' : null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disableDismiss) return;
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div
      className="modal-backdrop is-open"
      role="presentation"
      onClick={handleBackdropClick}
    >
      <div
        className={clsx('modal', sizeClass, className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || !hideCloseButton) && (
          <div className="modal__header">
            {title && (
              <span className="modal__title" id="modal-title">{title}</span>
            )}
            {!hideCloseButton && (
              <button
                type="button"
                className="modal__close"
                aria-label="Fechar"
                onClick={onClose}
              >
                <span className="material-icons-outlined">close</span>
              </button>
            )}
          </div>
        )}
        {children !== undefined && (
          <div className="modal__body">{children}</div>
        )}
        {footer && (
          <div className="modal__footer">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
