import { Language } from '@plotwist/tmdb'

type MoviesRecommendationsDictionary = {
  preview: string
  hello: string
  description: string
  subtitle: (movieTitle: string) => string
  footer: {
    text: string
    link: string
  }
}

export const moviesRecommendationsDictionary: Record<
  Language,
  MoviesRecommendationsDictionary
> = {
  'de-DE': {
    preview:
      'Sind Sie bereit für Ihren nächsten Lieblingsfilm? Sehen Sie sich unsere Empfehlungen zugeschnitten auf Ihren Geschmack!',
    hello: 'Hallo',
    description:
      'Hier sind Ihre persönlichen Filmempfehlungen für diese Woche, basierend auf Ihren letzten Aktivitäten zusammengestellt.',
    subtitle: (movieTitle: string) =>
      `Da Sie ${movieTitle} mochten, könnten Ihnen auch gefallen`,
    footer: {
      text: 'Suchen Sie etwas anderes?',
      link: 'Erkunden Sie mehr Titel',
    },
  },
  'en-US': {
    preview:
      'Ready for your next favorite movie? Check out our recommendations tailored to your tastes!',
    hello: 'Hello',
    description:
      'Here are this week&apos;s personalized movie recommendations just for you. We&apos;ve curated these picks based on your recent activities.',
    subtitle: (movieTitle: string) =>
      `Because you enjoyed ${movieTitle}, you might like`,
    footer: {
      text: 'Looking for something different?',
      link: 'Explore more titles',
    },
  },
  'es-ES': {
    preview:
      '¿Preparado para tu próxima película favorita? Consulte nuestras recomendaciones adaptadas a sus gustos.',
    hello: 'Hola',
    description:
      'Aquí están las recomendaciones de películas personalizadas para esta semana, seleccionadas según tus actividades recientes.',
    subtitle: (movieTitle: string) =>
      `Como disfrutaste de ${movieTitle}, también te podría gustar`,
    footer: {
      text: '¿Buscas algo diferente?',
      link: 'Explora más títulos',
    },
  },
  'fr-FR': {
    preview:
      'Prêt pour votre prochain film préféré ? Consultez nos recommandations adaptées à vos goûts!',
    hello: 'Bonjour',
    description:
      'Voici les recommandations de films personnalisées de la semaine, basées sur vos activités récentes.',
    subtitle: (movieTitle: string) =>
      `Puisque vous avez aimé ${movieTitle}, vous pourriez également apprécier`,
    footer: {
      text: 'Vous cherchez quelque chose de différent ?',
      link: 'Explorez plus de titres',
    },
  },
  'it-IT': {
    preview:
      "Siete pronti per il vostro prossimo film preferito? Date un'occhiata ai nostri consigli su misura per i vostri gusti!",
    hello: 'Ciao',
    description:
      'Ecco le raccomandazioni di film personalizzate per questa settimana, scelte in base alle tue attività recenti.',
    subtitle: (movieTitle: string) =>
      `Poiché ti è piaciuto ${movieTitle}, potresti gradire anche`,
    footer: {
      text: 'Cerchi qualcosa di diverso?',
      link: 'Esplora altri titoli',
    },
  },
  'ja-JP': {
    preview:
      '次のお気に入りの映画はお決まりですか？あなたの好みに合わせたお薦めの映画をチェックしてみてください！',
    hello: 'こんにちは',
    description:
      'こちらは今週のあなたに合わせた映画のおすすめです。最近の活動を元に厳選しました。',
    subtitle: (movieTitle: string) =>
      `${movieTitle} が気に入ったら、これもおすすめです`,
    footer: {
      text: '他に何かお探しですか？',
      link: '他のタイトルを探る',
    },
  },
  'pt-BR': {
    preview:
      'Pronto para seu próximo filme favorito? Confira nossas recomendações adaptadas ao seu gosto!',
    hello: 'Olá',
    description:
      'Aqui estão as recomendações de filmes personalizadas para esta semana, baseadas nas suas atividades recentes.',
    subtitle: (movieTitle: string) =>
      `Já que você gostou de ${movieTitle}, você pode gostar de:`,
    footer: {
      text: 'Procurando algo diferente?',
      link: 'Explore mais filmes.',
    },
  },
}
