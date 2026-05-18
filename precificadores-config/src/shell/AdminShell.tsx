/**
 * AdminShell — esqueleto visual do Administrativo IPA.
 *
 * Estrutura fiel ao .ds-ref/prototipos/ipa/teste-handoff/configuracoes-outliers.html:
 *   <header.header>            (fixo, top 0, height 52)
 *   <aside.sidebar>            (fixo, left 0, height 100% - 52)
 *   <section.title-bar>        (fixo, top 60, left 52)
 *   <section.config-tabs>      (fixo, top 104, left 52) — "Produtos" + tabs
 *   <section.config-content>   (fixo, top 206, left 52, bottom 0, scroll)
 *     <div.config-layout>
 *       <aside.config-menu>    (seções do IPA — SubMenuConfiguracoes)
 *       <div.config-main>      (slot children)
 */

import type { ReactNode } from 'react';
import clsx from 'clsx';
import HeaderInfoPrice from './HeaderInfoPrice';
import SidebarPrincipal from './SidebarPrincipal';
import SubMenuConfiguracoes from './SubMenuConfiguracoes';

type ProductTab = {
  id: string;
  label: string;
  icon?: string;
  iconOutlined?: string;
  active?: boolean;
  locked?: boolean;
};

const PRODUCT_TABS: ProductTab[] = [
  { id: 'isa-infopanel',  label: 'ISA | Infopanel' },
  { id: 'isa-monit-pdv',  label: 'ISA | Monitoramento em PDV' },
  { id: 'ira-analytics',  label: 'IRA | Analytics', icon: 'lock', locked: true },
  { id: 'ipa-precif',     label: 'IPA | Software de Precificação', icon: 'settings', active: true },
  { id: 'paineis-custom', label: 'Painéis Customizados', icon: 'lock', locked: true },
];

export type AdminShellProps = {
  children: ReactNode;
  secaoAtiva?: string;
};

export default function AdminShell({
  children,
  secaoAtiva = 'precificadores',
}: AdminShellProps) {
  return (
    <>
      <HeaderInfoPrice />
      <SidebarPrincipal />

      <section className="title-bar">
        <div className="title-bar__left">
          <button className="config-back" type="button">
            <span className="material-icons" style={{ fontSize: 18 }} aria-hidden="true">
              arrow_back
            </span>
            <span>Voltar</span>
          </button>
        </div>
        <div className="title-bar__right" />
      </section>

      <section className="config-tabs">
        <div className="config-tabs__inner">
          <span className="config-tabs__title">Produtos</span>
          <div className="navbar" role="tablist">
            {PRODUCT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={tab.active ?? false}
                aria-disabled={tab.locked ?? false}
                className={clsx('navbar__item', {
                  'is-active': tab.active,
                  'is-locked': tab.locked,
                })}
              >
                {tab.icon !== undefined && (
                  <span className="material-icons" aria-hidden="true">{tab.icon}</span>
                )}
                {tab.iconOutlined !== undefined && (
                  <span className="material-icons" aria-hidden="true">{tab.iconOutlined}</span>
                )}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="config-content">
        <div className="config-layout">
          <SubMenuConfiguracoes ativo={secaoAtiva} />
          <div className="config-main">{children}</div>
        </div>
      </section>
    </>
  );
}
