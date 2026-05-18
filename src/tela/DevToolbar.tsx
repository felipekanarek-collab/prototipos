/**
 * DevToolbar — toolbar oculto, renderiza apenas quando `?dev=1` está na URL.
 * Não usa flags Vite-específicas (Constitution §Stack proibe).
 *
 * Botões (T055 elabora em Polish):
 * - Reset: zera o localStorage do prefixo da Fase 1.
 * - Estado zero: reset + remove 'initialized' (volta ao empty state inicial).
 * - Pular para populado: força reinitialize do seed.
 * - Estado de erro: corrompe schemaVersion para disparar StorageSchemaMismatchError.
 */

import { useState } from 'react';
import { storage, STORAGE_KEYS } from '../state/storage';
import { seedLoader } from '../state/seed-loader';

function isDevModeActive(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.search.includes('dev=1');
}

export default function DevToolbar() {
  // Lazy initial state — toolbar visível já no 1º paint quando ?dev=1
  // está na URL (sem flash via useEffect).
  const [active] = useState<boolean>(() => isDevModeActive());

  if (!active) return null;

  const handleReset = () => {
    storage.resetAll();
    window.location.reload();
  };

  const handleEstadoZero = () => {
    // Zera tudo + marca como inicializado pra que o boot NÃO recarregue
    // o seed populado. Assim, getConfiguracao() retorna o default vazio
    // (nivelId: null) e listAtribuicoes() retorna [].
    storage.resetAll();
    storage.setInitialized(true);
    window.location.reload();
  };

  const handlePularParaPopulado = async () => {
    await seedLoader.forceReinitialize();
    window.location.reload();
  };

  const handleEstadoErro = () => {
    // Corrompe schemaVersion para disparar StorageSchemaMismatchError no boot.
    localStorage.setItem(
      STORAGE_KEYS.atribuicoes,
      JSON.stringify([{ schemaVersion: 99, id: 'corrupt' }]),
    );
    window.location.reload();
  };

  return (
    <div className="dev-toolbar" role="region" aria-label="Atalhos de desenvolvimento">
      <span className="dev-toolbar__title">Dev</span>
      <button type="button" onClick={handleReset}>Reset</button>
      <button type="button" onClick={handleEstadoZero}>Estado zero</button>
      <button type="button" onClick={handlePularParaPopulado}>Pular para populado</button>
      <button type="button" onClick={handleEstadoErro}>Estado de erro</button>
    </div>
  );
}
