import { Badge } from '@plotwist/ui/components/ui/badge'
import { WatchedStats } from './_watched'

export default async function StatsPage() {
  return (
    <section className="space-y-8">
      <section className="space-y-2">
        <b>Totais e Resumos Gerais</b>

        <div className="grid grid-cols-2 gap-2">
          <WatchedStats />

          {/* <li>Total de séries concluídas (e episódios assistidos)</li>
          <li>
            Tempo total gasto assistindo (em horas, dias ou semanas, com
            equivalências criativas, como "você passou 3 dias e 6 horas no
            universo Marvel").
          </li>
          <li>Número de avaliações feitas</li>
          <li>Quantidade de listas criadas</li> */}
        </div>
      </section>

      {/* <section>
        <b>2. Categorias e Preferências</b>

        <ul className="list-disc ml-8 text-muted-foreground">
          <li>
            Gêneros mais assistidos: Uma nuvem ou gráfico mostrando os gêneros
            (ex: drama, ação, ficção científica, romance) com porcentagens.
          </li>

          <li>
            Diretor(a) mais assistido(a): Nome e número de filmes/séries
            dirigidos que o usuário consumiu. .
          </li>
          <li>
            Atores mais vistos: Exibir os rostos ou nomes dos atores mais
            recorrentes no histórico do usuário.
          </li>
          <li>
            Plataforma mais usada: Dados sobre onde o usuário assiste mais (se
            possível com links como Netflix, Prime Video, Crunchyroll).
          </li>
        </ul>
      </section>

      <section>
        <b>3. Marcos e Conquistas</b>

        <ul className="list-disc ml-8 text-muted-foreground">
          <li>Primeiro filme ou série registrado no Plotwist.</li>
          <li>
            Título mais bem avaliado pelo usuário (e comparação com a nota média
            da comunidade).
          </li>
          <li>Gênero mais bem avaliado.</li>
        </ul>
      </section>

      <section>
        <b>4. Comparações e Insights</b>

        <ul className="list-disc ml-8 text-muted-foreground">
          <li>
            Comparação de anos de lançamento mais assistidos (ex: “Você adora os
            anos 90!” ou "Filmes mais recentes dominam sua lista").
          </li>
          <li>Percentual de séries vs. filmes vs. animes.</li>
          <li>
            Estatísticas por mês ou ano: Quantos conteúdos foram consumidos em
            períodos específicos.
          </li>
        </ul>
      </section>

      <section>
        <b>5. Estilo de Consumo</b>

        <ul className="list-disc ml-8 text-muted-foreground">
          <li>
            Dias e horários favoritos para assistir: Dados de quando o usuário
            costuma assistir mais (ex: "Você é noturno!").
          </li>
          <li>
            Padrões de maratonas: Quantos episódios/séries você assistiu em
            maratonas.
          </li>
          <li>
            Dias consecutivos assistindo: Quantos dias seguidos o usuário
            manteve uma rotina.
          </li>
        </ul>
      </section> */}
    </section>
  )
}
