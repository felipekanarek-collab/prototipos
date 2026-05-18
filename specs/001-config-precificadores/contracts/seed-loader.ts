/**
 * Seed Loader Contract — carrega dados read-only do seed e popula
 * localStorage no primeiro acesso.
 *
 * Lê de `/seeds/{usuarios,niveis-categoria,categorias,atribuicoes-iniciais}.json`
 * via fetch (paths relativos do site).
 *
 * No handoff para CRA, a função `loadInitialData()` deixa de ser usada —
 * os dados vêm da API Java. O resto da app não muda porque consome via
 * `useConfigPrecificadores` que internamente usa IStorage.
 */

import type {
  Usuario,
  NivelCategoria,
  Categoria,
  Atribuicao,
  ConfiguracaoGlobal,
} from './domain-types';

// ─── Tipos de payload do seed ─────────────────────────────────────────

export type ReadOnlySeed = {
  usuarios: Usuario[];
  niveis: NivelCategoria[];
  categorias: Categoria[];
};

export type AtribuicoesIniciaisSeed = {
  configuracao: ConfiguracaoGlobal;
  atribuicoes: Atribuicao[];
};

// ─── Contrato ─────────────────────────────────────────────────────────

export interface ISeedLoader {
  /**
   * Carrega os 3 JSON read-only via fetch e devolve em memória.
   * Não toca em localStorage. Chamado em toda visita.
   */
  loadReadOnly(): Promise<ReadOnlySeed>;

  /**
   * Se localStorage estiver "não inicializado" (sentinela `initialized` ausente
   * ou false), carrega `atribuicoes-iniciais.json` e popula a `Configuracao`
   * e as `Atribuicao[]` no storage. Em seguida marca `initialized=true`.
   * Idempotente — chamadas subsequentes são no-op.
   */
  initializeIfNeeded(): Promise<void>;

  /**
   * Forçar reset + repopulação a partir do seed (usado pelo dev toolbar
   * "Pular para populado").
   */
  forceReinitialize(): Promise<void>;
}

// ─── Erros conhecidos ─────────────────────────────────────────────────

export class SeedFetchError extends Error {
  constructor(public readonly path: string, public readonly cause?: unknown) {
    super(`Falha ao carregar seed em ${path}`);
    this.name = 'SeedFetchError';
  }
}

export class SeedParseError extends Error {
  constructor(public readonly path: string, public readonly cause?: unknown) {
    super(`Falha ao parsear JSON do seed em ${path}`);
    this.name = 'SeedParseError';
  }
}
