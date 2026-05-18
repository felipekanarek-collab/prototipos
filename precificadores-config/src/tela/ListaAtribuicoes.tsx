/**
 * ListaAtribuicoes — lista de atribuições com busca dupla (T045 / US3).
 *
 * Renderiza N `ItemAtribuicao` agrupados num card. Busca local que casa
 * tanto o nome do precificador quanto o nome de qualquer categoria
 * atribuída a ele (FR-012). Empty state da busca quando termo não casa.
 */

import { useMemo, useState } from 'react';
import ItemAtribuicao from './ItemAtribuicao';
import type { Atribuicao, Categoria, Usuario } from '../types';
import { normalize } from '../util/normalize';

export type ListaAtribuicoesProps = {
  atribuicoes: Atribuicao[];
  usuarios: Usuario[];
  categorias: Categoria[];
  onNovaAtribuicao: () => void;
  onEditar: (id: Atribuicao['id']) => void;
  onRemover: (id: Atribuicao['id']) => void;
};

export default function ListaAtribuicoes({
  atribuicoes,
  usuarios,
  categorias,
  onNovaAtribuicao,
  onEditar,
  onRemover,
}: ListaAtribuicoesProps) {
  const [busca, setBusca] = useState<string>('');

  const usuariosPorId = useMemo<Map<Usuario['id'], Usuario>>(
    () => new Map(usuarios.map((u) => [u.id, u])),
    [usuarios],
  );
  const categoriasPorId = useMemo<Map<Categoria['id'], Categoria>>(
    () => new Map(categorias.map((c) => [c.id, c])),
    [categorias],
  );

  const atribuicoesEnriquecidas = useMemo(
    () =>
      atribuicoes
        .map((a) => {
          const u = usuariosPorId.get(a.usuarioId);
          if (u === undefined) return null;
          return { atribuicao: a, usuario: u };
        })
        .filter((x): x is { atribuicao: Atribuicao; usuario: Usuario } => x !== null),
    [atribuicoes, usuariosPorId],
  );

  // FR-012: busca dupla — nome do precificador OU nome de qualquer categoria.
  // Case + accent insensitive (normaliza com NFD).
  const filtradas = useMemo(() => {
    const termo = normalize(busca.trim());
    if (termo === '') return atribuicoesEnriquecidas;
    return atribuicoesEnriquecidas.filter(({ atribuicao, usuario }) => {
      if (normalize(usuario.nome).includes(termo)) return true;
      for (const catId of atribuicao.categoriaIds) {
        const cat = categoriasPorId.get(catId);
        if (cat !== undefined && normalize(cat.nome).includes(termo)) return true;
      }
      return false;
    });
  }, [atribuicoesEnriquecidas, categoriasPorId, busca]);

  return (
    <div className="config-card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
        }}
      >
        <div className="config-card__header">
          <span className="config-card__title">Atribuições</span>
          <span className="config-card__desc">
            Precificadores e suas categorias. Uma categoria pode ser compartilhada
            entre mais de um precificador.
          </span>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--medium"
          onClick={onNovaAtribuicao}
        >
          Nova atribuição
        </button>
      </div>

      <div className="searchbar" style={{ marginBottom: 'var(--space-3)' }}>
        <span className="material-icons searchbar__icon" aria-hidden="true">search</span>
        <input
          type="text"
          className="searchbar__input"
          placeholder="Buscar por precificador ou categoria…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar atribuição"
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

      {filtradas.length === 0 ? (
        <div
          style={{
            padding: 'var(--space-4)',
            textAlign: 'center',
            color: 'var(--color-gray-600)',
            fontSize: 14,
          }}
        >
          {busca === ''
            ? 'Nenhuma atribuição.'
            : (
              <>
                Nenhum precificador ou categoria encontrado para “{busca}”.{' '}
                <button
                  type="button"
                  className="btn btn--primary btn--link btn--small"
                  onClick={() => setBusca('')}
                  style={{ verticalAlign: 'baseline' }}
                >
                  Limpar busca
                </button>
              </>
            )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {filtradas.map(({ atribuicao, usuario }) => (
            <ItemAtribuicao
              key={atribuicao.id}
              atribuicao={atribuicao}
              usuario={usuario}
              categoriasPorId={categoriasPorId}
              onEditar={onEditar}
              onRemover={onRemover}
            />
          ))}
        </div>
      )}
    </div>
  );
}
