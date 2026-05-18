/**
 * SubMenuConfiguracoes — menu lateral com as seções do Administrativo IPA.
 *
 * Markup conforme configuracoes-outliers.html (classes .config-menu /
 * .config-menu__item / .config-menu__label / chevron_right). "Precificadores"
 * entra entre "Níveis de Categoria" e "Lojas e Clusters" (research.md R-009).
 */

import clsx from 'clsx';

type Secao = {
  id: string;
  label: string;
};

const SECOES: Secao[] = [
  { id: 'configuracoes-basicas',  label: 'Configurações Básicas' },
  { id: 'dados-concorrencia',     label: 'Dados de concorrência' },
  { id: 'segmentacao-produtos',   label: 'Segmentação de Produtos' },
  { id: 'niveis-categoria',       label: 'Níveis de Categoria' },
  { id: 'precificadores',         label: 'Precificadores' }, // ⭐ FR-018
  { id: 'lojas-clusters',         label: 'Lojas e Clusters' },
  { id: 'canais-venda',           label: 'Canais de Venda' },
  { id: 'farma',                  label: 'Farma' },
  { id: 'campanhas-promocionais', label: 'Campanhas promocionais' },
];

export type SubMenuConfiguracoesProps = {
  ativo?: string;
};

export default function SubMenuConfiguracoes({
  ativo = 'precificadores',
}: SubMenuConfiguracoesProps) {
  return (
    <aside className="config-menu" aria-label="Categorias de configuração">
      {SECOES.map((secao) => (
        <button
          key={secao.id}
          type="button"
          className={clsx('config-menu__item', { 'is-active': secao.id === ativo })}
          aria-current={secao.id === ativo ? 'page' : undefined}
        >
          <span className="config-menu__label">{secao.label}</span>
          <span className="material-icons" aria-hidden="true">chevron_right</span>
        </button>
      ))}
    </aside>
  );
}
