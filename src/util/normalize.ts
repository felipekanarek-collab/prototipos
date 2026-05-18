/**
 * Normaliza string para busca case + accent insensitive.
 *
 * Exemplos:
 *   normalize('Açaí')   → 'acai'
 *   normalize('ÁGUAS')  → 'aguas'
 *   normalize('café')   → 'cafe'
 *
 * Usa Unicode NFD para decompor caracteres acentuados em base + combining
 * mark, depois remove as combining marks (range U+0300–U+036F).
 */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
}
