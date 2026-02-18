import { jsonSchemaTransform } from 'fastify-type-provider-zod'

export function transformSwaggerSchema(
  data: Parameters<typeof jsonSchemaTransform>[0]
): ReturnType<typeof jsonSchemaTransform> {
  const { schema, url } = jsonSchemaTransform(data)

  if (schema?.consumes?.includes('multipart/form-data')) {
    if (schema.body === undefined) {
      schema.body = {
        type: 'object',
        required: [],
        properties: {},
      }
    }

    schema.body.properties.file = {
      type: 'string',
      format: 'binary',
    }

    if (!schema.body.required.includes('file')) {
      schema.body.required.push('file')
    }
  }

  return { schema, url }
}
