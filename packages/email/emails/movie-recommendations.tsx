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
      <Preview>Hi, {username}!</Preview>

      <Tailwind>
        <Body className="my-auto mx-auto font-sans px-2">
          <Container className="border font-[#09090b] bg-[#fafafa] border-solid border-[#e4e4e7] rounded shadow mx-auto p-8 my-10">
            <Img
              src={`${baseUrl}/logo-black.png`}
              width="40"
              height="40"
              alt="Vercel"
            />

            <Section className="mt-2">
              <Text className="text-lg mb-0">Hello, {username}!</Text>

              <Text className="mt-0">
                Because you reviewed{' '}
                <span className="font-semibold">{movieTitle}.</span>
              </Text>
            </Section>

            <Section className="mt-4 text-sm text-[#a1a1aa]">
              You will probably find it interesting to watch the following
              titles:
            </Section>

            <Row className="mt-2 border-spacing-1">
              {movies.map((movie) => (
                <Column
                  key={movie.id}
                  className="w-1/3 rounded-lg overflow-hidden"
                >
                  <Link
                    href={`${baseUrl}/movies/${movie.id}`}
                    className="border-[#e4e4e7] shadow  aspect-[2/3]"
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
      backdrop_path: '/s0OrExdg7i3RLR7oqzHRk4q2kL4.jpg',
      id: 194662,
      original_title: 'Birdman or (The Unexpected Virtue of Ignorance)',
      overview:
        'かつてヒーロー映画「バードマン」で一世を風靡した俳優リーガン・トムソンは、落ちぶれた今、自 分が脚色を手掛けた舞台「愛について語るときに我々の語ること」に再起を懸けていた。しかし、降板した俳優の代役としてやっ て来たマイク・シャイナーの才能がリーガンを追い込む。さらに娘サムとの不仲に苦しみ、リーガンは舞台の役柄に自分自身を投 影し始める。',
      poster_path: '/dtJqCt271m4Ze8ActGWCvxVPXIw.jpg',
      media_type: 'movie',
      adult: false,
      title: 'バードマン あるいは（無知がもたらす予期せぬ奇跡）',
      original_language: 'en',
      genre_ids: [Array],
      popularity: 45.364,
      release_date: '2014-10-17',
      video: false,
      vote_average: 7.466,
      vote_count: 12473,
    },
    {
      backdrop_path: '/hZkgoQYus5vegHoetLkCJzb17zJ.jpg',
      id: 550,
      original_title: 'Fight Club',
      overview:
        '空虚な生活を送るヤング・エグゼクティブのジャックは、謎の男テイラーに導かれるまま、謎の秘密 組織「ファイト・クラブ」のメンバーになる。そこは鍛え抜かれた男達が己の拳のみを武器に闘いを繰り広げる、壮絶で危険な空 間だった',
      poster_path: '/9KSTre6tUpeyC9oNelMqDhDnkbc.jpg',
      media_type: 'movie',
      adult: false,
      title: 'ファイト・クラブ',
      original_language: 'en',
      genre_ids: [Array],
      popularity: 141.942,
      release_date: '1999-10-15',
      video: false,
      vote_average: 8.442,
      vote_count: 28377,
    },
    {
      backdrop_path: '/h2JaQWLKhapm7AuSViJwGiv8ngC.jpg',
      id: 210577,
      original_title: 'Gone Girl',
      overview:
        'ニックとエイミーは誰もがうらやむ夫婦のはずだったが、結婚5周年の記念日に突然エイミーが行方 をくらましてしまう。警察に嫌疑を掛けられ、日々続報を流すため取材を続けるメディアによって、ニックが話す幸せに満ちあふ れた結婚生活にほころびが生じていく。うそをつき理解不能な行動を続けるニックに、次第に世間はエイミー殺害疑惑の目を向け る。',
      poster_path: '/rHnrcYv51TfrBTtbcpwxsmPRNdu.jpg',
      media_type: 'movie',
      adult: false,
      title: 'ゴーン・ガール',
      original_language: 'en',
      genre_ids: [Array],
      popularity: 83.879,
      release_date: '2014-10-01',
      video: false,
      vote_average: 7.893,
      vote_count: 18015,
    },
  ],
}

export default MovieRecommendations
