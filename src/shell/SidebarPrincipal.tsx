/**
 * SidebarPrincipal — rail vertical à esquerda do IPA.
 * Markup conforme `.ds-ref/prototipos/ipa/teste-handoff/configuracoes-outliers.html`,
 * usando classes do DS (`.sidebar`, `.sidebar__item`, `.sidebar__icon`, etc.).
 * Ícones SVG copiados localmente em `/assets/*-symbol.svg`.
 *
 * "Gerenciador" é o módulo onde o Administrativo IPA (e portanto a seção
 * Precificadores) vive — portanto fica `--active` aqui.
 */

import clsx from 'clsx';

type SidebarItem = {
  id: string;
  label: string;
  iconSrc: string;
  active?: boolean;
  hasChevron?: boolean;
};

const ITEMS: SidebarItem[] = [
  { id: 'gerenciador',  label: 'Gerenciador',           iconSrc: 'assets/gerenciador-symbol.svg', active: true },
  { id: 'estrategia',   label: 'Estratégia',            iconSrc: 'assets/estrategia-symbol.svg' },
  { id: 'negociacoes',  label: 'Negociações Fornecedor', iconSrc: 'assets/negociacoes-symbol.svg', hasChevron: true },
  { id: 'extracao',     label: 'Extração de preços',    iconSrc: 'assets/extracao-symbol.svg' },
  { id: 'ia',           label: 'Precifique com IA',     iconSrc: 'assets/IA-symbol.svg' },
];

export default function SidebarPrincipal() {
  return (
    <aside className="sidebar" id="sidebar">
      <div className="sidebar__top">
        {ITEMS.map((item) => (
          <div
            key={item.id}
            className={clsx('sidebar__item', { 'sidebar__item--active': item.active })}
          >
            <img src={item.iconSrc} alt="" className="sidebar__icon" />
            <span className="sidebar__label">{item.label}</span>
            {item.hasChevron === true && (
              <span className="material-icons sidebar__item-chevron">
                keyboard_arrow_right
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="sidebar__bottom">
        <button className="sidebar__seta" id="sidebarSeta" aria-label="Expandir menu" type="button">
          <span className="material-icons">keyboard_arrow_right</span>
        </button>
      </div>
    </aside>
  );
}
