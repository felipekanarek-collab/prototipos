/**
 * TelaConfigPrecificadores — container principal da seção Precificadores.
 * Elaborado em US1 (T032). Em US2 ganhou modal de atribuição. Em US3
 * passa a renderizar a ListaAtribuicoes com busca dupla e sobreposição.
 *
 * Invariante (FR-015): enquanto `configuracao.nivelId === null`, nenhum
 * caminho de UI expõe ações de atribuição — só o CardNivelCategoria.
 */

import { useState } from 'react';
import { useConfigPrecificadores } from '../state/useConfigPrecificadores';
import { toast } from '../design-system/components/compound/toast/toast.react';
import CardNivelCategoria from './CardNivelCategoria';
import EmptyAtribuicoes from './EmptyAtribuicoes';
import ListaAtribuicoes from './ListaAtribuicoes';
import ModalAtribuicao, { type ModalAtribuicaoMode } from './ModalAtribuicao';
import ModalConfirmacaoRemocao from './ModalConfirmacaoRemocao';
import type { Atribuicao } from '../types';

export type TelaConfigPrecificadoresProps = {
  config: ReturnType<typeof useConfigPrecificadores>;
};

export default function TelaConfigPrecificadores({ config }: TelaConfigPrecificadoresProps) {
  const [modalMode, setModalMode] = useState<ModalAtribuicaoMode | null>(null);
  const [removendoId, setRemovendoId] = useState<Atribuicao['id'] | null>(null);

  const temNivel = config.configuracao.nivelId !== null;
  const temAtribuicoes = config.atribuicoes.length > 0;

  // Localiza atribuição para edição (US4).
  const abrirEdicao = (id: Atribuicao['id']) => {
    setModalMode({ tipo: 'editar', atribuicaoId: id });
  };

  // US5: pede confirmação antes de remover (FR-014).
  const abrirConfirmacaoRemocao = (id: Atribuicao['id']) => {
    setRemovendoId(id);
  };

  // Lookup auxiliar para o modal de confirmação.
  const atribuicaoEmRemocao = removendoId !== null
    ? config.atribuicoes.find((a) => a.id === removendoId) ?? null
    : null;
  const usuarioEmRemocao = atribuicaoEmRemocao !== null
    ? config.usuarios.find((u) => u.id === atribuicaoEmRemocao.usuarioId) ?? null
    : null;

  return (
    <>
      <div className="config-card">
        <div className="config-card__header">
          <span className="config-card__title">Precificadores</span>
          <span className="config-card__desc">
            Configure os precificadores e suas categorias. Esta configuração alimenta
            o filtro <strong>Precificador</strong> disponível em outras telas do IPA.
          </span>
        </div>
      </div>

      <CardNivelCategoria
        configuracao={config.configuracao}
        niveis={config.niveis}
        onCommit={async (nivelId) => {
          if (config.configuracao.nivelId === null) {
            await config.definirNivel(nivelId);
            toast.success({ body: 'Nível definido', theme: 'short' });
          } else {
            const qtd = config.atribuicoes.length;
            await config.trocarNivelComReset(nivelId);
            toast.success({
              body:
                qtd === 0
                  ? 'Nível trocado'
                  : `Nível trocado. ${qtd === 1 ? '1 atribuição zerada' : `${qtd} atribuições zeradas`}.`,
              theme: 'short',
            });
          }
        }}
      />

      {/* FR-015: ações de atribuição só após nível definido. */}
      {temNivel && !temAtribuicoes && (
        <EmptyAtribuicoes onNovaAtribuicao={() => setModalMode({ tipo: 'criar' })} />
      )}

      {temNivel && temAtribuicoes && (
        <ListaAtribuicoes
          atribuicoes={config.atribuicoes}
          usuarios={config.usuarios}
          categorias={config.categorias}
          onNovaAtribuicao={() => setModalMode({ tipo: 'criar' })}
          onEditar={abrirEdicao}
          onRemover={abrirConfirmacaoRemocao}
        />
      )}

      <ModalConfirmacaoRemocao
        isOpen={removendoId !== null}
        usuario={usuarioEmRemocao}
        totalCategorias={atribuicaoEmRemocao?.categoriaIds.length ?? 0}
        onClose={() => setRemovendoId(null)}
        onConfirmar={async () => {
          if (removendoId === null) return;
          await config.removerAtribuicao(removendoId);
          setRemovendoId(null);
          toast.success({ body: 'Atribuição removida', theme: 'short' });
        }}
      />

      {config.configuracao.nivelId !== null && (
        <ModalAtribuicao
          isOpen={modalMode !== null}
          mode={modalMode}
          usuarios={config.usuarios}
          categorias={config.categorias}
          nivelId={config.configuracao.nivelId}
          atribuicoes={config.atribuicoes}
          onClose={() => setModalMode(null)}
          onSalvar={async ({ usuarioId, categoriaIds }) => {
            const eraEdicao = config.atribuicoes.some((a) => a.usuarioId === usuarioId);
            await config.salvarAtribuicao({ usuarioId, categoriaIds });
            setModalMode(null);
            toast.success({
              body: eraEdicao ? 'Atribuição atualizada' : 'Atribuição criada',
              theme: 'short',
            });
          }}
        />
      )}

      {/* Aviso padrão do Administrativo IPA — modificações se propagam
          na próxima integração de dados (mantido por consistência visual
          com as outras seções de configuração do IPA). */}
      <div className="config-aviso">
        <div className="config-aviso__inner">
          <span className="material-icons config-aviso__icon" aria-hidden="true">
            warning
          </span>
          <div className="config-aviso__body">
            As modificações serão aplicadas na próxima integração de dados.
          </div>
        </div>
      </div>

      {/* Footer padrão de salvar/cancelar — padrão do IPA. No protótipo
          as mudanças já persistem instantaneamente (localStorage), então
          Salvar só dispara feedback de confirmação e Cancelar é informativo. */}
      <div className="config-footer">
        <button
          type="button"
          className="btn btn--primary btn--ghost btn--medium"
          onClick={() =>
            toast.info({
              body:
                'Cancelar não tem efeito no protótipo, alterações já estão salvas localmente.',
              theme: 'short',
            })
          }
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn--primary btn--medium"
          onClick={() =>
            toast.success({ body: 'Configurações salvas', theme: 'short' })
          }
        >
          Salvar
        </button>
      </div>
    </>
  );
}
