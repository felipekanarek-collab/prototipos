/**
 * Usuários API — read-only sobre o snapshot em memória.
 * No port para CRA + Java, troca por chamada HTTP ao backend.
 */

import type { Usuario } from '../types';

export type UsuariosApi = {
  listUsuarios(): Promise<Usuario[]>;
};

export function createUsuariosApi(snapshot: Usuario[]): UsuariosApi {
  return {
    async listUsuarios() {
      return snapshot;
    },
  };
}
