/**
 * ModalConfirmacaoRemocao — confirmação explícita de remoção (T052 / US5 / FR-014).
 *
 * Modal pequeno com mensagem direta, botão "Remover" em destaque vermelho e
 * "Cancelar" ghost à esquerda. Confirmar dispara o callback do pai.
 */

import { useState } from 'react';
import Modal from '../design-system/components/compound/modal/modal.react';
import type { Usuario } from '../types';

export type ModalConfirmacaoRemocaoProps = {
  isOpen: boolean;
  usuario: Usuario | null;
  totalCategorias: number;
  onClose: () => void;
  onConfirmar: () => Promise<void> | void;
};

export default function ModalConfirmacaoRemocao({
  isOpen,
  usuario,
  totalCategorias,
  onClose,
  onConfirmar,
}: ModalConfirmacaoRemocaoProps) {
  const [removendo, setRemovendo] = useState<boolean>(false);

  const handleConfirmar = async () => {
    setRemovendo(true);
    try {
      await onConfirmar();
    } finally {
      setRemovendo(false);
    }
  };

  const handleClose = () => {
    if (removendo) return;
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Remover atribuição"
      size="small"
      footer={
        <>
          <button
            type="button"
            className="btn btn--primary btn--ghost btn--medium"
            onClick={handleClose}
            disabled={removendo}
            style={{ marginRight: 'auto' }}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--red btn--medium"
            onClick={() => { void handleConfirmar(); }}
            disabled={removendo}
          >
            {removendo ? 'Removendo…' : 'Remover'}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 14, lineHeight: '20px', color: 'var(--color-gray-800)' }}>
        Tem certeza que quer remover a atribuição de{' '}
        <strong>{usuario?.nome ?? '—'}</strong>?{' '}
        {totalCategorias > 0 && (
          <>
            Ele(a) deixará de ser responsável por{' '}
            <strong>
              {totalCategorias === 1 ? '1 categoria' : `${totalCategorias} categorias`}
            </strong>
            .
          </>
        )}
      </p>
      <p style={{ fontSize: 12, color: 'var(--color-gray-600)', marginTop: 8 }}>
        O usuário continuará cadastrado no IPA, só a atribuição é removida.
      </p>
    </Modal>
  );
}
