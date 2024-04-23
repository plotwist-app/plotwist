import { Language } from '@plotwist/tmdb'

type MoviesRecommendationsDictionary = {
  preview: string
  hello: string
  description: string
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
  },
  'en-US': {
    preview:
      'Ready for your next favorite movie? Check out our recommendations tailored to your tastes!',
    hello: 'Hello',
    description:
      'Here are this week&apos;s personalized movie recommendations just for you. We&apos;ve curated these picks based on your recent activities.',
  },
  'es-ES': {
    preview:
      '¿Preparado para tu próxima película favorita? Consulte nuestras recomendaciones adaptadas a sus gustos.',
    hello: 'Hola',
    description:
      'Aquí están las recomendaciones de películas personalizadas para esta semana, seleccionadas según tus actividades recientes.',
  },
  'fr-FR': {
    preview:
      'Prêt pour votre prochain film préféré ? Consultez nos recommandations adaptées à vos goûts!',
    hello: 'Bonjour',
    description:
      'Voici les recommandations de films personnalisées de la semaine, basées sur vos activités récentes.',
  },
  'it-IT': {
    preview:
      "Siete pronti per il vostro prossimo film preferito? Date un'occhiata ai nostri consigli su misura per i vostri gusti!",
    hello: 'Ciao',
    description:
      'Ecco le raccomandazioni di film personalizzate per questa settimana, scelte in base alle tue attività recenti.',
  },
  'ja-JP': {
    preview:
      '次のお気に入りの映画はお決まりですか？あなたの好みに合わせたお薦めの映画をチェックしてみてください！',
    hello: 'こんにちは',
    description:
      'こちらは今週のあなたに合わせた映画のおすすめです。最近の活動を元に厳選しました。',
  },
  'pt-BR': {
    preview:
      'Pronto para seu próximo filme favorito? Confira nossas recomendações adaptadas ao seu gosto!',
    hello: 'Olá',
    description:
      'Aqui estão as recomendações de filmes personalizadas para esta semana, baseadas nas suas atividades recentes.',
  },
}
