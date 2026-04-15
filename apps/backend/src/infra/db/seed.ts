import { createReadStream } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { logger } from '@/infra/adapters/logger'
import { createCloudStorage } from '@/infra/factories/cloud-storage-factory'
import { client, db } from '.'
import { achievements } from './schema/achievements'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ASSETS_DIR = resolve(
  __dirname,
  '../../../../../apps/ios/Plotwist/Plotwist/Assets.xcassets'
)

const ICON_FILES: Record<string, string> = {
  first_steps: 'ach.first_steps.imageset/star.png',
  horror_fan: 'ach.horror_fan.imageset/ghost.png',
  binge_watcher: 'ach.binge_watcher.imageset/tv.png',
  explorer: 'ach.explorer.imageset/globe.png',
  critic: 'ach.critic.imageset/pen.png',
  marathon: 'ach.marathon.imageset/lightning.png',
  cinephile: 'ach.cinephile.imageset/clapperboard.png',
  social_butterfly: 'ach.social_butterfly.imageset/group.png',
  watchlist_pro: 'ach.watchlist_pro.imageset/check.png',
  saga_lotr: 'ach.saga_lotr.imageset/ring.png',
  saga_star_wars: 'ach.saga_star_wars.imageset/lightsaber.png',
  saga_harry_potter: 'ach.saga_harry_potter.imageset/broomstick.png',
  saga_mcu: 'ach.saga_mcu.imageset/gauntlet.png',
  saga_fast: 'ach.saga_fast.imageset/driftcar.png',
  saga_godfather: 'ach.saga_godfather.imageset/tuxedo.png',
  saga_batman_nolan: 'ach.saga_batman_nolan.imageset/cards.png',
  saga_back_future: 'ach.saga_back_future.imageset/delorean.png',
  saga_indiana_jones: 'ach.saga_indiana_jones.imageset/fedora.png',
  saga_matrix: 'ach.saga_matrix.imageset/pill.png',
  saga_alien: 'ach.saga_alien.imageset/alien_egg.png',
  saga_rocky: 'ach.saga_rocky.imageset/boxing_glove.png',
  saga_mission_impossible: 'ach.saga_mission_impossible.imageset/bomb.png',
  saga_toy_story: 'ach.saga_toy_story.imageset/rocket.png',
  saga_john_wick: 'ach.saga_john_wick.imageset/pencil.png',
}

async function uploadIcon(slug: string): Promise<string> {
  const relativePath = ICON_FILES[slug]
  if (!relativePath) return slug

  const filePath = resolve(ASSETS_DIR, relativePath)
  const storage = createCloudStorage('R2')
  const { url } = await storage.uploadImage({
    path: `achievement/${slug}`,
    contentStream: createReadStream(filePath),
    contentType: 'image/png',
  })
  return url
}

const GENERAL_ACHIEVEMENTS = [
  {
    slug: 'first_steps',
    icon: 'star',
    target: 1,
    level: 1,
    sortOrder: 0,
    criteria: { type: 'ITEMS_IN_COLLECTION' as const },
    name: {
      'en-US': 'The journey begins',
      'pt-BR': 'A jornada começa',
      'es-ES': 'El viaje comienza',
      'fr-FR': 'Le voyage commence',
      'de-DE': 'Die Reise beginnt',
      'it-IT': 'Il viaggio inizia',
      'ja-JP': '旅の始まり',
    },
    description: {
      'en-US': 'Add your first item to the collection',
      'pt-BR': 'Adicione seu primeiro item à coleção',
      'es-ES': 'Añade tu primer título a la colección',
      'fr-FR': 'Ajoutez votre premier titre à la collection',
      'de-DE': 'Füge dein erstes Element zur Sammlung hinzu',
      'it-IT': 'Aggiungi il tuo primo titolo alla collezione',
      'ja-JP': '最初のアイテムをコレクションに追加',
    },
  },
  {
    slug: 'horror_fan',
    icon: 'theatermasks',
    target: 10,
    level: 2,
    sortOrder: 1,
    criteria: { type: 'ITEMS_WATCHED' as const },
    name: {
      'en-US': 'Lights off',
      'pt-BR': 'Apaga a luz',
      'es-ES': 'Luces apagadas',
      'fr-FR': 'Lumières éteintes',
      'de-DE': 'Licht aus',
      'it-IT': 'Luci spente',
      'ja-JP': '電気を消して',
    },
    description: {
      'en-US': 'Watch 10 horror movies',
      'pt-BR': 'Assista 10 filmes de terror',
      'es-ES': 'Ve 10 películas de terror',
      'fr-FR': "Regardez 10 films d'horreur",
      'de-DE': 'Schau 10 Horrorfilme',
      'it-IT': 'Guarda 10 film horror',
      'ja-JP': 'ホラー映画を10本鑑賞',
    },
  },
  {
    slug: 'binge_watcher',
    icon: 'play.rectangle',
    target: 5,
    level: 1,
    sortOrder: 2,
    criteria: { type: 'ITEMS_WATCHED' as const, mediaType: 'TV_SHOW' as const },
    name: {
      'en-US': 'Just one more episode',
      'pt-BR': 'Só mais um episódio',
      'es-ES': 'Solo un episodio más',
      'fr-FR': 'Encore un épisode',
      'de-DE': 'Nur noch eine Folge',
      'it-IT': 'Solo un altro episodio',
      'ja-JP': 'あと1話だけ',
    },
    description: {
      'en-US': 'Finish 5 complete series',
      'pt-BR': 'Termine 5 séries completas',
      'es-ES': 'Termina 5 series completas',
      'fr-FR': 'Terminez 5 séries complètes',
      'de-DE': 'Beende 5 komplette Serien',
      'it-IT': 'Finisci 5 serie complete',
      'ja-JP': 'シリーズを5作品完走',
    },
  },
  {
    slug: 'explorer',
    icon: 'globe',
    target: 10,
    level: 1,
    sortOrder: 3,
    criteria: { type: 'ITEMS_WATCHED' as const },
    name: {
      'en-US': 'A bit of everything',
      'pt-BR': 'Um pouco de tudo',
      'es-ES': 'Un poco de todo',
      'fr-FR': 'Un peu de tout',
      'de-DE': 'Von allem etwas',
      'it-IT': "Un po' di tutto",
      'ja-JP': 'なんでも少しずつ',
    },
    description: {
      'en-US': 'Watch titles from 10 different genres',
      'pt-BR': 'Assista títulos de 10 gêneros diferentes',
      'es-ES': 'Ve títulos de 10 géneros diferentes',
      'fr-FR': 'Regardez des titres de 10 genres différents',
      'de-DE': 'Schau Titel aus 10 verschiedenen Genres',
      'it-IT': 'Guarda titoli di 10 generi diversi',
      'ja-JP': '10種類のジャンルの作品を鑑賞',
    },
  },
  {
    slug: 'critic',
    icon: 'text.bubble',
    target: 10,
    level: 1,
    sortOrder: 4,
    criteria: { type: 'REVIEWS_WRITTEN' as const },
    name: {
      'en-US': "Everyone's a critic",
      'pt-BR': 'Todo mundo é crítico',
      'es-ES': 'Todos somos críticos',
      'fr-FR': 'Tout le monde est critique',
      'de-DE': 'Jeder ist ein Kritiker',
      'it-IT': 'Tutti sono critici',
      'ja-JP': '誰もが批評家',
    },
    description: {
      'en-US': 'Write 10 reviews',
      'pt-BR': 'Escreva 10 reviews',
      'es-ES': 'Escribe 10 reseñas',
      'fr-FR': 'Rédigez 10 critiques',
      'de-DE': 'Schreibe 10 Bewertungen',
      'it-IT': 'Scrivi 10 recensioni',
      'ja-JP': 'レビューを10件書く',
    },
  },
  {
    slug: 'marathon',
    icon: 'bolt',
    target: 3,
    level: 1,
    sortOrder: 5,
    criteria: { type: 'ITEMS_WATCHED' as const, mediaType: 'MOVIE' as const },
    name: {
      'en-US': 'Triple feature',
      'pt-BR': 'Sessão tripla',
      'es-ES': 'Sesión triple',
      'fr-FR': 'Séance triple',
      'de-DE': 'Triple Feature',
      'it-IT': 'Sessione tripla',
      'ja-JP': '三本立て',
    },
    description: {
      'en-US': 'Watch 3 movies in a single day',
      'pt-BR': 'Assista 3 filmes em um único dia',
      'es-ES': 'Ve 3 películas en un solo día',
      'fr-FR': 'Regardez 3 films en une seule journée',
      'de-DE': 'Schau 3 Filme an einem Tag',
      'it-IT': 'Guarda 3 film in un solo giorno',
      'ja-JP': '1日に映画を3本鑑賞',
    },
  },
  {
    slug: 'cinephile',
    icon: 'film',
    target: 100,
    level: 1,
    sortOrder: 6,
    criteria: { type: 'ITEMS_WATCHED' as const, mediaType: 'MOVIE' as const },
    name: {
      'en-US': 'A life in film',
      'pt-BR': 'Vida de cinema',
      'es-ES': 'Vida de cine',
      'fr-FR': 'Une vie de cinéma',
      'de-DE': 'Ein Leben für Film',
      'it-IT': 'Una vita di cinema',
      'ja-JP': '映画に生きる',
    },
    description: {
      'en-US': 'Watch 100 movies',
      'pt-BR': 'Assista 100 filmes',
      'es-ES': 'Ve 100 películas',
      'fr-FR': 'Regardez 100 films',
      'de-DE': 'Schau 100 Filme',
      'it-IT': 'Guarda 100 film',
      'ja-JP': '映画を100本鑑賞',
    },
  },
  {
    slug: 'social_butterfly',
    icon: 'person.2',
    target: 10,
    level: 1,
    sortOrder: 7,
    criteria: { type: 'FOLLOWING_COUNT' as const },
    name: {
      'en-US': 'The more the merrier',
      'pt-BR': 'Quanto mais, melhor',
      'es-ES': 'Cuantos más, mejor',
      'fr-FR': 'Plus on est de fous',
      'de-DE': 'Je mehr, desto besser',
      'it-IT': 'Più siamo, meglio è',
      'ja-JP': '仲間は多いほどいい',
    },
    description: {
      'en-US': 'Follow 10 people',
      'pt-BR': 'Siga 10 pessoas',
      'es-ES': 'Sigue a 10 personas',
      'fr-FR': 'Suivez 10 personnes',
      'de-DE': 'Folge 10 Personen',
      'it-IT': 'Segui 10 persone',
      'ja-JP': '10人をフォロー',
    },
  },
  {
    slug: 'watchlist_pro',
    icon: 'list.bullet.rectangle',
    target: 50,
    level: 1,
    sortOrder: 8,
    criteria: { type: 'ITEMS_IN_COLLECTION' as const },
    name: {
      'en-US': 'So much to watch',
      'pt-BR': 'Tanto pra assistir',
      'es-ES': 'Tanto por ver',
      'fr-FR': 'Tant de choses à voir',
      'de-DE': 'So viel zu sehen',
      'it-IT': 'Tanto da vedere',
      'ja-JP': '観たいものだらけ',
    },
    description: {
      'en-US': 'Add 50 items to your watchlist',
      'pt-BR': 'Adicione 50 itens à sua watchlist',
      'es-ES': 'Añade 50 títulos a tu watchlist',
      'fr-FR': 'Ajoutez 50 titres à votre watchlist',
      'de-DE': 'Füge 50 Titel zu deiner Watchlist hinzu',
      'it-IT': 'Aggiungi 50 titoli alla tua watchlist',
      'ja-JP': 'ウォッチリストに50作品追加',
    },
  },
]

const SAGA_ACHIEVEMENTS = [
  {
    slug: 'saga_lotr',
    icon: 'mountain.2',
    target: 3,
    tmdbIds: [120, 121, 122],
    name: {
      'en-US': 'One ring to rule them all',
      'pt-BR': 'Um anel para todos governar',
      'es-ES': 'Un anillo para gobernarlos a todos',
      'fr-FR': 'Un anneau pour les gouverner tous',
      'de-DE': 'Ein Ring sie zu knechten',
      'it-IT': 'Un anello per domarli tutti',
      'ja-JP': '一つの指輪',
    },
    description: {
      'en-US': 'Watch the entire Lord of the Rings trilogy',
      'pt-BR': 'Assista toda a trilogia Senhor dos Anéis',
      'es-ES': 'Ve toda la trilogía de El Señor de los Anillos',
      'fr-FR': 'Regardez toute la trilogie du Seigneur des Anneaux',
      'de-DE': 'Schau die gesamte Herr der Ringe-Trilogie',
      'it-IT': "Guarda l'intera trilogia del Signore degli Anelli",
      'ja-JP': 'ロード・オブ・ザ・リング三部作を全て鑑賞',
    },
  },
  {
    slug: 'saga_star_wars',
    icon: 'sparkles',
    target: 9,
    tmdbIds: [11, 1891, 1892, 1893, 1894, 1895, 140607, 181808, 181812],
    name: {
      'en-US': 'May the force be with you',
      'pt-BR': 'Que a força esteja com você',
      'es-ES': 'Que la fuerza te acompañe',
      'fr-FR': 'Que la force soit avec toi',
      'de-DE': 'Möge die Macht mit dir sein',
      'it-IT': 'Che la forza sia con te',
      'ja-JP': 'フォースと共にあれ',
    },
    description: {
      'en-US': 'Watch all 9 Star Wars saga films',
      'pt-BR': 'Assista todos os 9 filmes da saga Star Wars',
      'es-ES': 'Ve las 9 películas de la saga Star Wars',
      'fr-FR': 'Regardez les 9 films de la saga Star Wars',
      'de-DE': 'Schau alle 9 Star Wars-Saga-Filme',
      'it-IT': 'Guarda tutti i 9 film della saga Star Wars',
      'ja-JP': 'スター・ウォーズ・サーガ全9作品を鑑賞',
    },
  },
  {
    slug: 'saga_harry_potter',
    icon: 'wand.and.stars',
    target: 8,
    tmdbIds: [671, 767, 22794, 12444, 675, 674, 673, 672],
    name: {
      'en-US': 'The chosen one',
      'pt-BR': 'O escolhido',
      'es-ES': 'El elegido',
      'fr-FR': "L'élu",
      'de-DE': 'Der Auserwählte',
      'it-IT': 'Il prescelto',
      'ja-JP': '選ばれし者',
    },
    description: {
      'en-US': 'Watch all 8 Harry Potter films',
      'pt-BR': 'Assista todos os 8 filmes de Harry Potter',
      'es-ES': 'Ve las 8 películas de Harry Potter',
      'fr-FR': 'Regardez les 8 films Harry Potter',
      'de-DE': 'Schau alle 8 Harry Potter-Filme',
      'it-IT': 'Guarda tutti gli 8 film di Harry Potter',
      'ja-JP': 'ハリー・ポッター全8作品を鑑賞',
    },
  },
  {
    slug: 'saga_mcu',
    icon: 'shield',
    target: 23,
    tmdbIds: [
      1726, 10138, 1771, 24428, 68721, 76338, 100402, 118340, 99861, 102899,
      127585, 283995, 284053, 284054, 315635, 363088, 299536, 299537, 429617,
      497698, 505642, 524434, 634649,
    ],
    name: {
      'en-US': 'Avengers assembled',
      'pt-BR': 'Vingadores reunidos',
      'es-ES': 'Vengadores unidos',
      'fr-FR': 'Avengers rassemblement',
      'de-DE': 'Avengers versammelt',
      'it-IT': 'Avengers riuniti',
      'ja-JP': 'アベンジャーズ・アッセンブル',
    },
    description: {
      'en-US': 'Watch all Infinity Saga films (23 movies)',
      'pt-BR': 'Assista todos os filmes da Saga do Infinito (23 filmes)',
      'es-ES': 'Ve todas las películas de la Saga del Infinito (23 películas)',
      'fr-FR': "Regardez tous les films de la Saga de l'Infini (23 films)",
      'de-DE': 'Schau alle Infinity-Saga-Filme (23 Filme)',
      'it-IT': "Guarda tutti i film della Saga dell'Infinito (23 film)",
      'ja-JP': 'インフィニティ・サーガ全23作品を鑑賞',
    },
  },
  {
    slug: 'saga_fast',
    icon: 'car',
    target: 10,
    tmdbIds: [
      9799, 584, 9615, 337339, 168259, 82992, 13804, 385687, 9946, 1422926,
    ],
    name: {
      'en-US': 'Family first',
      'pt-BR': 'Família em primeiro lugar',
      'es-ES': 'La familia primero',
      'fr-FR': "La famille d'abord",
      'de-DE': 'Familie zuerst',
      'it-IT': 'La famiglia prima di tutto',
      'ja-JP': 'ファミリーが一番',
    },
    description: {
      'en-US': 'Watch all Fast & Furious films',
      'pt-BR': 'Assista todos os filmes de Velozes e Furiosos',
      'es-ES': 'Ve todas las películas de Rápidos y Furiosos',
      'fr-FR': 'Regardez tous les films Fast & Furious',
      'de-DE': 'Schau alle Fast & Furious-Filme',
      'it-IT': 'Guarda tutti i film di Fast & Furious',
      'ja-JP': 'ワイルド・スピード全作品を鑑賞',
    },
  },
  {
    slug: 'saga_godfather',
    icon: 'crown',
    target: 3,
    tmdbIds: [238, 240, 242],
    name: {
      'en-US': "An offer you can't refuse",
      'pt-BR': 'Uma oferta irrecusável',
      'es-ES': 'Una oferta que no podrás rechazar',
      'fr-FR': "Une offre qu'on ne peut refuser",
      'de-DE': 'Ein Angebot, das du nicht ablehnen kannst',
      'it-IT': "Un'offerta che non puoi rifiutare",
      'ja-JP': '断れない申し出',
    },
    description: {
      'en-US': 'Watch The Godfather trilogy',
      'pt-BR': 'Assista a trilogia O Poderoso Chefão',
      'es-ES': 'Ve la trilogía de El Padrino',
      'fr-FR': 'Regardez la trilogie Le Parrain',
      'de-DE': 'Schau die Der Pate-Trilogie',
      'it-IT': 'Guarda la trilogia de Il Padrino',
      'ja-JP': 'ゴッドファーザー三部作を鑑賞',
    },
  },
  {
    slug: 'saga_batman_nolan',
    icon: 'moon.stars',
    target: 3,
    tmdbIds: [272, 155, 49026],
    name: {
      'en-US': 'The dark knight',
      'pt-BR': 'O cavaleiro das trevas',
      'es-ES': 'El caballero oscuro',
      'fr-FR': 'Le chevalier noir',
      'de-DE': 'Der dunkle Ritter',
      'it-IT': 'Il cavaliere oscuro',
      'ja-JP': 'ダークナイト',
    },
    description: {
      'en-US': "Watch Christopher Nolan's Batman trilogy",
      'pt-BR': 'Assista a trilogia Batman de Christopher Nolan',
      'es-ES': 'Ve la trilogía de Batman de Christopher Nolan',
      'fr-FR': 'Regardez la trilogie Batman de Christopher Nolan',
      'de-DE': 'Schau Christopher Nolans Batman-Trilogie',
      'it-IT': 'Guarda la trilogia di Batman di Christopher Nolan',
      'ja-JP': 'クリストファー・ノーランのバットマン三部作を鑑賞',
    },
  },
  {
    slug: 'saga_back_future',
    icon: 'clock.arrow.circlepath',
    target: 3,
    tmdbIds: [105, 165, 196],
    name: {
      'en-US': 'Great Scott!',
      'pt-BR': 'Grande Scott!',
      'es-ES': '¡Gran Scott!',
      'fr-FR': 'Nom de Zeus !',
      'de-DE': 'Großer Scott!',
      'it-IT': 'Grande Giove!',
      'ja-JP': 'なんてこった！',
    },
    description: {
      'en-US': 'Watch the Back to the Future trilogy',
      'pt-BR': 'Assista a trilogia De Volta Para o Futuro',
      'es-ES': 'Ve la trilogía de Volver al Futuro',
      'fr-FR': 'Regardez la trilogie Retour vers le Futur',
      'de-DE': 'Schau die Zurück in die Zukunft-Trilogie',
      'it-IT': 'Guarda la trilogia di Ritorno al Futuro',
      'ja-JP': 'バック・トゥ・ザ・フューチャー三部作を鑑賞',
    },
  },
  {
    slug: 'saga_indiana_jones',
    icon: 'map',
    target: 5,
    tmdbIds: [85, 87, 89, 217, 335977],
    name: {
      'en-US': 'Fortune and glory',
      'pt-BR': 'Fortuna e glória',
      'es-ES': 'Fortuna y gloria',
      'fr-FR': 'Fortune et gloire',
      'de-DE': 'Reichtum und Ruhm',
      'it-IT': 'Fortuna e gloria',
      'ja-JP': '富と栄光',
    },
    description: {
      'en-US': 'Watch all Indiana Jones films',
      'pt-BR': 'Assista todos os filmes de Indiana Jones',
      'es-ES': 'Ve todas las películas de Indiana Jones',
      'fr-FR': 'Regardez tous les films Indiana Jones',
      'de-DE': 'Schau alle Indiana Jones-Filme',
      'it-IT': 'Guarda tutti i film di Indiana Jones',
      'ja-JP': 'インディ・ジョーンズ全作品を鑑賞',
    },
  },
  {
    slug: 'saga_matrix',
    icon: 'circle.grid.cross',
    target: 3,
    tmdbIds: [603, 604, 605],
    name: {
      'en-US': 'Red pill',
      'pt-BR': 'Pílula vermelha',
      'es-ES': 'Píldora roja',
      'fr-FR': 'Pilule rouge',
      'de-DE': 'Rote Pille',
      'it-IT': 'Pillola rossa',
      'ja-JP': 'レッドピル',
    },
    description: {
      'en-US': 'Watch The Matrix trilogy',
      'pt-BR': 'Assista a trilogia Matrix',
      'es-ES': 'Ve la trilogía de Matrix',
      'fr-FR': 'Regardez la trilogie Matrix',
      'de-DE': 'Schau die Matrix-Trilogie',
      'it-IT': 'Guarda la trilogia di Matrix',
      'ja-JP': 'マトリックス三部作を鑑賞',
    },
  },
  {
    slug: 'saga_alien',
    icon: 'allergens',
    target: 4,
    tmdbIds: [348, 8078, 679, 126889],
    name: {
      'en-US': 'In space no one can hear you',
      'pt-BR': 'No espaço ninguém pode te ouvir',
      'es-ES': 'En el espacio nadie puede oírte',
      'fr-FR': "Dans l'espace personne ne vous entend",
      'de-DE': 'Im Weltraum hört dich niemand',
      'it-IT': 'Nello spazio nessuno può sentirti',
      'ja-JP': '宇宙では誰にも聞こえない',
    },
    description: {
      'en-US': 'Watch the Alien quadrilogy',
      'pt-BR': 'Assista a quadrilogia Alien',
      'es-ES': 'Ve la cuatrilogía de Alien',
      'fr-FR': 'Regardez la quadrilogie Alien',
      'de-DE': 'Schau die Alien-Quadrilogie',
      'it-IT': 'Guarda la quadrilogia di Alien',
      'ja-JP': 'エイリアン四部作を鑑賞',
    },
  },
  {
    slug: 'saga_rocky',
    icon: 'figure.boxing',
    target: 8,
    tmdbIds: [1366, 1367, 1368, 1369, 312221, 1374, 404368, 748783],
    name: {
      'en-US': 'Eye of the tiger',
      'pt-BR': 'Olho do tigre',
      'es-ES': 'Ojo del tigre',
      'fr-FR': "L'œil du tigre",
      'de-DE': 'Auge des Tigers',
      'it-IT': "L'occhio della tigre",
      'ja-JP': 'アイ・オブ・ザ・タイガー',
    },
    description: {
      'en-US': 'Watch all Rocky & Creed films',
      'pt-BR': 'Assista todos os filmes de Rocky e Creed',
      'es-ES': 'Ve todas las películas de Rocky y Creed',
      'fr-FR': 'Regardez tous les films Rocky et Creed',
      'de-DE': 'Schau alle Rocky- und Creed-Filme',
      'it-IT': 'Guarda tutti i film di Rocky e Creed',
      'ja-JP': 'ロッキー＆クリード全作品を鑑賞',
    },
  },
  {
    slug: 'saga_mission_impossible',
    icon: 'flame',
    target: 8,
    tmdbIds: [954, 955, 956, 75780, 177677, 353081, 575264, 575265],
    name: {
      'en-US': 'Your mission, should you accept it',
      'pt-BR': 'Sua missão, se decidir aceitá-la',
      'es-ES': 'Tu misión, si decides aceptarla',
      'fr-FR': "Votre mission, si vous l'acceptez",
      'de-DE': 'Deine Mission, solltest du sie annehmen',
      'it-IT': 'La tua missione, se decidi di accettarla',
      'ja-JP': '君の任務、受けるなら',
    },
    description: {
      'en-US': 'Watch all Mission: Impossible films',
      'pt-BR': 'Assista todos os filmes de Missão: Impossível',
      'es-ES': 'Ve todas las películas de Misión: Imposible',
      'fr-FR': 'Regardez tous les films Mission : Impossible',
      'de-DE': 'Schau alle Mission: Impossible-Filme',
      'it-IT': 'Guarda tutti i film di Mission: Impossible',
      'ja-JP': 'ミッション：インポッシブル全作品を鑑賞',
    },
  },
  {
    slug: 'saga_toy_story',
    icon: 'teddybear',
    target: 4,
    tmdbIds: [862, 863, 10193, 301528],
    name: {
      'en-US': 'To infinity and beyond',
      'pt-BR': 'Ao infinito e além',
      'es-ES': 'Hasta el infinito y más allá',
      'fr-FR': "Vers l'infini et au-delà",
      'de-DE': 'Bis zur Unendlichkeit und noch weiter',
      'it-IT': "Verso l'infinito e oltre",
      'ja-JP': '無限の彼方へ',
    },
    description: {
      'en-US': 'Watch all Toy Story films',
      'pt-BR': 'Assista todos os filmes de Toy Story',
      'es-ES': 'Ve todas las películas de Toy Story',
      'fr-FR': 'Regardez tous les films Toy Story',
      'de-DE': 'Schau alle Toy Story-Filme',
      'it-IT': 'Guarda tutti i film di Toy Story',
      'ja-JP': 'トイ・ストーリー全作品を鑑賞',
    },
  },
  {
    slug: 'saga_john_wick',
    icon: 'dog',
    target: 4,
    tmdbIds: [245891, 324552, 458156, 603692],
    name: {
      'en-US': 'Baba Yaga',
      'pt-BR': 'Baba Yaga',
      'es-ES': 'Baba Yaga',
      'fr-FR': 'Baba Yaga',
      'de-DE': 'Baba Yaga',
      'it-IT': 'Baba Yaga',
      'ja-JP': 'ババ・ヤーガ',
    },
    description: {
      'en-US': 'Watch all John Wick films',
      'pt-BR': 'Assista todos os filmes de John Wick',
      'es-ES': 'Ve todas las películas de John Wick',
      'fr-FR': 'Regardez tous les films John Wick',
      'de-DE': 'Schau alle John Wick-Filme',
      'it-IT': 'Guarda tutti i film di John Wick',
      'ja-JP': 'ジョン・ウィック全作品を鑑賞',
    },
  },
]

async function main() {
  logger.info('🌱 Seeding achievements...')

  logger.info('📤 Uploading achievement icons...')
  const iconUrls = new Map<string, string>()
  const allSlugs = [
    ...GENERAL_ACHIEVEMENTS.map(a => a.slug),
    ...SAGA_ACHIEVEMENTS.map(a => a.slug),
  ]
  for (const slug of allSlugs) {
    const url = await uploadIcon(slug)
    iconUrls.set(slug, url)
    logger.info(`  ✓ ${slug}`)
  }

  const generalRows = GENERAL_ACHIEVEMENTS.map(a => ({
    slug: a.slug,
    icon: iconUrls.get(a.slug) ?? a.icon,
    target: a.target,
    category: 'general' as const,
    level: a.level,
    sortOrder: a.sortOrder,
    isActive: true,
    criteria: a.criteria,
    name: a.name,
    description: a.description,
  }))

  const sagaRows = SAGA_ACHIEVEMENTS.map((a, i) => ({
    slug: a.slug,
    icon: iconUrls.get(a.slug) ?? a.icon,
    target: a.target,
    category: 'saga' as const,
    level: 1,
    sortOrder: 100 + i,
    isActive: true,
    criteria: {
      type: 'TMDB_SET' as const,
      tmdbIds: a.tmdbIds,
      mediaType: 'MOVIE' as const,
    },
    name: a.name,
    description: a.description,
  }))

  const allRows = [...generalRows, ...sagaRows]

  for (const row of allRows) {
    await db
      .insert(achievements)
      .values(row)
      .onConflictDoUpdate({
        target: achievements.slug,
        set: {
          icon: row.icon,
          target: row.target,
          category: row.category,
          level: row.level,
          sortOrder: row.sortOrder,
          criteria: row.criteria,
          name: row.name,
          description: row.description,
        },
      })
  }

  logger.info(`✅ Seeded ${allRows.length} achievements with icons`)
}

main()
  .catch(err => {
    logger.error('Database seed failed', err)
    process.exit(1)
  })
  .finally(() => client.end())
