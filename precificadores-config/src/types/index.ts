/**
 * Domain Types — Fase 1 (Configuração de Precificadores)
 *
 * Contratos de domínio que valem tanto para o protótipo (Vite+React) quanto
 * para o handoff CRA. Antecipam o formato dos DTOs da API Java.
 *
 * CONVENÇÕES:
 *   - camelCase em PT-BR
 *   - IDs como string (UUID ou prefixo curto: "usr-001", "cat-doces", "atr-001")
 *   - Datas como ISO 8601 string ("2026-05-16T14:30:00.000Z")
 *   - schemaVersion: 1 em todos os tipos persistidos, pra suportar evolução
 *
 * IMPORTANTE: estes arquivos são copiados quase 1:1 para src/types/ do
 * protótipo. São o ponto de verdade do domínio.
 */

// ─── Read-only (vêm do IPA, fora de escopo da Fase 1) ─────────────────

export type Usuario = {
  schemaVersion: 1;
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  cargo?: string;
};

export type NivelCategoria = {
  schemaVersion: 1;
  id: string;
  nome: string;
  ordem: number;
};

export type Categoria = {
  schemaVersion: 1;
  id: string;
  nome: string;
  nivelId: NivelCategoria['id'];
  caminho: string[];
  paiId: string | null;
};

// ─── Mutáveis (a Fase 1 cria/edita) ───────────────────────────────────

export type Atribuicao = {
  schemaVersion: 1;
  id: string;
  usuarioId: Usuario['id'];
  categoriaIds: Categoria['id'][];
  criadoEm: string;
  atualizadoEm: string;
};

export type ConfiguracaoGlobal = {
  schemaVersion: 1;
  nivelId: NivelCategoria['id'] | null;
  atualizadoEm: string | null;
};

// ─── Tipos derivados (apenas no protótipo) ────────────────────────────

/**
 * View model agregado para listar atribuições com nome do usuário e dos
 * caminhos das categorias já resolvidos. Construído em memória — não é
 * persistido.
 */
export type AtribuicaoView = {
  id: Atribuicao['id'];
  usuario: Pick<Usuario, 'id' | 'nome' | 'email' | 'ativo' | 'cargo'>;
  categorias: Pick<Categoria, 'id' | 'nome' | 'caminho'>[];
  /** Para cada categoriaId, número total de precificadores que a têm (>=1). */
  contagemSobreposicaoPorCategoria: Record<Categoria['id'], number>;
  criadoEm: Atribuicao['criadoEm'];
  atualizadoEm: Atribuicao['atualizadoEm'];
};
