/**
 * EtapaSelecionarUsuario — primeira etapa do fluxo de atribuição (T037 / US2).
 *
 * Lista os usuários do IPA (ativos), cada linha clicável. Quem já é
 * precificador (tem ao menos 1 atribuição) recebe badge `.badge--blue`
 * sinalizando "já é precificador" (FR-019). Selecionar um usuário avança
 * direto pra etapa 2 (sem botão "Próximo" — clique na linha é o gesto).
 *
 * Busca local: filtro por nome, e-mail ou cargo.
 */

import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { Atribuicao, Usuario } from '../types';
import { normalize } from '../util/normalize';

export type EtapaSelecionarUsuarioProps = {
  usuarios: Usuario[];
  atribuicoes: Atribuicao[];
  /** Usuário em destaque (se houver edição em curso). */
  selecionadoId?: Usuario['id'] | null;
  onSelecionar: (usuarioId: Usuario['id']) => void;
};

export default function EtapaSelecionarUsuario({
  usuarios,
  atribuicoes,
  selecionadoId = null,
  onSelecionar,
}: EtapaSelecionarUsuarioProps) {
  const [busca, setBusca] = useState<string>('');

  const usuariosComAtribuicao = useMemo<Set<Usuario['id']>>(
    () => new Set(atribuicoes.map((a) => a.usuarioId)),
    [atribuicoes],
  );

  const filtrados = useMemo(() => {
    const termo = normalize(busca.trim());
    const ativos = usuarios.filter((u) => u.ativo);
    if (termo === '') return ativos;
    return ativos.filter(
      (u) =>
        normalize(u.nome).includes(termo) ||
        normalize(u.email).includes(termo),
    );
  }, [usuarios, busca]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <span style={{ fontSize: 14, color: 'var(--color-gray-700)' }}>
        Escolha o usuário que será responsável por um conjunto de categorias.
        Usuários com o selo <strong>já é precificador</strong> já têm atribuição,
        selecioná-los abre o fluxo em modo de edição.
      </span>

      <div className="searchbar">
        <span className="material-icons searchbar__icon" aria-hidden="true">search</span>
        <input
          type="text"
          className="searchbar__input"
          placeholder="Buscar por nome ou e-mail…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          aria-label="Buscar usuário"
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
        aria-label="Usuários disponíveis"
        style={{
          height: 360,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-sm)',
          padding: 4,
        }}
      >
        {filtrados.length === 0 ? (
          <div style={{ padding: 16, color: 'var(--color-gray-600)', fontSize: 14 }}>
            Nenhum usuário encontrado.
          </div>
        ) : (
          filtrados.map((u) => {
            const jaEhPrecificador = usuariosComAtribuicao.has(u.id);
            const ativo = selecionadoId === u.id;
            return (
              <button
                key={u.id}
                type="button"
                role="option"
                aria-selected={ativo}
                onClick={() => onSelecionar(u.id)}
                className={clsx('usuario-item', { 'usuario-item--active': ativo })}
              >
                <div className="usuario-item__info">
                  <span className="usuario-item__nome">{u.nome}</span>
                  <span className="usuario-item__meta">{u.email}</span>
                </div>
                {jaEhPrecificador && (
                  <span className="badge badge--ghost badge--blue badge--medium">
                    já é precificador
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
