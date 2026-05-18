# Feature Specification: Configuração de Precificadores

**Feature Branch**: `001-config-precificadores`
**Created**: 2026-05-16
**Status**: Draft
**Input**: User description: "Fase 1 do épico filtro-precificador — Configuração de Precificadores no Administrativo do IPA. Nova seção no Administrativo que permite ao Administrador do IPA registrar de forma estruturada quais categorias cada precificador é responsável."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Definir nível de categoria global (Priority: P1)

O Administrador do IPA acessa a nova seção de Precificadores no Administrativo e define, de forma global, qual nível hierárquico da árvore de categorias do IPA (por exemplo: Departamento, Categoria, Subcategoria) será usado em todas as atribuições. Essa escolha vale para todos os precificadores e fica registrada como configuração da seção.

**Why this priority**: É pré-requisito técnico de tudo o mais — sem um nível de categoria definido, não existe um conjunto de "categorias atribuíveis" e portanto nenhuma atribuição é possível. Sem este passo, a Fase 1 inteira fica inerte e as Fases 2-4 não têm dado pra consumir.

**Independent Test**: Pode ser totalmente validada entrando na seção pela primeira vez (estado zero), escolhendo um nível, salvando, e ao reabrir a seção verificar que o nível persiste. Entrega valor por si: o Administrador "destravou" o resto da configuração.

**Acceptance Scenarios**:

1. **Given** a seção foi acessada pela primeira vez e nada foi configurado, **When** o Administrador entra na seção, **Then** ele é orientado de forma clara a começar pela escolha do nível de categoria antes de qualquer atribuição.
2. **Given** o nível global não foi definido, **When** o Administrador tenta iniciar uma atribuição, **Then** o sistema impede a ação e instrui que o nível precisa ser escolhido primeiro.
3. **Given** o nível foi escolhido e salvo, **When** o Administrador sai da seção e volta depois, **Then** o nível permanece registrado e a seção mostra que ele está configurado.
4. **Given** o nível X está vigente e existem atribuições feitas, **When** o Administrador tenta trocar o nível para Y, **Then** o sistema apresenta um aviso explícito informando quantas atribuições serão invalidadas pela troca e exige confirmação consciente antes de prosseguir; ao confirmar, todas as atribuições existentes são removidas e o nível passa a ser Y; ao cancelar, nada muda.

---

### User Story 2 - Atribuir categorias a um precificador (Priority: P1)

Com o nível global definido, o Administrador seleciona um usuário cadastrado no IPA (que passa a atuar como precificador) e marca quais categorias daquele nível estão sob a responsabilidade dele. A atribuição é salva e passa a aparecer na lista de atribuições da seção.

**Why this priority**: É a função-fim da Fase 1 — produzir o dado que as Fases 2-4 vão consumir. Sem ao menos uma atribuição existir, o filtro de precificador das fases seguintes não tem o que mostrar.

**Independent Test**: Assumindo o nível global já definido (US1), o Administrador seleciona um usuário, escolhe N categorias num multiselect com busca, salva, e a atribuição aparece imediatamente na lista. Reabrindo a seção, ela continua lá.

**Acceptance Scenarios**:

1. **Given** o nível global está definido, **When** o Administrador inicia uma nova atribuição, **Then** o sistema apresenta a lista completa de usuários do IPA para que ele escolha um — incluindo usuários que já são precificadores, sinalizados visualmente com um indicador "já é precificador".
2. **Given** um usuário **sem atribuição prévia** foi selecionado, **When** o Administrador procede para a etapa de categorias, **Then** o sistema apresenta um multiselect com busca contendo todas as categorias do nível global vigente, sem nenhuma pré-marcação.
3. **Given** um usuário **que já é precificador** foi selecionado, **When** o Administrador procede para a etapa de categorias, **Then** o sistema abre o fluxo em modo de edição, com as categorias atualmente atribuídas pré-marcadas — sem criar uma atribuição duplicada.
4. **Given** o Administrador selecionou uma ou mais categorias, **When** ele salva, **Then** a atribuição é persistida (criada ou atualizada conforme o caso) e a lista de atribuições é atualizada.
5. **Given** uma categoria já está atribuída a outro precificador, **When** o Administrador a seleciona, **Then** a interface deixa visível que existe sobreposição (sem bloquear), permitindo a atribuição dupla.
6. **Given** nenhuma categoria foi selecionada, **When** o Administrador tenta salvar, **Then** o sistema impede o salvamento com mensagem explicando que pelo menos uma categoria é obrigatória.
7. **Given** o fluxo de atribuição está em curso, **When** o Administrador tenta inverter a ordem (escolher categorias antes do usuário), **Then** o caminho não é oferecido — o fluxo é sempre usuário → categorias.

---

### User Story 3 - Visualizar atribuições existentes com sobreposição clara (Priority: P2)

O Administrador acessa a seção e enxerga, num formato organizado, todas as atribuições já feitas: quais precificadores existem e quais categorias cada um gerencia. Quando uma mesma categoria está atribuída a mais de um precificador, isso fica explícito visualmente.

**Why this priority**: É o que permite auditoria contínua da configuração — sem visualização clara, o Administrador não consegue checar se a operação está organizada ou identificar lacunas. Não é estritamente necessário pro MVP funcional, mas é o que torna a seção utilizável no dia a dia.

**Independent Test**: Com seed populado contendo precificadores com diferentes números de categorias atribuídas (1, várias, e pelo menos um caso de sobreposição), o Administrador entra na seção e enxerga a lista pronta, identificando rapidamente os casos compartilhados.

**Acceptance Scenarios**:

1. **Given** existem atribuições configuradas, **When** o Administrador abre a seção, **Then** a lista mostra cada precificador com nome, identificação básica e o conjunto de categorias sob sua gestão.
2. **Given** uma categoria está atribuída a múltiplos precificadores, **When** o Administrador olha a lista, **Then** essa sobreposição é sinalizada de forma evidente (não escondida) — por exemplo, indicação visual junto à categoria ou agrupamento dedicado.
3. **Given** a lista tem muitos precificadores, **When** o Administrador digita um termo na busca, **Then** o filtro local considera tanto o nome do precificador quanto os nomes das categorias atribuídas, mostrando os resultados que casam por qualquer um dos dois.

---

### User Story 4 - Editar atribuições de um precificador (Priority: P2)

O Administrador identifica um precificador cuja configuração precisa mudar (categoria a mais, categoria a menos) e ajusta a atribuição sem precisar recriar tudo do zero.

**Why this priority**: A operação real tem mudanças frequentes (gente trocando de escopo, categoria nova entrando). Sem edição, cada ajuste vira "remove e cria de novo", o que é trabalhoso e perdoa erros.

**Independent Test**: Com uma atribuição existente, o Administrador entra em edição, altera o conjunto de categorias (adiciona uma, remove outra), salva, e a lista reflete a mudança. Reabrindo a seção, a mudança persiste.

**Acceptance Scenarios**:

1. **Given** uma atribuição existente, **When** o Administrador aciona "editar" para esse precificador, **Then** o editor abre com a seleção atual de categorias pré-marcada.
2. **Given** uma edição em curso, **When** o Administrador adiciona ou remove categorias e salva, **Then** a mudança é persistida e refletida na lista; quaisquer novas sobreposições criadas pela edição são exibidas como tal.
3. **Given** uma edição em curso, **When** o Administrador cancela, **Then** nenhuma alteração é aplicada à atribuição original.
4. **Given** uma edição em curso com mudanças não salvas, **When** o Administrador navega para fora (clica em "Voltar", troca de aba, fecha o painel) sem salvar, **Then** as mudanças são descartadas silenciosamente — o sistema NÃO pede confirmação (decisão de design: fluxos curtos, custo de re-fazer é baixo; ver FR-020).

---

### User Story 5 - Remover atribuição de um precificador (Priority: P3)

Quando um precificador deixa de ter responsabilidades, o Administrador remove a atribuição inteira do sistema (não confundir com remover o usuário do IPA, que é outro fluxo).

**Why this priority**: Necessário pra manter a configuração limpa, mas menos frequente que edição. Pode entrar depois sem comprometer o valor da seção.

**Independent Test**: O Administrador escolhe uma atribuição existente, aciona remover, confirma, e ela some da lista. Reabrindo a seção, segue removida.

**Acceptance Scenarios**:

1. **Given** uma atribuição existente, **When** o Administrador aciona "remover" para esse precificador, **Then** o sistema solicita confirmação explícita antes de prosseguir.
2. **Given** a confirmação foi dada, **When** o sistema completa a remoção, **Then** a atribuição não aparece mais na lista; o usuário em si segue cadastrado no IPA.
3. **Given** a confirmação foi cancelada, **When** o Administrador retorna à lista, **Then** a atribuição segue intacta.

---

### Edge Cases

- **Estado zero da seção**: nenhuma configuração feita ainda — nem nível, nem atribuição. A seção orienta o Administrador pelo primeiro passo (definir nível) com linguagem não-técnica.
- **Estado pós-nível, sem atribuições**: nível definido mas nenhum precificador atribuído ainda — empty state separado do anterior, convidando à primeira atribuição.
- **Atribuição com 1 categoria** vs **com várias categorias** vs **com todas as categorias do nível**: todas válidas, exibição deve aguentar a variação sem quebrar layout.
- **Categoria atribuída a múltiplos precificadores**: sobreposição visível em todos os pontos onde a categoria aparece (lista de atribuições, painel de edição, multiselect).
- **Tentativa de atribuir sem nível definido**: bloqueio orientador (não silencioso, não confuso).
- **Tentativa de salvar com zero categorias selecionadas**: bloqueio com mensagem clara.
- **Troca do nível global após existirem atribuições**: aviso explícito com contagem de atribuições afetadas + confirmação consciente → reset das atribuições (ver FR-016).
- **Usuário desativado no IPA que tinha atribuições**: tratamento delegado ao Administrativo geral (fora do escopo da Fase 1); a seção apenas reflete o estado atual do cadastro de usuários.
- **Nenhum usuário disponível no IPA**: cenário improvável em produção, mas a seção deve degradar com mensagem orientadora ao invés de quebrar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que o Administrador defina um único nível hierárquico de categoria como configuração global da seção, válido para todas as atribuições.
- **FR-002**: O sistema MUST persistir o nível de categoria escolhido entre sessões e exibi-lo como configuração vigente ao retornar à seção.
- **FR-003**: O sistema MUST exibir empty state explícito quando o nível ainda não foi definido, orientando o Administrador a começar por esse passo.
- **FR-004**: O sistema MUST exibir empty state distinto quando o nível está definido mas nenhuma atribuição ainda foi feita, convidando à primeira atribuição.
- **FR-005**: O sistema MUST oferecer como candidatos a precificador os usuários já cadastrados no IPA, sem criar um cadastro paralelo na seção.
- **FR-006**: O sistema MUST permitir atribuir uma ou mais categorias do nível global vigente a um usuário, transformando-o em precificador com escopo definido.
- **FR-007**: O sistema MUST permitir que a mesma categoria seja atribuída a mais de um precificador, sem bloqueios — a sobreposição é regra de negócio válida.
- **FR-008**: O sistema MUST tornar visível, em qualquer ponto onde uma categoria aparece, quando ela está atribuída a múltiplos precificadores (não esconder a sobreposição).
- **FR-009**: O fluxo de atribuição MUST ser sempre "selecionar usuário → selecionar categorias"; o caminho inverso não é oferecido.
- **FR-010**: O sistema MUST oferecer multiselect com busca para a seleção de categorias na etapa de atribuição.
- **FR-011**: O sistema MUST exibir a lista de atribuições existentes agrupada por precificador, com nome do usuário e suas categorias.
- **FR-012**: O sistema MUST oferecer busca/filtro local na lista de atribuições que considere **simultaneamente** o nome do precificador e os nomes das categorias atribuídas — um termo casa se aparecer em qualquer um dos dois.
- **FR-013**: O sistema MUST permitir editar uma atribuição existente, abrindo um editor com a seleção atual pré-marcada.
- **FR-014**: O sistema MUST permitir remover uma atribuição existente, com confirmação explícita antes da remoção.
- **FR-015**: O sistema MUST bloquear, com mensagem orientadora, qualquer tentativa de iniciar atribuição quando o nível global ainda não está definido.
- **FR-019**: Na etapa de seleção de usuário do fluxo de atribuição, o sistema MUST exibir **todos** os usuários do IPA, **sinalizando visualmente** aqueles que já possuem atribuição (badge "já é precificador" ou equivalente). Ao selecionar um usuário que já é precificador, o sistema MUST abrir o fluxo em modo de edição com as categorias atuais pré-marcadas — sem criar atribuição duplicada.
- **FR-020**: Mudanças não salvas em uma edição em curso MUST ser descartadas silenciosamente ao sair do contexto de edição (Voltar, troca de aba, fechamento de painel) — sem prompt de confirmação. Decisão de design: fluxos curtos não justificam atrito de confirmação; o custo de re-fazer uma edição perdida é baixo. Validação final com produto confirma comportamento.
- **FR-016**: Ao trocar o nível global quando já existem atribuições, o sistema MUST exibir um aviso explícito informando a quantidade de atribuições que serão invalidadas e MUST exigir confirmação consciente do Administrador antes de prosseguir. Após confirmação, as atribuições existentes são removidas e o nível passa a ser o novo; ao cancelar, nenhuma alteração é aplicada.
- **FR-017**: O sistema MUST bloquear o salvamento de atribuição com zero categorias selecionadas, com mensagem orientadora.
- **FR-018**: A nova seção MUST se chamar "Precificadores" (no menu do Administrativo IPA) e o filtro correspondente nas Fases 2-4 MUST se chamar "Precificador".

### Key Entities

- **Configuração Global da Seção**: registro único (singleton) que armazena o nível hierárquico de categoria vigente. Atributos: nível selecionado, data da última alteração.
- **Precificador**: usuário do IPA que recebeu pelo menos uma categoria atribuída. Atributos relevantes: identificador do usuário, nome de exibição, conjunto de categorias sob sua gestão. Não há cadastro próprio — é projeção sobre o cadastro de usuários do IPA.
- **Categoria**: nó da árvore hierárquica de categorias do IPA, no nível global vigente. Atributos relevantes: identificador, nome, caminho hierárquico (para contexto visual: "Mercearia > Doces > Chocolates").
- **Atribuição**: relação muitos-para-muitos entre Precificador e Categoria. Um par (precificador, categoria) representa uma atribuição; pode existir o mesmo par categoria associada a múltiplos precificadores.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um Administrador novo consegue completar a configuração inicial (definir nível + criar a primeira atribuição) em menos de 5 minutos sem ajuda externa, em teste de usabilidade.
- **SC-002**: 100% das atribuições produzidas pela seção respeitam o nível global vigente — zero inconsistências de nível na base de dados gerada pela Fase 1.
- **SC-003**: Em teste de usabilidade com cenário contendo sobreposição, pelo menos 90% dos Administradores identificam corretamente todas as categorias compartilhadas entre precificadores.
- **SC-004**: O Administrador consegue localizar e editar uma atribuição específica em menos de 30 segundos em uma lista com até 50 precificadores.
- **SC-005**: Zero erros de "configuração ausente" ou "estrutura inválida" reportados pelas Fases 2-4 ao consumirem os dados gerados pela Fase 1 — toda atribuição produzida aqui alimenta o filtro sem ajustes posteriores.
- **SC-006**: Em teste de usabilidade do estado zero, pelo menos 90% dos Administradores conseguem identificar e executar o primeiro passo (definir o nível) sem precisar de instrução adicional.

## Assumptions

- O acesso à seção é restrito a usuários com perfil de Administrador — a regra de permissão é definida e enforced pelo Administrativo geral do IPA, fora do escopo desta spec.
- Os usuários disponíveis para virar precificadores são os ativos no cadastro do IPA. Tratamento de usuários desativados que tinham atribuições (manter como "órfão", remover atribuição, marcar como inválida) é delegado ao Administrativo geral.
- Os níveis hierárquicos de categoria disponíveis para escolha (Departamento, Categoria, Subcategoria, etc.) vêm da aba **"Níveis de Categoria"** do Administrativo IPA, já existente — esta seção apenas seleciona entre eles, não cria nem edita níveis.
- Para fins de prototipia, o ambiente de dados realistas inclui: seed de usuários IPA (variando em quantidade de atribuições), árvore de categorias com pelo menos 3 níveis hierárquicos, e algumas atribuições pré-existentes (incluindo pelo menos um caso de sobreposição) para demonstrar o estado "default" da seção.
- O comportamento do filtro de precificador quanto a produtos de categorias sem precificador configurado (aparecer normalmente, sumir quando filtro ativo, indicação especial) é decisão da Fase 2 e está fora do escopo desta spec — a tela de configuração desta fase não promete nem nega comportamento específico do filtro futuro.
- Persistência durante prototipia é responsabilidade do browser (conforme Stack & Persistência da Constitution); persistência em produção é responsabilidade do backend e está fora do escopo desta spec funcional.

## Áreas de Exploração no Protótipo

Refinamentos esperados a serem investigados na prototipia (não-bloqueantes, sujeitos a descoberta — Princípio II e III da Constitution):

- **Visão alternativa "por categoria"**: além da lista agrupada por precificador (visão default), explorar uma visão complementar agrupada por categoria — útil pra responder "quem cuida disso?" e tornar sobreposição mais óbvia. Pode entrar como toggle, aba secundária ou painel lateral; o protótipo propõe e produto valida.
- **Sinalização visual de sobreposição**: o FR-008 exige que sobreposição seja visível, mas a forma exata (ícone, contagem, agrupamento, tooltip com nomes) é decisão de prototipia.
- **Posição da nova entrada "Precificadores" na sidebar do Administrativo IPA**: ordem temática vs. alfabética vs. inserção no fim — protótipo testa.
- **Apresentação da escolha do nível global**: card dedicado no topo, seção colapsável, modal único na primeira entrada — protótipo testa.

## Dependencies

- **Cadastro de usuários do IPA** (read-only, fora do escopo) — fonte dos candidatos a precificadores. Acessado via aba "Pessoas" do Administrativo.
- **Aba "Níveis de Categoria"** do Administrativo IPA (read-only para esta seção, fora do escopo) — define o catálogo de níveis hierárquicos disponíveis (Departamento, Categoria, Subcategoria etc.). A seção "Precificadores" apenas seleciona um dos níveis já publicados nessa aba; não cria nem edita níveis.
- **Árvore hierárquica de categorias do IPA** (read-only, fora do escopo) — fornece as categorias propriamente ditas no nível global selecionado.
- **Permissão de "Administrador" do IPA** (read-only, fora do escopo) — controla acesso à nova seção, no mesmo modelo das demais abas do Administrativo.

## UI Context

A seção "Precificadores" é uma **nova entrada na sidebar do Administrativo IPA**, no mesmo padrão das abas existentes ("Configurações Básicas", "Dados de concorrência", "Segmentação de Produtos", "Níveis de Categoria", "Lojas e Clusters", "Canais de Venda", "Farma", "Campanhas promocionais"). O shell e a navegação herdam o padrão atual:

- Header InfoPrice fixo no topo, com tabs "Pessoas" e "Produtos".
- Dentro de "Produtos", a aba ativa é "IPA | Software de Precificação".
- Sidebar à esquerda lista as seções do IPA; conteúdo à direita em cards.
- Botão "Voltar" no topo do conteúdo.

A posição da nova entrada no menu lateral será definida no plano (provavelmente próxima a "Níveis de Categoria" e "Lojas e Clusters" por afinidade temática), respeitando o padrão visual existente.

## Out of Scope

- Filtro de precificador no Gerenciador de Preços (Fase 2).
- Filtro de precificador nas telas de Negociação (Fase 3).
- Filtro de precificador em Extração, Atacado, Margem Objetiva e demais módulos (Fase 4).
- **Cadastro/edição/desativação de usuários do IPA** — usuários já existem no Administrativo (aba "Pessoas"). A seção "Precificadores" apenas seleciona entre eles.
- **Criação/edição de níveis hierárquicos de categoria** — níveis já existem no Administrativo (aba "Níveis de Categoria"). A seção "Precificadores" apenas seleciona um nível existente.
- **Criação/edição de categorias** — a árvore de categorias do IPA já existe. A seção "Precificadores" apenas lê e permite selecioná-las no nível global vigente.
- **Toda a Fase 1 produz, como dado novo, apenas: (1) o nível global escolhido e (2) as atribuições (usuário × categoria).** Tudo o mais é entrada read-only do sistema.
- Definição da política de produtos em categorias sem precificador atribuído quando o filtro está ativo (decisão da Fase 2).
- Backend e persistência em produção — esta spec é o contrato funcional; estratégia técnica vive no plano de implementação.
