/**
 * EtapaSelecionarCategorias — segunda etapa do fluxo de atribuição (T038 / US2).
 *
 * Lista inline com searchbar + checkboxes (mesmo padrão do EtapaSelecionarUsuario).
 * Evita o problema de dropdown clipado dentro do modal e dá consistência
 * visual com a etapa 1.
 *
 * Indica sobreposição (FR-008) via `ChipSobreposicao` ao lado de categorias
 * já atribuídas a outros precificadores. Categorias do usuário em edição
 * (se houver) sobem ao topo da lista pré-marcadas (FR-019).
 */

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import ChipSobreposicao from './ChipSobreposicao';
import type { Categoria, NivelCategoria } from '../types';
import { normalize } from '../util/normalize';

export type EtapaSelecionarCategoriasProps = {
  categorias: Categoria[];
  nivelId: NivelCategoria['id'];
  /** IDs já selecionadas (state controlado pelo modal pai). */
  selecionadas: Categoria['id'][];
  /** Mapa de contagem de precificadores por categoriaId (>=0). */
  contagemPorCategoria: Record<Categoria['id'], number>;
  /** Atribuição atual do usuário em edição (categoriaIds), pra computar self. */
  categoriasAtuaisDoUsuario: Categoria['id'][];
  onChange: (selecionadas: Categoria['id'][]) => void;
};

export default function EtapaSelecionarCategorias({
  categorias,
  nivelId,
  selecionadas,
  contagemPorCategoria,
  categoriasAtuaisDoUsuario,
  onChange,
}: EtapaSelecionarCategoriasProps) {
  const [busca, setBusca] = useState<string>('');

  const itens = useMemo(() => {
    const doNivel = categorias.filter((c) => c.nivelId === nivelId);
    const atuaisSet = new Set(categoriasAtuaisDoUsuario);

    // 1ª ordem: alfabético por nome
    const ordenadas = [...doNivel].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    // 2ª ordem: categorias atuais do usuário sobem ao topo
    ordenadas.sort((a, b) => Number(atuaisSet.has(b.id)) - Number(atuaisSet.has(a.id)));

    return ordenadas;
  }, [categorias, nivelId, categoriasAtuaisDoUsuario]);

  const filtrados = useMemo(() => {
    const termo = normalize(busca.trim());
    if (termo === '') return itens;
    return itens.filter((c) => {
      const alvo = normalize(`${c.nome} ${c.caminho.join(' ')}`);
      return alvo.includes(termo);
    });
  }, [itens, busca]);

  const selecionadasSet = useMemo(() => new Set(selecionadas), [selecionadas]);
  const atuaisSet = useMemo(() => new Set(categoriasAtuaisDoUsuario), [categoriasAtuaisDoUsuario]);

  const toggle = (id: Categoria['id']) => {
    if (selecionadasSet.has(id)) {
      onChange(selecionadas.filter((s) => s !== id));
    } else {
      onChange([...selecionadas, id]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <span style={{ fontSize: 14, color: 'var(--color-gray-700)' }}>
        Selecione uma ou mais categorias. Categorias com chip laranja já estão
        atribuídas a outros precificadores, sobreposição é permitida.
      </span>

      <div className="searchbar">
        <span className="material-icons searchbar__icon" aria-hidden="true">search</span>
        <input
          type="text"
          className="searchbar__input"
          placeholder="Buscar categoria…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar categoria"
        />
        {busca !== '' && (
          <button
            type="button"
            className="searchbar__clear"
            onClick={() => setBusca('')}
            aria-label="Limpar busca"
          >
            <span className="material-icons" aria-hidden="true">close</span>
          </button>
        )}
      </div>

      <div
        role="listbox"
        aria-label="Categorias disponíveis"
        aria-multiselectable="true"
        style={{
          height: 320,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-sm)',
          padding: 4,
        }}
      >
        {filtrados.length === 0 ? (
          <div style={{ padding: 16, color: 'var(--color-gray-600)', fontSize: 14 }}>
            Nenhuma categoria encontrada.
          </div>
        ) : (
          filtrados.map((cat) => {
            const total = contagemPorCategoria[cat.id] ?? 0;
            const usuarioJaTem = atuaisSet.has(cat.id);
            // Outros precificadores que têm essa categoria (excluindo o próprio).
            const outros = usuarioJaTem ? total - 1 : total;
            const checado = selecionadasSet.has(cat.id);
            const breadcrumb = cat.caminho.slice(0, -1).join(' › ');

            return (
              <label
                key={cat.id}
                className={clsx('categoria-item', { 'categoria-item--checked': checado })}
              >
                <span className="checkbox" style={{ pointerEvents: 'none' }}>
                  <input
                    type="checkbox"
                    className="checkbox__input"
                    checked={checado}
                    onChange={() => toggle(cat.id)}
                    aria-label={cat.nome}
                  />
                  <span className="checkbox__box" />
                </span>

                <div className="categoria-item__info">
                  <span className="categoria-item__nome">{cat.nome}</span>
                  {breadcrumb !== '' && (
                    <span className="categoria-item__breadcrumb">{breadcrumb}</span>
                  )}
                </div>

                {outros > 0 && <ChipSobreposicao count={outros + 1} />}
              </label>
            );
          })
        )}
      </div>

      <span style={{ fontSize: 12, color: 'var(--color-gray-600)' }}>
        {selecionadas.length === 0
          ? 'Nenhuma categoria selecionada'
          : selecionadas.length === 1
            ? '1 categoria selecionada'
            : `${selecionadas.length} categorias selecionadas`}
      </span>
    </div>
  );
}
