/**
 * HeaderInfoPrice — barra superior fixa.
 * Markup canônico do DS (.header / .header__brand / .header__user etc.).
 * Logo via <img> (mesmo padrão do configuracoes-outliers.html de referência).
 *
 * Ícones do header usam `material-icons-outlined` propositalmente — o CSS
 * do DS aplica cor branca apenas pra `.header__menu-btn .material-icons-outlined`
 * e similares. Trocar pra filled (`material-icons`) quebra a coloração.
 */

export default function HeaderInfoPrice() {
  return (
    <header className="header">
      <div className="header__left">
        <button className="header__menu-btn" aria-label="Menu de produtos" type="button">
          <span className="material-icons-outlined">apps</span>
        </button>
        <div className="header__brand">
          <img className="header__logo" src="assets/logo-principal.svg" alt="InfoPrice" />
          <div className="header__divider" aria-hidden="true" />
          <span className="header__product-name">IPA | Software de Precificação</span>
        </div>
      </div>

      <div className="header__right">
        <button className="header__help-btn" aria-label="Ajuda" type="button">
          <span className="material-icons-outlined">help_outline</span>
        </button>
        <div className="header__user" role="button" tabIndex={0} aria-haspopup="menu">
          <span className="header__user-name">Olá, Marcus</span>
          <span className="material-icons-outlined">keyboard_arrow_down</span>
        </div>
      </div>
    </header>
  );
}
