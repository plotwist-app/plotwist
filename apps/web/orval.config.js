module.exports = {
  'plotwist-api': {
    input: {
      target: 'http://localhost:3333/api-docs/json',
    },
    output: {
      mode: 'tags',
      target: 'src/api/endpoints.ts',
      override: {
        mutator: {
          path: './src/services/axios-instance.ts',
          name: 'axiosInstance',
        },
      },
    },
  },
}
