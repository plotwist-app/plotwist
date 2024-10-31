module.exports = {
  petstore: {
    input: {
      target: 'http://localhost:3333/api-docs/json',
    },
    output: {
      mode: 'tags',
      target: 'src/api/endpoints.ts',
      client: 'react-query',
    },
  },
}
