/**
 * App — composição raiz da Fase 1.
 *
 * Carrega seeds via useConfigPrecificadores, monta o shell do Administrativo
 * IPA (AdminShell) e injeta TelaConfigPrecificadores. Renderiza também o
 * DevToolbar (controlado pela própria querystring) e o ToastContainer.
 *
 * O DevToolbar é renderizado SEMPRE — mesmo em loading ou erro — para que
 * o usuário consiga recuperar de estados ruins (ex.: "Estado de erro"
 * forçado, schemaVersion corrompido) usando Reset/Estado zero.
 */

import AdminShell from './shell/AdminShell';
import TelaConfigPrecificadores from './tela/TelaConfigPrecificadores';
import DevToolbar from './tela/DevToolbar';
import { ToastContainer } from './design-system/components/compound/toast/toast.react';
import { useConfigPrecificadores } from './state/useConfigPrecificadores';

export default function App() {
  const config = useConfigPrecificadores();

  return (
    <>
      {config.loading && (
        <div className="app-loading">
          <span className="material-icons" aria-hidden="true">hourglass_empty</span>
          &nbsp;Carregando…
        </div>
      )}

      {!config.loading && config.error !== null && (
        <div className="app-error" role="alert">
          <span className="material-icons" aria-hidden="true">error</span>
          <div>Erro ao carregar a seção: {config.error.message}</div>
          <button
            type="button"
            className="btn btn--primary btn--medium"
            onClick={() => { void config.recarregar(); }}
          >
            Tentar novamente
          </button>
          <div style={{ fontSize: 12, color: 'var(--color-gray-600)', marginTop: 8 }}>
            Dica: use o botão <strong>Reset</strong> ou <strong>Estado zero</strong>{' '}
            no DevToolbar (canto inferior direito, com <code>?dev=1</code> na URL)
            para limpar o storage e voltar a um estado consistente.
          </div>
        </div>
      )}

      {!config.loading && config.error === null && (
        <AdminShell secaoAtiva="precificadores">
          <TelaConfigPrecificadores config={config} />
        </AdminShell>
      )}

      <ToastContainer />
      <DevToolbar />
    </>
  );
}
