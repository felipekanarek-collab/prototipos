/**
 * EmptyAtribuicoes — empty state após nível definido, sem atribuições (T035).
 *
 * Card com mensagem orientadora + botão "Nova atribuição" em destaque.
 */

export type EmptyAtribuicoesProps = {
  onNovaAtribuicao: () => void;
};

export default function EmptyAtribuicoes({ onNovaAtribuicao }: EmptyAtribuicoesProps) {
  return (
    <div className="config-card">
      <div className="config-card__header">
        <span className="config-card__title">Atribuições</span>
        <span className="config-card__desc">
          Nenhum precificador configurado ainda. Comece pela primeira atribuição.
        </span>
      </div>

      <div className="config-card__body">
        <div>
          <button
            type="button"
            className="btn btn--primary btn--medium"
            onClick={onNovaAtribuicao}
          >
            Nova atribuição
          </button>
        </div>
      </div>
    </div>
  );
}
