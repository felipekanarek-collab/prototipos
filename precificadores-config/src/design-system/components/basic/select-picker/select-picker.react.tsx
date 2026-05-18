/**
 * SelectPicker — InfoPrice DS
 *
 * Combo de input + dropdown com search opcional. Selecao unica em listas longas.
 * Para multi-select, use a prop `multiple`.
 *
 * Markup canonico: design-system/components/basic/select-picker/select-picker.html
 *
 * Comportamento:
 * - Click no trigger abre/fecha dropdown
 * - Search filtra items em tempo real (case-insensitive)
 * - Click fora fecha
 * - ESC fecha
 * - is-disabled previne selecao
 * - is-selected destaca o(s) item(s) atual(is)
 */

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';

export type SelectOption<V extends string | number = string> = {
  value: V;
  label: ReactNode;
  /** Texto pra busca/filtro (default: stringify de label se for string) */
  searchText?: string;
  disabled?: boolean;
};

export type SelectPickerSingleProps<V extends string | number = string> = {
  multiple?: false;
  value?: V | null;
  onChange: (value: V | null) => void;
};

export type SelectPickerMultipleProps<V extends string | number = string> = {
  multiple: true;
  value: V[];
  onChange: (value: V[]) => void;
};

export type SelectPickerCommonProps<V extends string | number = string> = {
  options: SelectOption<V>[];
  placeholder?: string;
  /** Mostra input de busca dentro do dropdown */
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  /** className extra no `.select-picker` */
  className?: string;
  /** Largura minima do trigger; default 200px (CSS do DS) */
  minWidth?: string | number;
  /** Conteudo opcional no rodape do dropdown */
  footer?: ReactNode;
};

export type SelectPickerProps<V extends string | number = string> =
  SelectPickerCommonProps<V> & (SelectPickerSingleProps<V> | SelectPickerMultipleProps<V>);

export default function SelectPicker<V extends string | number = string>(
  props: SelectPickerProps<V>
) {
  const {
    options,
    placeholder = 'Selecione...',
    searchable = false,
    searchPlaceholder = 'Buscar...',
    disabled,
    className,
    minWidth,
    footer,
  } = props;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Foco no search ao abrir
  useEffect(() => {
    if (open && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!open) setQuery('');
  }, [open, searchable]);

  // ESC + click fora fecham
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  // Filtro
  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((opt) => {
      const txt = (opt.searchText ?? (typeof opt.label === 'string' ? opt.label : '')).toLowerCase();
      return txt.includes(q) || String(opt.value).toLowerCase().includes(q);
    });
  }, [options, query]);

  // Label exibido no trigger
  const triggerContent = useMemo(() => {
    if (props.multiple) {
      const selectedLabels = props.value
        .map((v) => options.find((o) => o.value === v)?.label)
        .filter(Boolean);
      if (selectedLabels.length === 0) {
        return <span className="select-picker__placeholder">{placeholder}</span>;
      }
      if (selectedLabels.length === 1) return <span>{selectedLabels[0]}</span>;
      return <span>{selectedLabels.length} selecionados</span>;
    }
    const selected = options.find((o) => o.value === props.value);
    return selected ? (
      <span>{selected.label}</span>
    ) : (
      <span className="select-picker__placeholder">{placeholder}</span>
    );
  }, [props, options, placeholder]);

  const isSelected = (value: V): boolean => {
    if (props.multiple) return props.value.includes(value);
    return props.value === value;
  };

  const handleItemClick = (opt: SelectOption<V>) => {
    if (opt.disabled) return;
    if (props.multiple === true) {
      // Narrowing manual — TS nao narrowa discriminated union em props com optional `multiple?: false`
      const multi = props as SelectPickerCommonProps<V> & SelectPickerMultipleProps<V>;
      const set = new Set(multi.value);
      if (set.has(opt.value)) set.delete(opt.value);
      else set.add(opt.value);
      multi.onChange([...set]);
      // Multi-select mantem aberto
    } else {
      const single = props as SelectPickerCommonProps<V> & SelectPickerSingleProps<V>;
      single.onChange(opt.value);
      setOpen(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className={clsx('select-picker', className)}
      style={minWidth !== undefined ? { minWidth } : undefined}
    >
      <button
        type="button"
        className={clsx('select-picker__trigger', open && 'is-open')}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
      >
        {triggerContent}
        <span className="material-icons-outlined select-picker__chevron">
          keyboard_arrow_down
        </span>
      </button>

      <div className={clsx('select-picker__dropdown', open && 'is-open')} role="listbox">
        {searchable && (
          <div className="select-picker__search">
            <input
              ref={searchInputRef}
              type="text"
              className="select-picker__search-input"
              placeholder={searchPlaceholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}
        <div className="select-picker__list">
          {filtered.length === 0 ? (
            <div className="select-picker__item is-disabled">Nenhum resultado</div>
          ) : (
            filtered.map((opt) => (
              <div
                key={String(opt.value)}
                className={clsx(
                  'select-picker__item',
                  isSelected(opt.value) && 'is-selected',
                  opt.disabled && 'is-disabled'
                )}
                role="option"
                aria-selected={isSelected(opt.value)}
                aria-disabled={opt.disabled || undefined}
                onClick={() => handleItemClick(opt)}
              >
                {opt.label}
              </div>
            ))
          )}
        </div>
        {footer && <div className="select-picker__footer">{footer}</div>}
      </div>
    </div>
  );
}
