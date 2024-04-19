import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'
import { Movie, generateImageUrl } from '@plotwist/tmdb'

type MovieRecommendationsProps = {
  username: string
  movieTitle: string
  movies: Movie[]
}

const baseUrl = 'https://plotwist.app'

const MovieRecommendations = ({
  username,
  movieTitle,
  movies,
}: MovieRecommendationsProps) => {
  return (
    <Html>
      <Head />
      <Preview>Hello, {username}!</Preview>

      <Tailwind>
        <Body className="my-auto mx-auto font-sans px-2">
          <Container className="border font-[#09090b] bg-[#fafafa] border-solid border-[#e4e4e7] rounded-lg shadow mx-auto p-8 my-10">
            <Img
              src={`${baseUrl}/logo-black.png`}
              width="40"
              height="40"
              alt="Vercel"
            />

            <Section className="mt-2">
              <Text className="text-xl mb-0">
                Hello, <span className="font-semibold">{username}</span>!
              </Text>

              <Text className="mt-1">
                Here are this week&apos;s personalized movie recommendations
                just for you. We&apos;ve curated these picks based on your
                recent activities.
              </Text>
            </Section>

            <Section className="mt-0 text-sm">
              Because you enjoyed <strong>{movieTitle}</strong>, you might like:
            </Section>

            <Row className="mt-2 border-spacing-1">
              {movies.map((movie) => (
                <Column
                  key={movie.id}
                  className="w-1/3 rounded-lg overflow-hidden"
                >
                  <Link
                    href={`${baseUrl}/movies/${movie.id}`}
                    className="border-[#e4e4e7] shadow aspect-[2/3]"
                  >
                    <Img
                      src={`${generateImageUrl(movie.poster_path)}`}
                      width="100%"
                      height="100%"
                      alt={movie.title}
                    />
                  </Link>
                </Column>
              ))}
            </Row>

            <Text className="border-t text-[#a1a1aa] border-[#e4e4e7] text-center mb-0">
              Looking for something different?{' '}
              <a className="text-[#09090b]" href={`${baseUrl}/movies/discover`}>
                Explore more titles
              </a>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

MovieRecommendations.PreviewProps = {
  username: 'lui7henrique',
  movieTitle: 'Fight Club',
  movies: [
    {
      backdrop_path: '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg',
      id: 238,
      original_title: 'The Godfather',
      overview:
        'Em 1945, Don Corleone é o chefe de uma mafiosa família italiana de Nova York. Ele costuma apadrinhar várias pessoas, realizando importantes favores para elas, em troca de favores futuros. Com a chegada das drogas, as famílias começam uma disputa pelo promissor mercado. Quando Corleone se recusa a facilitar a entrada dos narcóticos na cidade, não oferecendo ajuda política e policial, sua família começa a sofrer atentados para que mudem de posição. É nessa complicada época que Michael, um herói de guerra nunca envolvido nos negócios da família, vê a necessidade de proteger o seu pai e tudo o que ele construiu ao longo dos anos.',
      poster_path: '/oJagOzBu9Rdd9BrciseCm3U3MCU.jpg',
      media_type: 'movie',
      adult: false,
      title: 'O Poderoso Chefão',
      original_language: 'en',
      genre_ids: [Array],
      popularity: 113.197,
      release_date: '1972-03-14',
      video: false,
      vote_average: 8.695,
      vote_count: 19720,
    },
    {
      backdrop_path: '/zb6fM1CX41D9rF9hdgclu0peUmy.jpg',
      id: 424,
      original_title: "Schindler's List",
      overview:
        'O alemão Oskar Schindler viu na mão de obra judia uma solução barata e viável para lucrar com negócios durante a guerra. Com sua forte influência dentro do partido nazista, foi fácil conseguir as autorizações e abrir uma fábrica. O que poderia parecer uma atitude de um homem não muito bondoso, transformou-se em um dos maiores casos de amor à vida da História, pois este alemão abdicou de toda sua fortuna para salvar a vida de mais de mil judeus em plena luta contra o extermínio alemão.',
      poster_path: '/bGhhNzJYDsuLruNN5bJ2PvLcMiq.jpg',
      media_type: 'movie',
      adult: false,
      title: 'A Lista de Schindler',
      original_language: 'en',
      genre_ids: [Array],
      popularity: 104.948,
      release_date: '1993-12-15',
      video: false,
      vote_average: 8.567,
      vote_count: 15314,
    },
    {
      backdrop_path: '/dqK9Hag1054tghRQSqLSfrkvQnA.jpg',
      id: 155,
      original_title: 'The Dark Knight',
      overview:
        'Após dois anos desde o surgimento do Batman, os criminosos de Gotham City têm muito o que temer. Com a ajuda do tenente James Gordon e do promotor público Harvey Dent, Batman luta contra o crime organizado. Acuados com o combate, os chefes do crime aceitam a proposta feita pelo Coringa e o contratam para combater o Homem-Morcego.',
      poster_path: '/4lj1ikfsSmMZNyfdi8R8Tv5tsgb.jpg',
      media_type: 'movie',
      adult: false,
      title: 'Batman: O Cavaleiro das Trevas',
      original_language: 'en',
      genre_ids: [Array],
      popularity: 118.745,
      release_date: '2008-07-16',
      video: false,
      vote_average: 8.515,
      vote_count: 31786,
    },
  ],
}

export default MovieRecommendations
