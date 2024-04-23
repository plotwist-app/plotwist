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
import { Language, MovieWithMediaType, generateImageUrl } from '@plotwist/tmdb'
import { moviesRecommendationsMock } from '../utils/mock/movies-recommendations'
import { moviesRecommendationsDictionary } from '../utils/dictionaries/movies-recommendations'

export type MoviesRecommendationsProps = {
  username: string
  movieTitle: string
  movies: MovieWithMediaType[]
  language: Language
}

const baseUrl = 'https://plotwist.app'

export const MoviesRecommendations = ({
  username,
  movieTitle,
  movies,
  language,
}: MoviesRecommendationsProps) => {
  const { preview, hello, description } =
    moviesRecommendationsDictionary[language]

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>

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
                {hello}, <span className="font-semibold">{username}</span>!
              </Text>

              <Text className="mt-1">{description}</Text>
            </Section>

            <Section className="mt-0 text-sm">
              Because you enjoyed <strong>{movieTitle}</strong>, you might like:
            </Section>

            <Row className="mt-2 border-spacing-1">
              {movies?.map((movie) => (
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

MoviesRecommendations.PreviewProps = moviesRecommendationsMock
export default MoviesRecommendations
