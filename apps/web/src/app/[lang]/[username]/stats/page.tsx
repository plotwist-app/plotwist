import { TotalHours } from './_total_hours'
import { Genres } from './_genres'
import { MostWatchedTv } from './_most_watched_tv'
import { Reviews } from './_reviews'
import { TopActors } from './_top_actors'
import { Countries } from './_countries'
import { BestRated } from './_best_rated'
import { Status } from './_status'
import { useLayoutContext } from '../_context'
import { Suspense } from 'react'

// Dashboard Resumido: Uma visão geral no topo da página, com cartões mostrando os números principais, como filmes assistidos, reviews escritos, listas criadas, etc.

// Gráficos e Charts: Use gráficos de barras ou de pizza para mostrar a distribuição dos gêneros mais assistidos ou as avaliações médias por gênero.

// Linha do Tempo: Uma linha do tempo interativa pode mostrar o progresso ao longo do tempo, como o número de filmes assistidos por mês ou as reviews escritas.

// Badges e Conquistas: Apresente os badges conquistados de forma destacada, com ícones coloridos e descrições de como foram obtidos.

// Listas Interativas: Permita que os usuários cliquem para ver mais detalhes sobre suas listas, reviews ou até mesmo os filmes e séries que assistiram.

// Seções Destacadas: Crie seções para os filmes e séries mais bem avaliados pelo usuário, ou os mais assistidos.

export default function StatsPage() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Suspense fallback={<p>carregando...</p>}>
        <TotalHours />
      </Suspense>

      <Reviews />
      <MostWatchedTv />
      <Genres />
      <TopActors />
      <Countries />
      <BestRated />
      <Status />
    </div>
  )
}
