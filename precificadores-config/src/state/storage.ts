/**
 * IStorage concrete — wrapper sobre localStorage.
 *
 * Contrato em specs/001-config-precificadores/contracts/storage.ts.
 * No port para CRA + backend Java, este arquivo é substituído por chamadas
 * HTTP; o resto do app não muda.
 */

import type { Atribuicao, ConfiguracaoGlobal } from '../types';

export const STORAGE_PREFIX = 'filtro-precificador:fase1:';

export const STORAGE_KEYS = {
  initialized: `${STORAGE_PREFIX}initialized`,
  configuracao: `${STORAGE_PREFIX}configuracao`,
  atribuicoes: `${STORAGE_PREFIX}atribuicoes`,
} as const;

export const SCHEMA_VERSION = 1;

export class StorageSchemaMismatchError extends Error {
  constructor(
    public readonly key: string,
    public readonly found: unknown,
    public readonly expected: number,
  ) {
    super(`Schema version mismatch on ${key}: found ${String(found)}, expected ${expected}`);
    this.name = 'StorageSchemaMismatchError';
  }
}

function readJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function assertSchema(key: string, value: { schemaVersion?: unknown } | null): void {
  if (value === null) return;
  if (value.schemaVersion !== SCHEMA_VERSION) {
    throw new StorageSchemaMismatchError(key, value.schemaVersion, SCHEMA_VERSION);
  }
}

const EMPTY_CONFIGURACAO: ConfiguracaoGlobal = {
  schemaVersion: SCHEMA_VERSION,
  nivelId: null,
  atualizadoEm: null,
};

export const storage = {
  isInitialized(): boolean {
    return localStorage.getItem(STORAGE_KEYS.initialized) === 'true';
  },

  setInitialized(value: boolean): void {
    localStorage.setItem(STORAGE_KEYS.initialized, value ? 'true' : 'false');
  },

  getConfiguracao(): ConfiguracaoGlobal {
    const data = readJson<ConfiguracaoGlobal>(STORAGE_KEYS.configuracao);
    assertSchema(STORAGE_KEYS.configuracao, data);
    return data ?? EMPTY_CONFIGURACAO;
  },

  setConfiguracao(value: ConfiguracaoGlobal): void {
    writeJson(STORAGE_KEYS.configuracao, value);
  },

  listAtribuicoes(): Atribuicao[] {
    const data = readJson<Atribuicao[]>(STORAGE_KEYS.atribuicoes);
    if (data === null) return [];
    // Cada atribuição tem seu próprio schemaVersion; validar a primeira basta.
    if (data.length > 0) {
      assertSchema(STORAGE_KEYS.atribuicoes, data[0] as unknown as { schemaVersion?: unknown });
    }
    return data;
  },

  saveAtribuicoes(value: Atribuicao[]): void {
    writeJson(STORAGE_KEYS.atribuicoes, value);
  },

  resetAll(): void {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k !== null && k.startsWith(STORAGE_PREFIX)) {
        keys.push(k);
      }
    }
    for (const k of keys) {
      localStorage.removeItem(k);
    }
  },
};

export type Storage = typeof storage;
