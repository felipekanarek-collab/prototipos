/**
 * Seed loader concrete — carrega dados read-only e popula localStorage na
 * primeira inicialização.
 *
 * Contrato em specs/001-config-precificadores/contracts/seed-loader.ts.
 */

import type {
  Atribuicao,
  Categoria,
  ConfiguracaoGlobal,
  NivelCategoria,
  Usuario,
} from '../types';
import { storage } from './storage';

export type ReadOnlySeed = {
  usuarios: Usuario[];
  niveis: NivelCategoria[];
  categorias: Categoria[];
};

type AtribuicoesIniciaisSeed = {
  configuracao: ConfiguracaoGlobal;
  atribuicoes: Atribuicao[];
};

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

async function fetchJson<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path);
  } catch (cause) {
    throw new SeedFetchError(path, cause);
  }
  if (!response.ok) {
    throw new SeedFetchError(path, `HTTP ${response.status}`);
  }
  try {
    return (await response.json()) as T;
  } catch (cause) {
    throw new SeedParseError(path, cause);
  }
}

export const seedLoader = {
  async loadReadOnly(): Promise<ReadOnlySeed> {
    const [usuarios, niveis, categorias] = await Promise.all([
      fetchJson<Usuario[]>('seeds/usuarios.json'),
      fetchJson<NivelCategoria[]>('seeds/niveis-categoria.json'),
      fetchJson<Categoria[]>('seeds/categorias.json'),
    ]);
    return { usuarios, niveis, categorias };
  },

  async initializeIfNeeded(): Promise<void> {
    if (storage.isInitialized()) return;
    const data = await fetchJson<AtribuicoesIniciaisSeed>('seeds/atribuicoes-iniciais.json');
    storage.setConfiguracao(data.configuracao);
    storage.saveAtribuicoes(data.atribuicoes);
    storage.setInitialized(true);
  },

  async forceReinitialize(): Promise<void> {
    storage.resetAll();
    await this.initializeIfNeeded();
  },
};

export type SeedLoader = typeof seedLoader;
