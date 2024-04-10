import axios from 'axios'

export async function GET() {
  const { data } = await axios.get(
    'https://agenda.wowsolution.com/v1/customer/future/receivables',
    {
      data: {
        guid_customer: '885566DD-2E8B-4A3D-BD2D-A714FFF35B70',
      },
    },
  )

  return new Response(JSON.stringify(data), {
    status: 200,
  })
}
