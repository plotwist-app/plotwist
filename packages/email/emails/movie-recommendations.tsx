import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Tailwind,
  Text,
} from '@react-email/components'

type MovieRecommendationsProps = {
  username: string
}

const MovieRecommendations = ({ username }: MovieRecommendationsProps) => {
  return (
    <Html>
      <Head />
      <Preview>Olá, {username}!</Preview>

      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
            {/* <Section className="mt-[32px]">
              <Img
                src={`${baseUrl}/static/vercel-logo.png`}
                width="40"
                height="37"
                alt="Vercel"
                className="my-0 mx-auto"
              />
            </Section> */}

            <Text className="text-black text-[14px] leading-[24px]">
              Hello {username},
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

MovieRecommendations.PreviewProps = {
  username: 'lui7henrique',
}

export default MovieRecommendations
