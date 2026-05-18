/**
 * ItemAtribuicao — linha de um precificador na ListaAtribuicoes (T044 / US3).
 *
 * Estrutura:
 *   ┌─────────────────────────────────────────────────────────────┐
 *   │ [icon] Nome do precificador          [Editar] [Remover]     │
 *   │        email@cliente.com                                    │
 *   │        [chip cat 1] [chip cat 2  +N precificadores] ...     │
 *   └─────────────────────────────────────────────────────────────┘
 *
 * Categorias renderizadas como `.tag .tag--medium .tag--ghost --gray`
 * (DS). Sobreposição (FR-008) via ChipSobreposicao logo após o chip.
 *
 * Os handlers de Editar/Remover são fornecidos pelo pai (US4/US5).
 */

import type { Atribuicao, Categoria, Usuario } from '../types';

export type ItemAtribuicaoProps = {
  atribuicao: Atribuicao;
  usuario: Usuario;
  categoriasPorId: Map<Categoria['id'], Categoria>;
  onEditar: (id: Atribuicao['id']) => void;
  onRemover: (id: Atribuicao['id']) => void;
};

export default function ItemAtribuicao({
  atribuicao,
  usuario,
  categoriasPorId,
  onEditar,
  onRemover,
}: ItemAtribuicaoProps) {
  return (
    <article className="atribuicao-row">
      <div className="atribuicao-row__main">
        <div className="atribuicao-row__header">
          <div className="atribuicao-row__identidade">
            <span className="atribuicao-row__nome">{usuario.nome}</span>
            <span className="atribuicao-row__email">{usuario.email}</span>
          </div>
          <div className="atribuicao-row__acoes">
            <button
              type="button"
              className="btn btn--link btn--small"
              onClick={() => onEditar(atribuicao.id)}
            >
              <span className="material-icons-outlined" aria-hidden="true">edit</span>
              Editar
            </button>
            <button
              type="button"
              className="btn btn--link btn--small"
              onClick={() => onRemover(atribuicao.id)}
              aria-label={`Remover atribuição de ${usuario.nome}`}
            >
              <span className="material-icons-outlined" aria-hidden="true">delete</span>
              Remover
            </button>
          </div>
        </div>

        <div className="atribuicao-row__chips">
          {atribuicao.categoriaIds.map((catId) => {
            const cat = categoriasPorId.get(catId);
            if (cat === undefined) return null;
            const breadcrumb = cat.caminho.slice(0, -1).join(' › ');
            return (
              <span
                key={catId}
                className="tag tag--medium tag--ghost tag--gray"
                title={breadcrumb !== '' ? `${breadcrumb} › ${cat.nome}` : cat.nome}
                style={{ fontWeight: 'var(--font-weight-regular)' }}
              >
                {cat.nome}
              </span>
            );
          })}
        </div>
      </div>
    </article>
  );
}
