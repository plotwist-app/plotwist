# 📱 Plotwist - Tarefas para App iOS Nativo

Este documento contém o mapeamento completo das funcionalidades do site web e as tarefas necessárias para criar um aplicativo iOS nativo usando Swift e SwiftUI.

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

- [ ] Criar projeto Xcode com SwiftUI
- [ ] Configurar versões mínimas (iOS 16+)
- [ ] Configurar SwiftLint para linting
- [ ] Configurar SwiftFormat para formatação
- [ ] Configurar esquemas de build (Debug, Release)
- [ ] Configurar Code Signing & Capabilities

### 1.2 Gerenciador de Dependências

- [ ] Escolher Swift Package Manager (SPM) como principal
- [ ] Configurar estrutura de dependências

### 1.3 Dependências Principais

- [ ] **Alamofire** - Requisições HTTP
- [ ] **Kingfisher** - Cache e carregamento de imagens
- [ ] **KeychainAccess** - Armazenamento seguro de tokens
- [ ] **SwiftUIIntrospect** - Acesso a UIKit quando necessário
- [ ] **Lottie** - Animações complexas (opcional)
- [ ] **SwiftUICharts** ou **Charts (Apple)** - Gráficos para estatísticas

### 1.4 Arquitetura

- [ ] **Padrão MVVM** (Model-View-ViewModel)
- [ ] **Combine** para gerenciamento de estado reativo
- [ ] **async/await** para operações assíncronas
- [ ] **Protocol-oriented programming** para abstrações

### 1.5 Configuração de Ambiente

- [ ] Criar arquivo de configuração `Configuration.swift`
- [ ] Configurar variáveis: `API_BASE_URL`, `TMDB_API_KEY`
- [ ] Criar diferentes configurações para Debug/Release
- [ ] Usar `xcconfig` files para variáveis de ambiente

### 1.6 Estrutura de Pastas

```
Plotwist/
├── App/
│   ├── PlotwistApp.swift       # Entry point ✅
│   └── RootView.swift          # Root navigation ✅
│   └── AppDelegate.swift       # Lifecycle
├── Core/
│   ├── Network/                 # Networking layer
│   │   ├── APIClient.swift
│   │   ├── APIEndpoint.swift
│   │   └── APIError.swift
│   ├── Storage/                 # Persistência
│   │   ├── UserDefaults/
│   │   ├── Keychain/
│   │   └── CoreData/ (opcional)
│   └── Extensions/              # Swift extensions
├── Models/                      # Modelos de dados (Codable)
├── ViewModels/                  # ViewModels (ObservableObject)
│   └── LoginViewModel.swift    # ✅
├── Views/                       # SwiftUI Views
│   ├── Auth/                    # ✅
│   │   ├── LoginView.swift     # ✅
│   │   └── SignUpView.swift    # ✅ (placeholder)
│   ├── Home/                    # ✅
│   │   └── HomeView.swift      # ✅
│   ├── Movies/
│   ├── Series/
│   ├── Profile/
│   ├── Lists/
│   └── Components/              # Componentes reutilizáveis
├── Services/                    # Serviços de negócio
│   └── AuthService.swift        # ✅
│   ├── MovieService.swift
│   ├── ReviewService.swift
│   └── ...
├── Models/                      # ✅
│   └── User.swift              # ✅
├── Extensions/                  # ✅
│   ├── NotificationName+Extensions.swift  # ✅
│   └── View+Extensions.swift   # ✅
├── Utils/                       # Utilitários ✅
│   ├── Constants.swift         # ✅
│   ├── Localizable.swift       # ✅
│   ├── Formatters.swift
│   └── Validators.swift
├── Resources/
│   ├── Assets.xcassets          # Imagens e cores
│   ├── Localizable/             # i18n strings
│   └── Fonts/
└── Configuration/
    ├── Debug.xcconfig
    └── Release.xcconfig
```

---

## 2. Autenticação

### 2.1 Views de Auth

- [x] **LoginView** ✅

  - [x] TextField para login (email ou username)
  - [x] SecureField para senha com botão de toggle
  - [x] Botão de login com loading state
  - [ ] NavigationLink para "Esqueci a senha"
  - [x] NavigationLink para cadastro
  - [x] Validação com Property Wrappers

- [ ] **SignUpView** (placeholder criado)

  - [ ] TextField para username com validação em tempo real
  - [ ] TextField para email com validação
  - [ ] SecureField para senha (mínimo 8 caracteres)
  - [ ] Força da senha visual
  - [ ] Toggle de termos de uso
  - [ ] Validação inline

- [ ] **ForgotPasswordView**

  - [ ] TextField para email
  - [ ] Botão de envio com confirmação
  - [ ] Feedback de sucesso/erro

- [ ] **ResetPasswordView**
  - [ ] SecureField para nova senha
  - [ ] SecureField para confirmação
  - [ ] Validação de token via deep link

### 2.2 ViewModels

- [x] **LoginViewModel** ✅
  - [x] `@Published var isLoading: Bool`
  - [x] `@Published var errorMessage: String?`
  - [x] Validação de campos
  - [x] Método: `login()`
  - [ ] Método: `signUp()`

### 2.3 Gerenciamento de Sessão

- [x] **AuthService** (singleton criado) ✅
  - [x] Armazenar JWT no UserDefaults (migrar para Keychain)
  - [x] Métodos: `signIn()`, `signOut()`, `getToken()`, `isAuthenticated()`
  - [x] Integração com API
  - [x] NotificationCenter para mudanças de estado
- [ ] Armazenar JWT no Keychain via KeychainAccess (recomendado)
- [ ] Implementar auto-refresh de token
- [ ] Interceptor para adicionar token automaticamente
- [ ] Proteção de rotas com `@EnvironmentObject`

### 2.4 Biometria (Opcional)

- [ ] Face ID / Touch ID para login rápido
- [ ] LocalAuthentication framework
- [ ] Salvar preferência no UserDefaults

---

## 3. Navegação

### 3.1 Estrutura de Navegação

- [ ] **TabView Principal**

  - [ ] Home
  - [ ] Filmes
  - [ ] Séries
  - [ ] Busca
  - [ ] Perfil

- [ ] **NavigationStack** (iOS 16+)
  - [ ] Stack de Autenticação
  - [ ] Stack de Filmes (Lista, Detalhes)
  - [ ] Stack de Séries (Lista, Detalhes, Temporadas, Episódios)
  - [ ] Stack de Listas
  - [ ] Stack de Perfil

### 3.2 Deep Linking

- [ ] Configurar URL Schemes no Info.plist
- [ ] Configurar Universal Links (Associated Domains)
- [ ] Implementar `.onOpenURL()` modifier
- [ ] Rotas:
  - [ ] `plotwist://movie/:id`
  - [ ] `plotwist://series/:id`
  - [ ] `plotwist://list/:id`
  - [ ] `plotwist://user/:username`

### 3.3 Coordenação

- [ ] Criar `Router` ou `Coordinator` para navegação complexa
- [ ] Implementar `NavigationPath` gerenciado

---

## 4. Home/Dashboard

### 4.1 Componentes da Home

- [ ] **Header**

  - [ ] Logo (SF Symbol ou custom)
  - [ ] Botão de busca (magnifyingglass.circle)
  - [ ] AsyncImage para avatar do usuário

- [ ] **LastUserReviewSection**

  - [ ] Card customizado com última review
  - [ ] NavigationLink para o item
  - [ ] Skeleton loading

- [ ] **PopularReviewsSection**

  - [ ] ScrollView horizontal com LazyHStack
  - [ ] Picker para filtros (hoje, semana, mês, todos)
  - [ ] Pull to refresh
  - [ ] Infinite scroll com `.onAppear` no último item

- [ ] **NetworkActivityFeedSection**

  - [ ] LazyVStack com atividades
  - [ ] Tipos de atividade:
    - [ ] Status change
    - [ ] Nova review
    - [ ] Nova lista
    - [ ] Follow/Unfollow
    - [ ] Episódios assistidos
    - [ ] Likes

- [ ] **SidebarPopularMovies** (iPad)

  - [ ] Grid 3x1 de posters
  - [ ] NavigationLink para lista completa

- [ ] **SidebarPopularSeries** (iPad)
  - [ ] Grid 3x1 de posters
  - [ ] NavigationLink para lista completa

### 4.2 ViewModel

- [ ] **HomeViewModel**
  - [ ] Carregar dados em paralelo com `async let`
  - [ ] Gerenciar estados de loading/error
  - [ ] Pagination para reviews

---

## 5. Catálogo de Filmes

### 5.1 Views de Listagem

- [ ] **PopularMoviesView**

  - [ ] LazyVGrid com posters
  - [ ] Pull to refresh
  - [ ] Infinite scroll
  - [ ] Skeleton placeholders

- [ ] **NowPlayingMoviesView**

  - [ ] Lista de filmes em cartaz
  - [ ] Badge "Em Cartaz"

- [ ] **UpcomingMoviesView**

  - [ ] Lista de lançamentos futuros
  - [ ] Data de lançamento em destaque

- [ ] **TopRatedMoviesView**

  - [ ] Lista ordenada por rating
  - [ ] Rating TMDB visível

- [ ] **DiscoverMoviesView**
  - [ ] Filtros avançados via Sheet:
    - [ ] MultiSelector de gêneros
    - [ ] Slider para ano (Date picker range)
    - [ ] Slider para nota mínima
    - [ ] Picker de ordenação
    - [ ] MultiSelector de provedores de streaming
    - [ ] Picker de região

### 5.2 Componentes de Filme

- [ ] **MoviePosterCard**

  - [ ] KFImage (Kingfisher) para poster
  - [ ] VStack com título, ano, rating
  - [ ] Gradient overlay
  - [ ] Tap gesture para navegação

- [ ] **MovieFiltersSheet**
  - [ ] Sheet modal com ScrollView
  - [ ] GenreChipGrid (FlowLayout)
  - [ ] Custom Slider views
  - [ ] Date picker para ano
  - [ ] Botões "Aplicar" e "Limpar"

### 5.3 ViewModels

- [ ] **MoviesListViewModel**
  - [ ] `@Published var movies: [Movie]`
  - [ ] `@Published var filters: MovieFilters`
  - [ ] Métodos de fetch com paginação

---

## 6. Catálogo de Séries

### 6.1 Views de Listagem

- [ ] **PopularSeriesView**

  - [ ] LazyVGrid com posters
  - [ ] Infinite scroll

- [ ] **AiringTodaySeriesView**

  - [ ] Séries com episódios hoje
  - [ ] Badge "Hoje"

- [ ] **OnTheAirSeriesView**

  - [ ] Séries em exibição
  - [ ] Status de exibição

- [ ] **TopRatedSeriesView**

  - [ ] Lista ordenada por rating

- [ ] **DiscoverSeriesView**
  - [ ] Mesmos filtros dos filmes
  - [ ] Filtro adicional: status (em andamento, finalizada)

### 6.2 Categorias Especiais

- [ ] **AnimesView**
  - [ ] Filtro pré-aplicado para animação japonesa
  - [ ] Estilo visual customizado (opcional)
- [ ] **DoramasView**
  - [ ] Filtro pré-aplicado para séries coreanas

### 6.3 ViewModels

- [ ] **SeriesListViewModel**
  - [ ] Similar ao MoviesListViewModel
  - [ ] Filtros específicos de séries

---

## 7. Detalhes de Mídia

### 7.1 MovieDetailView

- [ ] **Header com Backdrop**

  - [ ] ZStack com KFImage
  - [ ] LinearGradient overlay
  - [ ] Botão de voltar customizado
  - [ ] Parallax scroll effect (opcional)

- [ ] **Informações Principais**

  - [ ] HStack com poster + info
  - [ ] Títulos (original e traduzido)
  - [ ] Year, runtime, genres
  - [ ] Sinopse expandível com "Ler mais"
  - [ ] Rating TMDB com SF Symbols (star.fill)

- [ ] **Ações do Usuário**

  - [ ] Menu de Status (Watchlist, Watching, Watched, Dropped)
  - [ ] Botão "Adicionar à Lista"
  - [ ] Botão "Escrever Review"
  - [ ] Animações de feedback

- [ ] **Informações Adicionais**

  - [ ] Diretor
  - [ ] Elenco - ScrollView horizontal
  - [ ] Orçamento e Receita formatados
  - [ ] Idioma original
  - [ ] Países de produção

- [ ] **TabView para Seções**

  - [ ] Reviews do app
  - [ ] Elenco completo (List)
  - [ ] Galeria de imagens (LazyVGrid)
  - [ ] Vídeos (WebView ou Safari)
  - [ ] Filmes relacionados (ScrollView)
  - [ ] Onde assistir (provedores com logos)

- [ ] **Seção de Coleção**
  - [ ] Se pertence a coleção, exibir outros filmes
  - [ ] ScrollView horizontal

### 7.2 SeriesDetailView

- [ ] Todos os itens de MovieDetailView +
- [ ] **Lista de Temporadas**

  - [ ] List ou LazyVStack
  - [ ] SeasonCard com número de episódios
  - [ ] ProgressView do assistidos
  - [ ] NavigationLink para SeasonDetailView

- [ ] **Progresso Geral**
  - [ ] ProgressView customizada
  - [ ] Texto "X de Y episódios"

### 7.3 SeasonDetailView

- [ ] Header com informações da temporada
- [ ] Lista de episódios (List)
- [ ] EpisodeRow com:
  - [ ] Thumbnail do episódio
  - [ ] Número e título
  - [ ] Duração
  - [ ] Checkbox de assistido
- [ ] Botão "Marcar todos como assistidos"
- [ ] Picker de navegação entre temporadas

### 7.4 EpisodeDetailView

- [ ] Banner do episódio
- [ ] Informações (número, título, duração)
- [ ] Sinopse
- [ ] Elenco convidado
- [ ] Toggle de marcar como assistido
- [ ] Seção de review (opcional)
- [ ] Botões de navegação (anterior/próximo)

### 7.5 PersonDetailView (Ator/Diretor)

- [ ] Header com foto
- [ ] Nome
- [ ] Biografia (Text expandível)
- [ ] Data e local de nascimento
- [ ] Idade calculada
- [ ] Seção de Filmografia:
  - [ ] Segmented control (Filmes/Séries)
  - [ ] LazyVStack de participações
  - [ ] Ordenado por data

### 7.6 ViewModels

- [ ] **MovieDetailViewModel**
- [ ] **SeriesDetailViewModel**
- [ ] **SeasonDetailViewModel**
- [ ] **EpisodeDetailViewModel**
- [ ] **PersonDetailViewModel**

---

## 8. Sistema de Reviews

### 8.1 Componentes de Review

- [ ] **ReviewRowView**

  - [ ] HStack com AsyncImage do avatar
  - [ ] VStack com username (NavigationLink)
  - [ ] RatingView (estrelas ou 0-10)
  - [ ] Text da review (com spoiler blur)
  - [ ] Data formatada (RelativeDateTimeFormatter)
  - [ ] Badge "PRO" se aplicável
  - [ ] HStack de ações:
    - [ ] Botão de like (heart.fill animation)
    - [ ] Contador de likes
    - [ ] Botão de responder (bubble)
    - [ ] Menu de ações (…)

- [ ] **ReviewFormSheet**

  - [ ] Sheet presentation
  - [ ] RatingPicker customizado (Slider ou Stepper)
  - [ ] TextEditor para review
  - [ ] Toggle "Contém spoilers"
  - [ ] Botão "Publicar" com loading
  - [ ] Validação de campos

- [ ] **ReviewRepliesView**
  - [ ] List de respostas
  - [ ] ReplyRow similar ao ReviewRow
  - [ ] TextField para nova resposta
  - [ ] Like em respostas

### 8.2 Listagem de Reviews

- [ ] ReviewsListView genérico
- [ ] Filtros:
  - [ ] Picker de idioma
  - [ ] Picker de ordenação (data, likes)
- [ ] Pull to refresh
- [ ] Infinite scroll

### 8.3 ViewModels

- [ ] **ReviewsViewModel**
- [ ] **ReviewFormViewModel**

---

## 9. Listas Personalizadas

### 9.1 Views de Listas

- [ ] **MyListsView**

  - [ ] LazyVGrid de ListCard
  - [ ] Botão + (plus.circle.fill) para criar
  - [ ] Pull to refresh
  - [ ] Empty state customizado

- [ ] **DiscoverListsView**

  - [ ] LazyVStack de listas públicas
  - [ ] Toggle "Apenas com banner"
  - [ ] Infinite scroll

- [ ] **ListDetailView**
  - [ ] Banner header (se existir)
  - [ ] Título e descrição
  - [ ] Creator com NavigationLink
  - [ ] Contador de likes + botão
  - [ ] ProgressView (assistidos/total)
  - [ ] LazyVGrid de itens
  - [ ] Modo edição:
    - [ ] Drag & drop para reordenar
    - [ ] Botão de remover item
  - [ ] Botão + para adicionar item

### 9.2 Formulário de Lista

- [ ] **ListFormView**
  - [ ] TextField para título
  - [ ] TextEditor para descrição
  - [ ] Picker de visibilidade (Pública, Rede, Privada)
  - [ ] PhotosPicker para banner
  - [ ] ImageCropper (opcional, via library)
  - [ ] Botões "Cancelar" e "Salvar"

### 9.3 Adicionar Item à Lista

- [ ] **AddItemToListView**
  - [ ] SearchBar
  - [ ] Resultados de busca (filmes/séries)
  - [ ] Checkboxes de listas
  - [ ] Quick add via context menu na tela de detalhes

### 9.4 ViewModels

- [ ] **ListsViewModel**
- [ ] **ListDetailViewModel**
- [ ] **ListFormViewModel**

---

## 10. Perfil do Usuário

### 10.1 ProfileView

- [ ] **Header**

  - [ ] Banner (KFImage ou cor sólida)
  - [ ] Avatar (Circle overlay)
  - [ ] Username
  - [ ] Badge PRO (se aplicável)
  - [ ] Biografia (Text)
  - [ ] Botões:
    - [ ] Seguir/Deixar de seguir (outros perfis)
    - [ ] Editar (próprio perfil)

- [ ] **Estatísticas Resumidas**

  - [ ] HStack com VStacks:
    - [ ] Filmes assistidos
    - [ ] Séries assistidas
    - [ ] Seguidores (NavigationLink)
    - [ ] Seguindo (NavigationLink)

- [ ] **Links Sociais**

  - [ ] HStack de ícones clicáveis
  - [ ] SF Symbols ou custom icons
  - [ ] Abrir com `.openURL()`

- [ ] **TabView de Conteúdo**
  - [ ] Atividades
  - [ ] Coleção
  - [ ] Listas
  - [ ] Reviews
  - [ ] Estatísticas

### 10.2 Edição de Perfil

- [ ] **EditProfileView**
  - [ ] PhotosPicker para avatar
  - [ ] ImageCropper circular
  - [ ] PhotosPicker para banner
  - [ ] TextField para username (validação async)
  - [ ] TextEditor para biografia
  - [ ] TextFields para links sociais
  - [ ] Botão "Salvar" com loading

### 10.3 ViewModels

- [ ] **ProfileViewModel**
- [ ] **EditProfileViewModel**

---

## 11. Coleção do Usuário

### 11.1 CollectionView

- [ ] **Filtros**

  - [ ] Picker de Status (Todos, Watchlist, Watching, Watched, Dropped)
  - [ ] Picker de Tipo (Filmes, Séries, Ambos)
  - [ ] Filtro de rating (Slider)
  - [ ] Picker de ordenação
  - [ ] Toggle "Apenas sem review"

- [ ] **Grid de Itens**
  - [ ] LazyVGrid adaptativo
  - [ ] CollectionItemCard:
    - [ ] Poster
    - [ ] Badge de status
    - [ ] Rating (se existir)
  - [ ] Context menu:
    - [ ] Alterar status
    - [ ] Remover
    - [ ] Ver detalhes
  - [ ] Infinite scroll

### 11.2 ViewModels

- [ ] **CollectionViewModel**

---

## 12. Estatísticas

### 12.1 StatsView

- [ ] **Total de Horas**

  - [ ] Seção com ícone
  - [ ] Cálculo de runtime total
  - [ ] Formatação amigável (ex: "120h 30min")

- [ ] **Contagem de Reviews**

  - [ ] Número total de reviews

- [ ] **Séries Mais Assistidas**

  - [ ] Chart com BarMark (Apple Charts)
  - [ ] Top 5 séries
  - [ ] Ordenado por episódios

- [ ] **Distribuição de Gêneros**

  - [ ] PieChart ou BarChart
  - [ ] Cores distintas
  - [ ] Legenda

- [ ] **Atores Mais Vistos**

  - [ ] List ou LazyVStack
  - [ ] Foto + nome + contagem

- [ ] **Países de Produção**

  - [ ] Map (MapKit) com pins (opcional)
  - [ ] Ou lista simples com bandeiras (emoji ou SF Symbols)

- [ ] **Melhores Avaliações**

  - [ ] ScrollView horizontal de itens nota 10
  - [ ] Média geral do usuário

- [ ] **Status das Mídias**
  - [ ] PieChart
  - [ ] Porcentagens

### 12.2 ViewModels

- [ ] **StatsViewModel**
  - [ ] Cálculos complexos
  - [ ] Cache de dados pesados

---

## 13. Sistema Social

### 13.1 Followers/Following

- [ ] **FollowersListView**

  - [ ] List de UserRowView
  - [ ] Botão "Seguir de volta"
  - [ ] Pull to refresh
  - [ ] Infinite scroll

- [ ] **FollowingListView**
  - [ ] List de UserRowView
  - [ ] Botão "Deixar de seguir"
  - [ ] Confirmação de unfollow

### 13.2 Busca de Usuários

- [ ] **UserSearchView**
  - [ ] SearchBar com debounce
  - [ ] Resultados em tempo real
  - [ ] Indicador se já segue
  - [ ] NavigationLink para perfil

### 13.3 Likes

- [ ] LikeButton com animação
- [ ] Heart animation (scaleEffect + spring)
- [ ] Haptic feedback
- [ ] Sheet de "Curtido por" (lista de usuários)

### 13.4 ViewModels

- [ ] **FollowersViewModel**
- [ ] **FollowingViewModel**
- [ ] **UserSearchViewModel**

---

## 14. Busca

### 14.1 SearchView

- [ ] **SearchBar**

  - [ ] TextField com debounce (300ms)
  - [ ] Botão de limpar (xmark.circle)
  - [ ] SearchSuggestionsView com histórico

- [ ] **Resultados Multi-tipo**
  - [ ] List com Sections:
    - [ ] Filmes
    - [ ] Séries
    - [ ] Pessoas
  - [ ] NavigationLink "Ver todos" para cada seção

### 14.2 Command Search (iOS Spotlight-like)

- [ ] Implementar via `.searchable()` modifier
- [ ] Sugestões inline
- [ ] Navegação por teclado (iPad + teclado externo)

### 14.3 ViewModels

- [ ] **SearchViewModel**
  - [ ] Combine para debounce
  - [ ] Gerenciar múltiplas queries

---

## 15. Configurações

### 15.1 SettingsView

- [ ] **Preferências de Streaming**

  - [ ] NavigationLink para StreamingProvidersView
  - [ ] MultiSelector de provedores
  - [ ] Picker de região

- [ ] **Preferências de Exibição**

  - [ ] Picker de tema (Light, Dark, System)
  - [ ] Picker de idioma do app
  - [ ] Picker de idioma TMDB

- [ ] **Conta**
  - [ ] NavigationLink para ChangePasswordView
  - [ ] NavigationLink para NotificationsSettingsView
  - [ ] NavigationLink para PrivacySettingsView
  - [ ] Botão "Excluir Conta" (destructive)
  - [ ] Botão "Logout"

### 15.2 ViewModels

- [ ] **SettingsViewModel**

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

- [ ] Criar `Localizable.strings` para cada idioma
- [ ] Converter JSON dos dicionários web para .strings
- [ ] Usar `NSLocalizedString()` ou String interpolation
- [ ] Criar enum `LocalizedStringKey` helper
- [ ] Persistir preferência no UserDefaults
- [ ] Criar `LanguageManager` para troca em runtime

### 16.3 Formatação

- [ ] `NumberFormatter` para moeda
- [ ] `DateFormatter` para datas
- [ ] `RelativeDateTimeFormatter` para datas relativas
- [ ] `MeasurementFormatter` para horas

---

## 17. Funcionalidades Premium (PRO)

### 17.1 Features PRO

- [ ] Badge PRO no perfil
- [ ] Importação de dados externos
- [ ] [Outras features a definir]

### 17.2 Integração com In-App Purchase

- [ ] **Configurar no App Store Connect**

  - [ ] Criar produtos (assinatura mensal/anual)
  - [ ] Configurar preços

- [ ] **StoreKit 2**

  - [ ] Implementar `StoreKitManager`
  - [ ] Exibir produtos disponíveis
  - [ ] Processar compras
  - [ ] Validar recibos
  - [ ] Restaurar compras

- [ ] **PricingView**
  - [ ] Design atraente
  - [ ] Comparação de planos
  - [ ] Botões de compra
  - [ ] Loading states

### 17.3 ViewModels

- [ ] **SubscriptionViewModel**

---

## 18. Importação de Dados

### 18.1 Provedores Suportados

- [ ] **MyAnimeList**

  - [ ] UIDocumentPickerViewController para XML
  - [ ] Parse XML com XMLParser
  - [ ] Mapeamento para modelo interno

- [ ] **Letterboxd**
  - [ ] UIDocumentPickerViewController para CSV
  - [ ] Parse CSV
  - [ ] Mapeamento para modelo interno

### 18.2 ImportView

- [ ] Picker de provedor (Segmented Control)
- [ ] Botão "Selecionar Arquivo"
- [ ] ProgressView durante importação
- [ ] ResultsView com sucesso/falha por item
- [ ] List de itens importados/falhados

### 18.3 ViewModels

- [ ] **ImportViewModel**
  - [ ] Processar arquivo em background
  - [ ] Progress tracking

---

## 🎨 Componentes UI Reutilizáveis (SwiftUI)

### Componentes Base

- [ ] **CustomButton** (variantes: primary, secondary, outline, destructive)
- [ ] **CustomTextField**
- [ ] **CustomSecureField**
- [ ] **CustomTextEditor**
- [ ] **CustomPicker**
- [ ] **CustomToggle**
- [ ] **CustomSlider**
- [ ] **AvatarView** (AsyncImage circular)
- [ ] **BadgeView**
- [ ] **CardView** (com sombra e corner radius)
- [ ] **SkeletonView** (shimmer effect)
- [ ] **ToastView** (overlay com animação)
- [ ] **LoadingView** (ProgressView customizado)
- [ ] **EmptyStateView**
- [ ] **ErrorView**

### Componentes de Mídia

- [ ] **PosterCard**
- [ ] **PosterGrid** (LazyVGrid wrapper)
- [ ] **BannerView**
- [ ] **PersonCard**
- [ ] **RatingView** (estrelas ou 0-10)
- [ ] **StatusBadge**
- [ ] **GenreChip**

### Componentes de Interação

- [ ] **LikeButton** (com animação de coração)
- [ ] **FollowButton**
- [ ] **StatusMenu** (Menu com opções)
- [ ] **AddToListButton**
- [ ] **ShareButton** (usar UIActivityViewController)

### Layouts Customizados

- [ ] **FlowLayout** (para chips de gêneros)
- [ ] **WaterfallLayout** (para grids irregulares)

---

## 📱 Considerações iOS-Specific

### UX Nativa

- [ ] **Gestos Nativos**

  - [ ] Swipe back para navegação
  - [ ] Pull to refresh em Lists
  - [ ] Context menus (long press)
  - [ ] Drag & drop para reordenar

- [ ] **Haptic Feedback**

  - [ ] `UIImpactFeedbackGenerator` para ações
  - [ ] `UINotificationFeedbackGenerator` para sucesso/erro
  - [ ] `UISelectionFeedbackGenerator` para seleções

- [ ] **Launch Screen**

  - [ ] Storyboard ou Asset
  - [ ] Logo centralizado

- [ ] **App Icon**
  - [ ] Asset Catalog com todos os tamanhos
  - [ ] Design consistente

### Performance

- [ ] **Lazy Loading**

  - [ ] LazyVStack/LazyHStack/LazyVGrid
  - [ ] `.task()` modifier para carregar dados

- [ ] **Image Caching**

  - [ ] Kingfisher com configurações otimizadas
  - [ ] Downsampling automático

- [ ] **List Optimization**

  - [ ] Identificadores estáveis (.id())
  - [ ] Evitar renders desnecessários

- [ ] **Memory Management**
  - [ ] Weak references em closures
  - [ ] Deallocação adequada

### Offline

- [ ] **Cache Strategy**

  - [ ] URLCache configurado
  - [ ] Core Data ou Realm para persistência offline
  - [ ] Queue de ações offline para sincronizar

- [ ] **Network Monitoring**
  - [ ] NWPathMonitor (Network framework)
  - [ ] Indicador de modo offline
  - [ ] Retry automático quando conectar

### Push Notifications (Futuro)

- [ ] **APNs Setup**

  - [ ] Certificados no Apple Developer
  - [ ] Backend: enviar device token

- [ ] **Notificações**

  - [ ] Novo seguidor
  - [ ] Like na review
  - [ ] Resposta na review
  - [ ] Lançamento de filme/série na watchlist

- [ ] **Local Notifications**
  - [ ] Lembrete de episódio novo
  - [ ] Lembrete de filme estreando

### Widgets (iOS 14+)

- [ ] **WidgetKit**
  - [ ] Widget de estatísticas
  - [ ] Widget de próximos lançamentos
  - [ ] Widget de últimas reviews
  - [ ] Timelines para atualização

### App Clips (Opcional)

- [ ] App Clip para visualização rápida de filme/série
- [ ] QR Codes para compartilhamento

### Siri Shortcuts (Opcional)

- [ ] Adicionar à watchlist via Siri
- [ ] Marcar como assistido via Siri
- [ ] Buscar filme/série via Siri

---

## 📊 Estimativa de Complexidade

| Módulo             | Complexidade | Prioridade |
| ------------------ | ------------ | ---------- |
| Setup Inicial      | Baixa        | Alta       |
| Autenticação       | Média        | Alta       |
| Navegação          | Média        | Alta       |
| Catálogo de Filmes | Média        | Alta       |
| Catálogo de Séries | Média        | Alta       |
| Detalhes de Mídia  | Alta         | Alta       |
| Sistema de Reviews | Alta         | Alta       |
| Listas             | Alta         | Média      |
| Perfil             | Média        | Alta       |
| Coleção            | Média        | Média      |
| Estatísticas       | Alta         | Baixa      |
| Sistema Social     | Média        | Média      |
| Busca              | Baixa        | Alta       |
| Configurações      | Baixa        | Baixa      |
| i18n               | Média        | Média      |
| Premium/IAP        | Alta         | Baixa      |
| Importação         | Alta         | Baixa      |

---

## 🚀 Sugestão de Sprints

### Sprint 1 - MVP Base (2-3 semanas)

- Setup inicial do projeto Xcode
- Arquitetura base (MVVM + Network Layer)
- Autenticação (login/cadastro)
- Navegação básica (TabView + NavigationStack)
- Catálogo de filmes (popular, detalhes básicos)
- Busca simples

### Sprint 2 - Core Features (2-3 semanas)

- Catálogo de séries
- Sistema de status (watchlist, watched, etc)
- Perfil básico
- Coleção do usuário
- Deep linking

### Sprint 3 - Social Features (2 semanas)

- Sistema de reviews completo
- Likes com animações
- Follow/Unfollow
- Feed de atividades
- Review replies

### Sprint 4 - Listas e Polish (2 semanas)

- Listas personalizadas (criar, editar, adicionar itens)
- Detalhes de temporadas/episódios
- Internacionalização
- Performance optimization
- Dark mode polish

### Sprint 5 - Extras (1-2 semanas)

- Estatísticas com gráficos
- Configurações avançadas
- In-App Purchases (PRO)
- Importação de dados
- Widgets básicos

### Sprint 6 - QA & Publicação (1 semana)

- Testes em dispositivos reais
- Correção de bugs
- App Store assets (screenshots, descrição)
- Submissão para App Review

---

## 📚 Referências

### Backend

- **API Backend**: `apps/api/` - Mesma API usada pelo web
- **Schemas Gerados**: `apps/web/src/api/endpoints.schemas.ts` (referência para modelos Codable)

### Web (Referência UI/UX)

- **Dicionários i18n**: `apps/web/public/dictionaries/` → converter para .strings
- **Componentes Web**: `apps/web/src/components/` (referência de design)
- **Serviços TMDB**: `apps/web/src/services/tmdb.ts` (referência de lógica)

### iOS Resources

- **Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **Swift Style Guide**: https://google.github.io/swift/
- **SwiftUI by Example**: https://www.hackingwithswift.com/quick-start/swiftui

### Bibliotecas Recomendadas

- **Alamofire**: https://github.com/Alamofire/Alamofire
- **Kingfisher**: https://github.com/onevcat/Kingfisher
- **KeychainAccess**: https://github.com/kishikawakatsumi/KeychainAccess
- **SwiftLint**: https://github.com/realm/SwiftLint

---

## 🛠 Ferramentas de Desenvolvimento

### Xcode Tools

- [ ] Configurar Instruments para profiling
- [ ] Usar Memory Graph Debugger
- [ ] View Hierarchy Debugger para debug de UI

### Testing

- [ ] XCTest para testes unitários
- [ ] XCUITest para testes de UI
- [ ] Quick + Nimble (opcional)
- [ ] Code coverage mínima de 70%

### CI/CD

- [ ] Xcode Cloud ou Fastlane
- [ ] Automação de builds
- [ ] TestFlight para beta testing

---

_Documento gerado em: Janeiro 2026_
_Versão do projeto web: 0.1.0_
_Plataforma: iOS 16.0+_
_Linguagem: Swift 5.9+_
_Framework: SwiftUI_
