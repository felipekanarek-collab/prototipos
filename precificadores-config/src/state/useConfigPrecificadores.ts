/**
 * useConfigPrecificadores — hook agregador da Fase 1.
 *
 * Centraliza: carregamento de seeds, estado mutável (nível global + atribuições),
 * ações tipadas, sincronização com localStorage via APIs e storage.
 *
 * Reforço defensivo (FR-015 / Princípio Constitution): ações de atribuição
 * são bloqueadas pelo reducer quando state.nivelId === null. UI também não
 * deve expor o caminho, mas o reducer protege como rede de segurança.
 */

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import type {
  Atribuicao,
  Categoria,
  ConfiguracaoGlobal,
  NivelCategoria,
  Usuario,
} from '../types';
import { storage } from './storage';
import { seedLoader } from './seed-loader';
import { createUsuariosApi } from '../api/usuarios-api';
import { createNivelApi } from '../api/nivel-api';
import {
  createPrecificadoresApi,
  type SaveAtribuicaoInput,
} from '../api/precificadores-api';

// ─── State ────────────────────────────────────────────────────────────

export type ConfigPrecificadoresState = {
  loading: boolean;
  error: Error | null;

  // Read-only (snapshot do seed)
  usuarios: Usuario[];
  niveis: NivelCategoria[];
  categorias: Categoria[];

  // Mutável (vai pra storage)
  configuracao: ConfiguracaoGlobal;
  atribuicoes: Atribuicao[];
};

const INITIAL_STATE: ConfigPrecificadoresState = {
  loading: true,
  error: null,
  usuarios: [],
  niveis: [],
  categorias: [],
  configuracao: { schemaVersion: 1, nivelId: null, atualizadoEm: null },
  atribuicoes: [],
};

// ─── Actions ──────────────────────────────────────────────────────────

type Action =
  | { type: 'BOOT_OK'; payload: {
      usuarios: Usuario[];
      niveis: NivelCategoria[];
      categorias: Categoria[];
      configuracao: ConfiguracaoGlobal;
      atribuicoes: Atribuicao[];
    } }
  | { type: 'BOOT_ERROR'; payload: { error: Error } }
  | { type: 'NIVEL_DEFINIDO'; payload: { configuracao: ConfiguracaoGlobal } }
  | { type: 'NIVEL_TROCADO_COM_RESET'; payload: { configuracao: ConfiguracaoGlobal } }
  | { type: 'ATRIBUICAO_SALVA'; payload: { atribuicoes: Atribuicao[] } }
  | { type: 'ATRIBUICAO_REMOVIDA'; payload: { atribuicoes: Atribuicao[] } };

function reducer(
  state: ConfigPrecificadoresState,
  action: Action,
): ConfigPrecificadoresState {
  switch (action.type) {
    case 'BOOT_OK':
      return {
        ...state,
        loading: false,
        error: null,
        ...action.payload,
      };

    case 'BOOT_ERROR':
      return { ...state, loading: false, error: action.payload.error };

    case 'NIVEL_DEFINIDO':
      return { ...state, configuracao: action.payload.configuracao };

    case 'NIVEL_TROCADO_COM_RESET':
      return {
        ...state,
        configuracao: action.payload.configuracao,
        atribuicoes: [],
      };

    case 'ATRIBUICAO_SALVA':
    case 'ATRIBUICAO_REMOVIDA':
      // Reforço defensivo (FR-015): rejeitar se não há nível definido.
      if (state.configuracao.nivelId === null) {
        if (typeof window !== 'undefined' && window.console !== undefined) {
          console.warn(
            `[useConfigPrecificadores] Ação ${action.type} ignorada: nivelId === null. ` +
              'Defina o nível global antes de mexer em atribuições (FR-015).',
          );
        }
        return state;
      }
      return { ...state, atribuicoes: action.payload.atribuicoes };

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────

export type UseConfigPrecificadoresReturn = ConfigPrecificadoresState & {
  /** Define o nível global pela primeira vez (não reseta atribuições). */
  definirNivel: (nivelId: NivelCategoria['id']) => Promise<void>;
  /** Troca o nível global existente; reseta TODAS as atribuições (FR-016). */
  trocarNivelComReset: (nivelId: NivelCategoria['id']) => Promise<void>;
  /** Cria ou atualiza uma atribuição (FR-019). */
  salvarAtribuicao: (input: SaveAtribuicaoInput) => Promise<void>;
  /** Remove uma atribuição. */
  removerAtribuicao: (id: Atribuicao['id']) => Promise<void>;
  /** Recarrega tudo do storage (após dev toolbar). */
  recarregar: () => Promise<void>;
};

export function useConfigPrecificadores(): UseConfigPrecificadoresReturn {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const boot = useCallback(async () => {
    try {
      const { usuarios, niveis, categorias } = await seedLoader.loadReadOnly();
      await seedLoader.initializeIfNeeded();
      const configuracao = storage.getConfiguracao();
      const atribuicoes = storage.listAtribuicoes();
      dispatch({
        type: 'BOOT_OK',
        payload: { usuarios, niveis, categorias, configuracao, atribuicoes },
      });
    } catch (cause) {
      dispatch({
        type: 'BOOT_ERROR',
        payload: { error: cause instanceof Error ? cause : new Error(String(cause)) },
      });
    }
  }, []);

  useEffect(() => {
    void boot();
  }, [boot]);

  const apis = useMemo(
    () => ({
      usuarios: createUsuariosApi(state.usuarios),
      nivel: createNivelApi(state.niveis),
      precificadores: createPrecificadoresApi(),
    }),
    [state.usuarios, state.niveis],
  );

  const definirNivel = useCallback<UseConfigPrecificadoresReturn['definirNivel']>(
    async (nivelId) => {
      const configuracao = await apis.nivel.setNivelGlobal(nivelId, {
        resetAtribuicoes: false,
      });
      dispatch({ type: 'NIVEL_DEFINIDO', payload: { configuracao } });
    },
    [apis.nivel],
  );

  const trocarNivelComReset = useCallback<
    UseConfigPrecificadoresReturn['trocarNivelComReset']
  >(
    async (nivelId) => {
      const configuracao = await apis.nivel.setNivelGlobal(nivelId, {
        resetAtribuicoes: true,
      });
      dispatch({ type: 'NIVEL_TROCADO_COM_RESET', payload: { configuracao } });
    },
    [apis.nivel],
  );

  const salvarAtribuicao = useCallback<
    UseConfigPrecificadoresReturn['salvarAtribuicao']
  >(
    async (input) => {
      // Reforço defensivo: barrar no hook antes do storage também.
      if (state.configuracao.nivelId === null) {
        console.warn('salvarAtribuicao ignorada: nivelId === null (FR-015).');
        return;
      }
      await apis.precificadores.saveAtribuicao(input);
      dispatch({
        type: 'ATRIBUICAO_SALVA',
        payload: { atribuicoes: storage.listAtribuicoes() },
      });
    },
    [apis.precificadores, state.configuracao.nivelId],
  );

  const removerAtribuicao = useCallback<
    UseConfigPrecificadoresReturn['removerAtribuicao']
  >(
    async (id) => {
      if (state.configuracao.nivelId === null) {
        console.warn('removerAtribuicao ignorada: nivelId === null (FR-015).');
        return;
      }
      await apis.precificadores.removeAtribuicao(id);
      dispatch({
        type: 'ATRIBUICAO_REMOVIDA',
        payload: { atribuicoes: storage.listAtribuicoes() },
      });
    },
    [apis.precificadores, state.configuracao.nivelId],
  );

  const recarregar = useCallback(async () => {
    await boot();
  }, [boot]);

  return {
    ...state,
    definirNivel,
    trocarNivelComReset,
    salvarAtribuicao,
    removerAtribuicao,
    recarregar,
  };
}
