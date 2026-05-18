/**
 * CardNivelCategoria — escolha do nível global de categoria (T030 + T031).
 *
 * Layout único seguindo o padrão das outras seções do Administrativo IPA
 * (vide "Margem objetiva" / "Nível de aplicação da otimização de preços"):
 *   título + descrição + SelectPicker.
 *
 * UX: commit direto no `onChange` do SelectPicker (sem botão, sem modal).
 * O toast disparado pelo caller informa o efeito colateral quando há
 * atribuições zeradas.
 *
 * Comportamento:
 *   - Quando `configuracao.nivelId === null` (FR-003): SelectPicker
 *     pré-selecionado em "Subcategoria" (ordem 3) como hint visual.
 *     Pra commitar, o usuário só precisa abrir e re-confirmar a seleção
 *     (ou escolher outra) — qualquer onChange dispara a definição.
 *   - Quando já há nível configurado: SelectPicker mostra o atual.
 *     Selecionar outro nível troca direto.
 */

import { useEffect, useMemo, useState } from 'react';
import SelectPicker, {
  type SelectOption,
} from '../design-system/components/basic/select-picker/select-picker.react';
import type { ConfiguracaoGlobal, NivelCategoria } from '../types';

const DEFAULT_NIVEL_ID: NivelCategoria['id'] = 'nivel-subcategoria';

export type CardNivelCategoriaProps = {
  configuracao: ConfiguracaoGlobal;
  niveis: NivelCategoria[];
  onCommit: (nivelId: NivelCategoria['id']) => Promise<void> | void;
};

export default function CardNivelCategoria({
  configuracao,
  niveis,
  onCommit,
}: CardNivelCategoriaProps) {
  // Valor exibido no SelectPicker: o nível configurado, ou o default visual
  // se nada está configurado ainda.
  const [exibido, setExibido] = useState<NivelCategoria['id']>(
    configuracao.nivelId ?? DEFAULT_NIVEL_ID,
  );

  // Sincroniza com mudanças externas (ex.: dev toolbar reset).
  useEffect(() => {
    setExibido(configuracao.nivelId ?? DEFAULT_NIVEL_ID);
  }, [configuracao.nivelId]);

  const opcoes = useMemo<SelectOption<NivelCategoria['id']>[]>(
    () =>
      [...niveis]
        .sort((a, b) => a.ordem - b.ordem)
        .map((n) => ({ value: n.id, label: `${n.ordem} - ${n.nome}` })),
    [niveis],
  );

  const handleChange = (v: NivelCategoria['id'] | null) => {
    if (v === null) return;
    setExibido(v);
    if (v !== configuracao.nivelId) {
      void onCommit(v);
    }
  };

  return (
    <div className="config-card">
      <div className="config-card__header">
        <span className="config-card__title">Nível de categoria dos precificadores</span>
        <span className="config-card__desc">
          Nível da árvore de categorias usado para vincular precificadores aos produtos.
        </span>
      </div>

      <div className="config-card__body">
        <div style={{ minWidth: 280, maxWidth: 360 }}>
          <SelectPicker<NivelCategoria['id']>
            options={opcoes}
            value={exibido}
            onChange={handleChange}
            placeholder="Selecione o nível"
          />
        </div>
      </div>
    </div>
  );
}
