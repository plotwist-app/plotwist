import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

const TvSeriesRecommendations = () => {
  return (
    <Html>
      <Head />
      <Preview>Hello, Olá!</Preview>

      <Tailwind>
        <Body className="my-auto mx-auto font-sans px-2">
          <Container className="border font-[#09090b] bg-[#fafafa] border-solid border-[#e4e4e7] rounded-lg shadow mx-auto p-8 my-10">
            <Section className="mt-2">
              <Text className="text-xl mb-0">
                Hello, <span className="font-semibold">Henrique.</span>!
              </Text>

              <Text className="mt-1">
                Here are this week&apos;s personalized movie recommendations
                just for you. We&apos;ve curated these picks based on your
                recent activities.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default TvSeriesRecommendations
