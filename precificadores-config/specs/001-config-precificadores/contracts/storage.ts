/**
 * Storage Contract — wrapper sobre localStorage.
 *
 * Único ponto que conhece chaves de localStorage. Todo o resto do app
 * conversa com este módulo via funções tipadas. No handoff para CRA, este
 * arquivo é substituído por chamadas HTTP para o backend Java sem mudar
 * a assinatura das funções.
 *
 * Prefixo de chave: "filtro-precificador:fase1:"
 */

import type { Atribuicao, ConfiguracaoGlobal } from './domain-types';

// ─── Constantes ───────────────────────────────────────────────────────

export const STORAGE_PREFIX = 'filtro-precificador:fase1:';

export const STORAGE_KEYS = {
  initialized: `${STORAGE_PREFIX}initialized`,
  configuracao: `${STORAGE_PREFIX}configuracao`,
  atribuicoes:  `${STORAGE_PREFIX}atribuicoes`,
} as const;

// ─── Contrato ─────────────────────────────────────────────────────────

export interface IStorage {
  /** Marca/lê a sentinela de inicialização. */
  isInitialized(): boolean;
  setInitialized(value: boolean): void;

  /** Configuração global (singleton). null = nunca configurado. */
  getConfiguracao(): ConfiguracaoGlobal;
  setConfiguracao(value: ConfiguracaoGlobal): void;

  /** Lista completa de atribuições. */
  listAtribuicoes(): Atribuicao[];
  saveAtribuicoes(value: Atribuicao[]): void;

  /** Reset total (usado pelo dev toolbar). Apaga todas as chaves do prefixo. */
  resetAll(): void;
}

// ─── Erros conhecidos ─────────────────────────────────────────────────

export class StorageSchemaMismatchError extends Error {
  constructor(public readonly key: string, public readonly found: number, public readonly expected: number) {
    super(`Schema version mismatch on ${key}: found ${found}, expected ${expected}`);
    this.name = 'StorageSchemaMismatchError';
  }
}

/**
 * Implementação concreta vive em src/state/storage.ts no protótipo.
 * Esta interface é o contrato que `useConfigPrecificadores` consome.
 */
