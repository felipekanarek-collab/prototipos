/**
 * Precificadores API — CRUD de Atribuicao sobre o storage.
 *
 * Regras:
 * - Um usuário tem no máximo UMA atribuição: saveAtribuicao detecta isso pelo
 *   usuarioId e atualiza em vez de criar duplicata (FR-019).
 * - Sobreposição de categorias entre precificadores é permitida (FR-007).
 * - Atribuição com zero categorias é proibida (FR-017) — caller deve validar.
 */

import type { Atribuicao } from '../types';
import { storage } from '../state/storage';

export type SaveAtribuicaoInput = {
  usuarioId: Atribuicao['usuarioId'];
  categoriaIds: Atribuicao['categoriaIds'];
};

export type PrecificadoresApi = {
  listAtribuicoes(): Promise<Atribuicao[]>;
  saveAtribuicao(input: SaveAtribuicaoInput): Promise<Atribuicao>;
  removeAtribuicao(id: Atribuicao['id']): Promise<void>;
};

export function createPrecificadoresApi(): PrecificadoresApi {
  return {
    async listAtribuicoes() {
      return storage.listAtribuicoes();
    },

    async saveAtribuicao(input) {
      if (input.categoriaIds.length === 0) {
        throw new Error('Atribuição precisa de ao menos 1 categoria (FR-017).');
      }
      const atuais = storage.listAtribuicoes();
      const agora = new Date().toISOString();
      const existente = atuais.find((a) => a.usuarioId === input.usuarioId);

      let salva: Atribuicao;
      let proxima: Atribuicao[];

      if (existente !== undefined) {
        salva = {
          ...existente,
          categoriaIds: input.categoriaIds,
          atualizadoEm: agora,
        };
        proxima = atuais.map((a) => (a.id === existente.id ? salva : a));
      } else {
        salva = {
          schemaVersion: 1,
          id: crypto.randomUUID(),
          usuarioId: input.usuarioId,
          categoriaIds: input.categoriaIds,
          criadoEm: agora,
          atualizadoEm: agora,
        };
        proxima = [...atuais, salva];
      }

      storage.saveAtribuicoes(proxima);
      return salva;
    },

    async removeAtribuicao(id) {
      const atuais = storage.listAtribuicoes();
      storage.saveAtribuicoes(atuais.filter((a) => a.id !== id));
    },
  };
}
