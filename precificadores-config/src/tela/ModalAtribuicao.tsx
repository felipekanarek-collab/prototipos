/**
 * ModalAtribuicao — wrapper sobre Modal canônico que orquestra o fluxo
 * de criar/editar atribuição (T039 / US2).
 *
 * Sempre fluxo "usuário → categorias" (FR-009). Quando o usuário escolhido
 * já é precificador, abre etapa 2 com categorias pré-marcadas (FR-019);
 * salvar atualiza a atribuição existente em vez de duplicar.
 *
 * Descarte silencioso ao cancelar/fechar (FR-020).
 */

import { useEffect, useMemo, useState } from 'react';
import Modal from '../design-system/components/compound/modal/modal.react';
import EtapaSelecionarUsuario from './EtapaSelecionarUsuario';
import EtapaSelecionarCategorias from './EtapaSelecionarCategorias';
import type { Atribuicao, Categoria, NivelCategoria, Usuario } from '../types';

export type ModalAtribuicaoMode =
  | { tipo: 'criar' }
  | { tipo: 'editar'; atribuicaoId: Atribuicao['id'] };

export type ModalAtribuicaoProps = {
  isOpen: boolean;
  mode: ModalAtribuicaoMode | null;
  usuarios: Usuario[];
  categorias: Categoria[];
  nivelId: NivelCategoria['id'];
  atribuicoes: Atribuicao[];
  onClose: () => void;
  onSalvar: (input: {
    usuarioId: Usuario['id'];
    categoriaIds: Categoria['id'][];
  }) => Promise<void> | void;
};

type Etapa = 'usuario' | 'categorias';

export default function ModalAtribuicao({
  isOpen,
  mode,
  usuarios,
  categorias,
  nivelId,
  atribuicoes,
  onClose,
  onSalvar,
}: ModalAtribuicaoProps) {
  const [etapa, setEtapa] = useState<Etapa>('usuario');
  const [usuarioId, setUsuarioId] = useState<Usuario['id'] | null>(null);
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<Categoria['id'][]>([]);
  const [salvando, setSalvando] = useState<boolean>(false);

  // Quando o modal abre ou o modo muda, reset/popula o estado.
  useEffect(() => {
    if (!isOpen || mode === null) return;
    if (mode.tipo === 'editar') {
      const atr = atribuicoes.find((a) => a.id === mode.atribuicaoId);
      if (atr !== undefined) {
        setUsuarioId(atr.usuarioId);
        setCategoriasSelecionadas([...atr.categoriaIds]);
        setEtapa('categorias');
        return;
      }
    }
    // criar
    setUsuarioId(null);
    setCategoriasSelecionadas([]);
    setEtapa('usuario');
  }, [isOpen, mode, atribuicoes]);

  // Contagem de precificadores por categoria (FR-008).
  const contagemPorCategoria = useMemo<Record<Categoria['id'], number>>(() => {
    const mapa: Record<Categoria['id'], number> = {};
    for (const a of atribuicoes) {
      for (const cId of a.categoriaIds) {
        mapa[cId] = (mapa[cId] ?? 0) + 1;
      }
    }
    return mapa;
  }, [atribuicoes]);

  const usuarioSelecionado = usuarios.find((u) => u.id === usuarioId) ?? null;

  // Quando o usuário escolhido já é precificador, recupera categorias atuais
  // para pré-marcação (FR-019).
  const atribuicaoExistenteDoUsuario =
    usuarioId !== null ? atribuicoes.find((a) => a.usuarioId === usuarioId) ?? null : null;

  const handleSelecionarUsuario = (id: Usuario['id']) => {
    setUsuarioId(id);
    const existente = atribuicoes.find((a) => a.usuarioId === id);
    setCategoriasSelecionadas(existente !== undefined ? [...existente.categoriaIds] : []);
    setEtapa('categorias');
  };

  const handleVoltar = () => {
    setEtapa('usuario');
  };

  const handleSalvar = async () => {
    if (usuarioId === null || categoriasSelecionadas.length === 0) return;
    setSalvando(true);
    try {
      await onSalvar({ usuarioId, categoriaIds: categoriasSelecionadas });
    } finally {
      setSalvando(false);
    }
  };

  // FR-020: descarte silencioso ao fechar — nenhuma confirmação extra.
  const handleClose = () => {
    if (salvando) return;
    onClose();
  };

  const tituloModal =
    mode?.tipo === 'editar' && usuarioSelecionado !== null
      ? `Editar atribuição — ${usuarioSelecionado.nome}`
      : 'Nova atribuição';

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={tituloModal}
      size="large"
      className="modal--atribuicao"
      footer={
        etapa === 'usuario' ? (
          <button
            type="button"
            className="btn btn--primary btn--ghost btn--medium"
            onClick={handleClose}
            disabled={salvando}
          >
            Cancelar
          </button>
        ) : (
          <>
            {/* Em edição, esconder "Voltar" — o usuário está fixado. */}
            {mode?.tipo === 'criar' && (
              <button
                type="button"
                className="btn btn--primary btn--ghost btn--medium"
                onClick={handleVoltar}
                disabled={salvando}
                style={{ marginRight: 'auto' }}
              >
                ← Voltar
              </button>
            )}
            <button
              type="button"
              className="btn btn--primary btn--ghost btn--medium"
              onClick={handleClose}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn--primary btn--medium"
              onClick={() => { void handleSalvar(); }}
              disabled={categoriasSelecionadas.length === 0 || salvando}
            >
              {salvando ? 'Salvando…' : 'Salvar atribuição'}
            </button>
          </>
        )
      }
    >
      {etapa === 'usuario' && (
        <EtapaSelecionarUsuario
          usuarios={usuarios}
          atribuicoes={atribuicoes}
          selecionadoId={usuarioId}
          onSelecionar={handleSelecionarUsuario}
        />
      )}

      {etapa === 'categorias' && usuarioSelecionado !== null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {/* Cabeçalho: usuário fixado, com botão Trocar (só em modo criar) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 12px',
              border: '1px solid var(--color-gray-200)',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-gray-50)',
            }}
          >
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-gray-900)' }}>
                {usuarioSelecionado.nome}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>
                {usuarioSelecionado.email}
              </span>
            </div>
            {atribuicaoExistenteDoUsuario !== null && (
              <span className="badge badge--ghost badge--blue badge--medium">
                editando atribuição existente
              </span>
            )}
          </div>

          <EtapaSelecionarCategorias
            categorias={categorias}
            nivelId={nivelId}
            selecionadas={categoriasSelecionadas}
            contagemPorCategoria={contagemPorCategoria}
            categoriasAtuaisDoUsuario={atribuicaoExistenteDoUsuario?.categoriaIds ?? []}
            onChange={setCategoriasSelecionadas}
          />

          {categoriasSelecionadas.length === 0 && (
            <span style={{ fontSize: 12, color: 'var(--color-red-500)' }}>
              Selecione pelo menos 1 categoria para salvar.
            </span>
          )}
        </div>
      )}
    </Modal>
  );
}
