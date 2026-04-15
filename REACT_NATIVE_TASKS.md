# 📱 Plotwist - Tarefas para App React Native

Este documento contém o mapeamento completo das funcionalidades do site web e as tarefas necessárias para criar um aplicativo React Native equivalente.

---

## 📋 Índice

1. [Setup Inicial](#1-setup-inicial)
2. [Autenticação](#2-autenticação)
3. [Navegação](#3-navegação)
4. [Home/Dashboard](#4-homedashboard)
5. [Catálogo de Filmes](#5-catálogo-de-filmes)
6. [Catálogo de Séries](#6-catálogo-de-séries)
7. [Detalhes de Mídia](#7-detalhes-de-mídia)
8. [Sistema de Reviews](#8-sistema-de-reviews)
9. [Listas Personalizadas](#9-listas-personalizadas)
10. [Perfil do Usuário](#10-perfil-do-usuário)
11. [Coleção do Usuário](#11-coleção-do-usuário)
12. [Estatísticas](#12-estatísticas)
13. [Sistema Social](#13-sistema-social)
14. [Busca](#14-busca)
15. [Configurações](#15-configurações)
16. [Internacionalização](#16-internacionalização)
17. [Funcionalidades Premium](#17-funcionalidades-premium)
18. [Importação de Dados](#18-importação-de-dados)

---

## 1. Setup Inicial

### 1.1 Configuração do Projeto
- [ ] Criar projeto com Expo ou React Native CLI
- [ ] Configurar TypeScript
- [ ] Configurar ESLint e Prettier (usar biome como no web)
- [ ] Configurar path aliases (@/ para src/)

### 1.2 Dependências Principais
- [ ] Instalar React Navigation (navegação)
- [ ] Instalar React Query / TanStack Query (gerenciamento de estado servidor)
- [ ] Instalar Axios (requisições HTTP)
- [ ] Instalar React Hook Form + Zod (formulários e validação)
- [ ] Instalar AsyncStorage (persistência local)
- [ ] Instalar react-native-fast-image (imagens otimizadas)
- [ ] Instalar react-native-reanimated (animações)
- [ ] Instalar Nativewind ou Tamagui (estilização)

### 1.3 Configuração de Ambiente
- [ ] Criar arquivo de configuração de ambiente (.env)
- [ ] Configurar variáveis: `API_URL`, `TMDB_API_KEY`
- [ ] Criar serviço de API base (axios instance)

### 1.4 Estrutura de Pastas
```
src/
├── api/              # Serviços de API (mesmo padrão do web)
├── components/       # Componentes reutilizáveis
├── screens/          # Telas do app
├── navigation/       # Configuração de navegação
├── context/          # Contextos React
├── hooks/            # Hooks customizados
├── types/            # Tipos TypeScript
├── utils/            # Utilitários
└── i18n/             # Internacionalização
```

---

## 2. Autenticação

### 2.1 Telas de Auth
- [ ] **Tela de Login**
  - [ ] Campo de login (email ou username)
  - [ ] Campo de senha com toggle de visibilidade
  - [ ] Botão de login
  - [ ] Link para "Esqueci a senha"
  - [ ] Link para cadastro
  - [ ] Validação com Zod

- [ ] **Tela de Cadastro**
  - [ ] Campo de username (validação de disponibilidade)
  - [ ] Campo de email (validação de disponibilidade)
  - [ ] Campo de senha (mínimo 8 caracteres)
  - [ ] Validação em tempo real
  - [ ] Termos de uso

- [ ] **Tela de Esqueci a Senha**
  - [ ] Campo de email
  - [ ] Envio de email de recuperação

- [ ] **Tela de Reset de Senha**
  - [ ] Campo de nova senha
  - [ ] Confirmação de senha
  - [ ] Validação de token

### 2.2 Gerenciamento de Sessão
- [ ] Armazenar token JWT no AsyncStorage/SecureStore
- [ ] Criar contexto de autenticação (SessionContext)
- [ ] Implementar refresh de sessão
- [ ] Implementar logout
- [ ] Proteção de rotas autenticadas

---

## 3. Navegação

### 3.1 Estrutura de Navegação
- [ ] **Tab Navigator Principal**
  - [ ] Home
  - [ ] Filmes
  - [ ] Séries
  - [ ] Busca
  - [ ] Perfil

- [ ] **Stack Navigators**
  - [ ] Stack de Autenticação (Login, Cadastro, Reset)
  - [ ] Stack de Filmes (Lista, Detalhes)
  - [ ] Stack de Séries (Lista, Detalhes, Temporadas, Episódios)
  - [ ] Stack de Listas (Minhas Listas, Detalhes da Lista)
  - [ ] Stack de Perfil (Perfil, Editar, Configurações)

### 3.2 Deep Linking
- [ ] Configurar deep links para filmes
- [ ] Configurar deep links para séries
- [ ] Configurar deep links para listas
- [ ] Configurar deep links para perfis

---

## 4. Home/Dashboard

### 4.1 Componentes da Home
- [ ] **Header**
  - [ ] Logo
  - [ ] Botão de busca
  - [ ] Avatar do usuário (se logado)

- [ ] **Seção: Última Review do Usuário**
  - [ ] Card com a última review feita
  - [ ] Link para o item avaliado

- [ ] **Seção: Reviews Populares**
  - [ ] Lista horizontal de reviews em destaque
  - [ ] Filtros por período (hoje, semana, mês, todos)
  - [ ] Paginação infinita

- [ ] **Seção: Atividades da Rede**
  - [ ] Feed de atividades de usuários seguidos
  - [ ] Tipos de atividade:
    - [ ] Mudança de status (watched, watching, etc)
    - [ ] Nova review criada
    - [ ] Nova lista criada
    - [ ] Follow/Unfollow
    - [ ] Episódios assistidos
    - [ ] Likes em reviews/listas

- [ ] **Sidebar: Filmes Populares**
  - [ ] Grid 3x1 de posters
  - [ ] Link para ver mais

- [ ] **Sidebar: Séries Populares**
  - [ ] Grid 3x1 de posters
  - [ ] Link para ver mais

---

## 5. Catálogo de Filmes

### 5.1 Telas de Listagem
- [ ] **Filmes Populares**
  - [ ] Lista em grid com posters
  - [ ] Paginação infinita
  - [ ] Pull to refresh

- [ ] **Em Cartaz (Now Playing)**
  - [ ] Lista de filmes em exibição

- [ ] **Em Breve (Upcoming)**
  - [ ] Lista de lançamentos futuros

- [ ] **Mais Bem Avaliados (Top Rated)**
  - [ ] Lista ordenada por rating

- [ ] **Descobrir Filmes**
  - [ ] Filtros avançados:
    - [ ] Gêneros (múltipla seleção)
    - [ ] Ano de lançamento
    - [ ] Nota mínima
    - [ ] Ordenação (popularidade, data, nota)
    - [ ] Provedores de streaming
    - [ ] Região

### 5.2 Componentes de Filme
- [ ] **PosterCard**
  - [ ] Imagem do poster
  - [ ] Título
  - [ ] Ano
  - [ ] Rating

- [ ] **MovieListFilters**
  - [ ] Bottom sheet com filtros
  - [ ] Chips de gêneros
  - [ ] Slider de rating
  - [ ] Date picker para ano

---

## 6. Catálogo de Séries

### 6.1 Telas de Listagem
- [ ] **Séries Populares**
  - [ ] Lista em grid com posters
  - [ ] Paginação infinita

- [ ] **No Ar Hoje (Airing Today)**
  - [ ] Séries com episódios hoje

- [ ] **Em Exibição (On The Air)**
  - [ ] Séries em exibição atual

- [ ] **Mais Bem Avaliadas (Top Rated)**
  - [ ] Lista ordenada por rating

- [ ] **Descobrir Séries**
  - [ ] Mesmos filtros dos filmes
  - [ ] Filtro adicional: status (em andamento, finalizada)

### 6.2 Categorias Especiais
- [ ] **Animes**
  - [ ] Filtro pré-aplicado para animação japonesa
  
- [ ] **Doramas**
  - [ ] Filtro pré-aplicado para séries coreanas

---

## 7. Detalhes de Mídia

### 7.1 Tela de Detalhes de Filme
- [ ] **Banner/Backdrop**
  - [ ] Imagem de fundo com gradiente
  - [ ] Botão de voltar

- [ ] **Informações Principais**
  - [ ] Poster
  - [ ] Título (original e traduzido)
  - [ ] Ano de lançamento
  - [ ] Duração
  - [ ] Gêneros (chips clicáveis)
  - [ ] Sinopse (expandível)
  - [ ] Rating TMDB

- [ ] **Ações do Usuário**
  - [ ] Botão de Status (Watchlist, Watching, Watched, Dropped)
  - [ ] Botão de Adicionar à Lista
  - [ ] Botão de Escrever Review

- [ ] **Informações Adicionais**
  - [ ] Diretor
  - [ ] Elenco principal (lista horizontal)
  - [ ] Orçamento e Receita
  - [ ] Idioma original
  - [ ] País de produção

- [ ] **Seções em Abas**
  - [ ] Reviews (do app)
  - [ ] Elenco e Equipe completos
  - [ ] Imagens (posters, backdrops)
  - [ ] Vídeos (trailers, teasers)
  - [ ] Filmes Relacionados
  - [ ] Onde Assistir (streaming)

- [ ] **Coleção**
  - [ ] Se pertence a uma coleção, mostrar outros filmes

### 7.2 Tela de Detalhes de Série
- [ ] Todos os itens de filme +
- [ ] **Lista de Temporadas**
  - [ ] Cards de cada temporada
  - [ ] Número de episódios
  - [ ] Data de exibição
  - [ ] Progresso de assistidos

- [ ] **Progresso da Série**
  - [ ] Barra de progresso geral
  - [ ] Episódios assistidos / Total

### 7.3 Tela de Temporada
- [ ] Informações da temporada
- [ ] Lista de episódios
- [ ] Botão "Marcar todos como assistidos"
- [ ] Navegação entre temporadas

### 7.4 Tela de Episódio
- [ ] Informações do episódio
- [ ] Sinopse
- [ ] Elenco convidado
- [ ] Botão de marcar como assistido
- [ ] Seção de review do episódio
- [ ] Navegação entre episódios

### 7.5 Tela de Pessoa (Ator/Diretor)
- [ ] Foto
- [ ] Nome
- [ ] Biografia
- [ ] Data de nascimento
- [ ] Local de nascimento
- [ ] Filmografia (filmes e séries)

---

## 8. Sistema de Reviews

### 8.1 Componentes de Review
- [ ] **ReviewItem**
  - [ ] Avatar do usuário
  - [ ] Username (link para perfil)
  - [ ] Rating (estrelas)
  - [ ] Texto da review
  - [ ] Data
  - [ ] Badge de PRO
  - [ ] Indicador de spoiler
  - [ ] Contador de likes
  - [ ] Botão de like
  - [ ] Botão de responder
  - [ ] Menu de ações (editar, excluir)

- [ ] **ReviewFormDialog**
  - [ ] Modal/Bottom sheet
  - [ ] Seletor de rating (0-10 ou estrelas)
  - [ ] Campo de texto da review
  - [ ] Toggle de spoiler
  - [ ] Botão de publicar

- [ ] **ReviewReply**
  - [ ] Lista de respostas
  - [ ] Formulário de resposta
  - [ ] Like em respostas

### 8.2 Listagem de Reviews
- [ ] Reviews do item (filme/série/episódio)
- [ ] Reviews do usuário (no perfil)
- [ ] Reviews populares (na home)
- [ ] Filtros por idioma
- [ ] Ordenação (data, likes)

---

## 9. Listas Personalizadas

### 9.1 Telas de Listas
- [ ] **Minhas Listas**
  - [ ] Grid de listas do usuário
  - [ ] Botão de criar nova lista
  - [ ] Pull to refresh

- [ ] **Descobrir Listas**
  - [ ] Listas públicas populares
  - [ ] Filtro por listas com banner

- [ ] **Detalhes da Lista**
  - [ ] Banner customizável
  - [ ] Título e descrição
  - [ ] Criador (link para perfil)
  - [ ] Contador de likes
  - [ ] Botão de like
  - [ ] Progresso (itens assistidos)
  - [ ] Grid de itens da lista
  - [ ] Reordenação por drag and drop (modo edição)
  - [ ] Botão de adicionar item

### 9.2 Formulário de Lista
- [ ] Campo de título
- [ ] Campo de descrição
- [ ] Seletor de visibilidade (Pública, Rede, Privada)
- [ ] Upload de banner (image picker)

### 9.3 Adicionar Item à Lista
- [ ] Busca de filme/série
- [ ] Quick add (a partir da tela de detalhes)
- [ ] Sugestões baseadas em outras listas

---

## 10. Perfil do Usuário

### 10.1 Tela de Perfil
- [ ] **Header do Perfil**
  - [ ] Banner customizável
  - [ ] Avatar customizável
  - [ ] Username
  - [ ] Badge PRO (se aplicável)
  - [ ] Biografia
  - [ ] Botão de seguir/deixar de seguir
  - [ ] Botão de editar (próprio perfil)

- [ ] **Estatísticas Resumidas**
  - [ ] Filmes assistidos
  - [ ] Séries assistidas
  - [ ] Seguidores
  - [ ] Seguindo

- [ ] **Links Sociais**
  - [ ] Instagram
  - [ ] TikTok
  - [ ] YouTube
  - [ ] X (Twitter)

- [ ] **Navegação em Abas**
  - [ ] Atividades
  - [ ] Coleção
  - [ ] Listas
  - [ ] Reviews
  - [ ] Estatísticas

### 10.2 Edição de Perfil
- [ ] Upload de avatar (image picker + crop)
- [ ] Upload de banner (image picker + crop)
- [ ] Edição de username
- [ ] Edição de biografia
- [ ] Edição de links sociais

---

## 11. Coleção do Usuário

### 11.1 Tela de Coleção
- [ ] **Filtros**
  - [ ] Status (Todos, Watchlist, Watching, Watched, Dropped)
  - [ ] Tipo de mídia (Filmes, Séries, Ambos)
  - [ ] Rating dado
  - [ ] Ordenação (data adição, data atualização, rating)
  - [ ] Apenas sem review

- [ ] **Lista de Itens**
  - [ ] Grid de posters
  - [ ] Indicador de status
  - [ ] Rating dado (se existir)
  - [ ] Paginação infinita

### 11.2 Gestão de Itens
- [ ] Alterar status rapidamente
- [ ] Remover da coleção
- [ ] Ver detalhes

---

## 12. Estatísticas

### 12.1 Tela de Estatísticas do Usuário
- [ ] **Total de Horas**
  - [ ] Cálculo baseado em runtime dos filmes
  - [ ] Cálculo baseado em episódios assistidos

- [ ] **Contagem de Reviews**
  - [ ] Total de reviews feitas

- [ ] **Séries Mais Assistidas**
  - [ ] Top 5 séries por episódios
  - [ ] Gráfico de barras

- [ ] **Gêneros Assistidos**
  - [ ] Distribuição por gênero
  - [ ] Gráfico de pizza/barras

- [ ] **Atores Mais Vistos**
  - [ ] Top atores nas mídias assistidas

- [ ] **Países de Produção**
  - [ ] Mapa ou lista de países
  - [ ] Distribuição por país

- [ ] **Melhores Avaliações**
  - [ ] Itens com nota 10
  - [ ] Média geral do usuário

- [ ] **Status das Mídias**
  - [ ] Distribuição por status
  - [ ] Gráfico de pizza

---

## 13. Sistema Social

### 13.1 Followers/Following
- [ ] **Lista de Seguidores**
  - [ ] Avatar
  - [ ] Username
  - [ ] Botão de seguir de volta
  - [ ] Paginação infinita

- [ ] **Lista de Seguindo**
  - [ ] Avatar
  - [ ] Username
  - [ ] Botão de deixar de seguir
  - [ ] Paginação infinita

### 13.2 Busca de Usuários
- [ ] Busca por username
- [ ] Resultados em tempo real
- [ ] Indicador se já segue

### 13.3 Likes
- [ ] Like em reviews
- [ ] Like em respostas
- [ ] Like em listas
- [ ] Animação de like
- [ ] Lista de quem curtiu

---

## 14. Busca

### 14.1 Tela de Busca
- [ ] **Campo de Busca**
  - [ ] Debounce de 300ms
  - [ ] Limpeza rápida
  - [ ] Histórico de buscas recentes

- [ ] **Resultados Multi-tipo**
  - [ ] Seção de Filmes
  - [ ] Seção de Séries
  - [ ] Seção de Pessoas
  - [ ] Ver todos de cada tipo

### 14.2 Command Search (Quick Search)
- [ ] Atalho para busca rápida (pull down?)
- [ ] Resultados inline
- [ ] Navegação por teclado (se tablet)

---

## 15. Configurações

### 15.1 Preferências do Usuário
- [ ] **Preferências de Streaming**
  - [ ] Seleção de provedores favoritos
  - [ ] Região de streaming

- [ ] **Preferências de Exibição**
  - [ ] Tema (claro, escuro, sistema)
  - [ ] Idioma do app
  - [ ] Idioma preferido para dados do TMDB

### 15.2 Conta
- [ ] Alterar senha
- [ ] Notificações
- [ ] Privacidade
- [ ] Excluir conta
- [ ] Logout

---

## 16. Internacionalização

### 16.1 Idiomas Suportados
- [ ] Português (pt-BR)
- [ ] Inglês (en-US)
- [ ] Espanhol (es-ES)
- [ ] Francês (fr-FR)
- [ ] Alemão (de-DE)
- [ ] Italiano (it-IT)
- [ ] Japonês (ja-JP)

### 16.2 Implementação
- [ ] Instalar i18next + react-i18next
- [ ] Copiar dicionários do web (public/dictionaries/)
- [ ] Criar contexto de idioma
- [ ] Persistir preferência de idioma

---

## 17. Funcionalidades Premium (PRO)

### 17.1 Features PRO
- [ ] Badge PRO no perfil
- [ ] Importação de dados externos
- [ ] [Outras features PRO a definir]

### 17.2 Integração com Pagamento
- [ ] Tela de Pricing
- [ ] Integração com Stripe (via WebView ou deeplinking)
- [ ] Ou: usar In-App Purchases nativas

---

## 18. Importação de Dados

### 18.1 Provedores Suportados
- [ ] **MyAnimeList**
  - [ ] Upload de arquivo XML
  - [ ] Processamento e mapeamento

- [ ] **Letterboxd**
  - [ ] Upload de arquivo CSV
  - [ ] Processamento e mapeamento

### 18.2 Tela de Importação
- [ ] Seleção de provedor
- [ ] Upload de arquivo (document picker)
- [ ] Progresso de importação
- [ ] Resultados (sucesso/falha por item)

---

## 🎨 Componentes UI Reutilizáveis

### Componentes Base
- [ ] Button (variantes: default, outline, ghost, destructive)
- [ ] Input
- [ ] Textarea
- [ ] Select / Picker
- [ ] Checkbox
- [ ] Switch
- [ ] Slider
- [ ] Avatar
- [ ] Badge
- [ ] Card
- [ ] Skeleton
- [ ] Toast / Snackbar
- [ ] Dialog / Modal
- [ ] Bottom Sheet
- [ ] Tabs
- [ ] Accordion
- [ ] Separator

### Componentes de Mídia
- [ ] PosterCard
- [ ] PosterGrid
- [ ] Banner
- [ ] PersonCard
- [ ] RatingStars
- [ ] StatusBadge
- [ ] GenreChip

### Componentes de Interação
- [ ] LikeButton (com animação)
- [ ] FollowButton
- [ ] StatusDropdown
- [ ] AddToListButton
- [ ] ShareButton

---

## 📱 Considerações Mobile-Specific

### UX Nativa
- [ ] Gestos de swipe para navegação
- [ ] Pull to refresh em todas as listas
- [ ] Haptic feedback em ações importantes
- [ ] Splash screen
- [ ] App icon

### Performance
- [ ] Lazy loading de imagens
- [ ] Cache de imagens com react-native-fast-image
- [ ] Virtualização de listas longas (FlashList)
- [ ] Skeleton loading em todas as telas

### Offline
- [ ] Cache de dados visualizados recentemente
- [ ] Indicador de modo offline
- [ ] Retry automático quando online

### Push Notifications (Futuro)
- [ ] Novo seguidor
- [ ] Like na review
- [ ] Resposta na review
- [ ] Lançamento de filme/série na watchlist

---

## 📊 Estimativa de Complexidade

| Módulo | Complexidade | Prioridade |
|--------|--------------|------------|
| Setup Inicial | Baixa | Alta |
| Autenticação | Média | Alta |
| Navegação | Média | Alta |
| Catálogo de Filmes | Média | Alta |
| Catálogo de Séries | Média | Alta |
| Detalhes de Mídia | Alta | Alta |
| Sistema de Reviews | Alta | Alta |
| Listas | Alta | Média |
| Perfil | Média | Alta |
| Coleção | Média | Média |
| Estatísticas | Alta | Baixa |
| Sistema Social | Média | Média |
| Busca | Baixa | Alta |
| Configurações | Baixa | Baixa |
| i18n | Média | Média |
| Premium | Média | Baixa |
| Importação | Alta | Baixa |

---

## 🚀 Sugestão de Sprints

### Sprint 1 - MVP Base (2-3 semanas)
- Setup inicial
- Autenticação (login/cadastro)
- Navegação básica
- Catálogo de filmes (popular, detalhes)
- Busca simples

### Sprint 2 - Core Features (2-3 semanas)
- Catálogo de séries
- Sistema de status (watchlist, watched, etc)
- Perfil básico
- Coleção do usuário

### Sprint 3 - Social Features (2 semanas)
- Sistema de reviews completo
- Likes
- Follow/Unfollow
- Feed de atividades

### Sprint 4 - Listas e Polish (2 semanas)
- Listas personalizadas
- Detalhes de temporadas/episódios
- Internacionalização
- Performance e polish

### Sprint 5 - Extras (1-2 semanas)
- Estatísticas
- Configurações avançadas
- Funcionalidades PRO
- Importação de dados

---

## 📚 Referências

- **API Backend**: `apps/api/` - Mesma API usada pelo web
- **Schemas Gerados**: `apps/web/src/api/endpoints.schemas.ts`
- **Dicionários i18n**: `apps/web/public/dictionaries/`
- **Componentes Web**: `apps/web/src/components/` (referência de UI)
- **Serviços TMDB**: `apps/web/src/services/tmdb.ts`

---

*Documento gerado em: Janeiro 2026*
*Versão do projeto web: 0.1.0*
