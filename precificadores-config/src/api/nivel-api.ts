/**
 * Nivel API — leitura/escrita da ConfiguracaoGlobal (singleton).
 * Quando troca de nível, opcionalmente reseta as atribuições (FR-016).
 */

import type { ConfiguracaoGlobal, NivelCategoria } from '../types';
import { storage } from '../state/storage';

export type NivelApi = {
  getNivelGlobal(): Promise<ConfiguracaoGlobal>;
  setNivelGlobal(
    nivelId: NivelCategoria['id'],
    options: { resetAtribuicoes: boolean },
  ): Promise<ConfiguracaoGlobal>;
  listNiveisDisponiveis(): Promise<NivelCategoria[]>;
};

export function createNivelApi(niveis: NivelCategoria[]): NivelApi {
  return {
    async getNivelGlobal() {
      return storage.getConfiguracao();
    },

    async setNivelGlobal(nivelId, { resetAtribuicoes }) {
      const novo: ConfiguracaoGlobal = {
        schemaVersion: 1,
        nivelId,
        atualizadoEm: new Date().toISOString(),
      };
      storage.setConfiguracao(novo);
      if (resetAtribuicoes) {
        storage.saveAtribuicoes([]);
      }
      return novo;
    },

    async listNiveisDisponiveis() {
      return niveis;
    },
  };
}
