/**
 * ChipSobreposicao — indicador visual de sobreposição (FR-008 / T036).
 *
 * Renderiza nada quando a categoria tem somente 1 precificador (sem
 * sobreposição). Quando >1, mostra um badge ghost laranja com a contagem
 * de OUTROS precificadores que compartilham essa categoria.
 *
 * Markup: classe `.badge .badge--ghost .badge--orange .badge--medium` do DS.
 *
 * @param count Total de precificadores que têm essa categoria (>=1).
 * @param excludeSelf Se true, conta apenas outros (para uso no editor).
 */

type Props = {
  count: number;
  excludeSelf?: boolean;
};

export default function ChipSobreposicao({ count, excludeSelf = false }: Props) {
  const outros = excludeSelf ? count : count - 1;
  if (outros <= 0) return null;
  return (
    <span
      className="badge badge--ghost badge--orange badge--medium"
      title={`Compartilhada com ${outros} outro${outros > 1 ? 's' : ''} precificador${outros > 1 ? 'es' : ''}`}
    >
      +{outros} {outros === 1 ? 'precificador' : 'precificadores'}
    </span>
  );
}
