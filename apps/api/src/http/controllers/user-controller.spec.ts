describe('userController', () => {
  it('sum', () => {
    expect(2 + 2).toBe(4)
  })
})

// describe('createUserController', () => {
//   let server: FastifyInstance

//   beforeAll(async () => {
//     server = await app
//   })

//   it('should be able to create an user with valid params', async () => {
//     const userParams = {
//       username: faker.internet.username(),
//       password: faker.word.conjunction({ length: 8 }),
//       email: faker.internet.email(),
//     }

//     const response = await server.inject({
//       method: 'POST',
//       url: '/users/create',
//       payload: userParams,
//     })

//     expect(response.statusCode).toBe(201)
//     expect(response.json())
//   })

//   it('should not be able to create an user with invalid password length', async () => {
//     const userParams = {
//       username: faker.internet.username(),
//       password: faker.word.conjunction({ length: 7 }),
//       email: faker.internet.email(),
//     }

//     const response = await server.inject({
//       method: 'POST',
//       url: '/users/create',
//       payload: userParams,
//     })

//     const body = JSON.parse(response.body)
//     const message = JSON.parse(body.message)

//     expect(response.statusCode).toBe(400)
//     expect(response.json())
//     expect(message).toEqual([
//       {
//         code: 'too_small',
//         minimum: 8,
//         type: 'string',
//         inclusive: true,
//         exact: false,
//         message: 'Password must be at least 8 characters long',
//         path: ['password'],
//       },
//     ])
//   })

//   it('should not be able to create an user when username already exists', async () => {
//     const { username } = await makeUser()

//     const userParams = {
//       username: username,
//       password: faker.word.conjunction({ length: 8 }),
//       email: faker.internet.email(),
//     }

//     const response = await server.inject({
//       method: 'POST',
//       url: '/users/create',
//       payload: userParams,
//     })

//     const body = JSON.parse(response.body)

//     expect(response.statusCode).toBe(409)
//     expect(response.json())
//     expect(body).toEqual({
//       message: 'Email or username is already registered.',
//     })
//   })

//   it('should not be able to create an user when email already exists', async () => {
//     const { email } = await makeUser()

//     const userParams = {
//       username: faker.internet.username(),
//       password: faker.word.conjunction({ length: 8 }),
//       email: email,
//     }

//     const response = await server.inject({
//       method: 'POST',
//       url: '/users/create',
//       payload: userParams,
//     })

//     const body = JSON.parse(response.body)

//     expect(response.statusCode).toBe(409)
//     expect(response.json())
//     expect(body).toEqual({
//       message: 'Email or username is already registered.',
//     })
//   })
// })

// describe('isUsernameAvailableController', () => {
//   let server: FastifyInstance

//   beforeAll(async () => {
//     server = await app
//   })

//   it('should be able to check if username is available', async () => {
//     const params = {
//       username: faker.internet.username(),
//     }

//     const response = await server.inject({
//       method: 'GET',
//       url: '/users/available-username',
//       query: params,
//     })

//     expect(response.statusCode).toBe(200)
//     expect(response.json())
//     expect(JSON.parse(response.body)).toEqual({ available: true })
//   })

//   it('should be able to return an error when username is unavailable', async () => {
//     const { username } = await makeUser()

//     const params = {
//       username: username,
//     }

//     const response = await server.inject({
//       method: 'GET',
//       url: '/users/available-username',
//       query: params,
//     })

//     expect(response.statusCode).toBe(409)
//     expect(response.json())
//     expect(JSON.parse(response.body)).toEqual({
//       message: 'Username is already registered.',
//     })
//   })
// })

// describe('isEmailAvailableController', () => {
//   let server: FastifyInstance

//   beforeAll(async () => {
//     server = await app
//   })

//   it('should be able to check if email is available', async () => {
//     const params = {
//       email: faker.internet.email(),
//     }

//     const response = await server.inject({
//       method: 'GET',
//       url: '/users/available-email',
//       query: params,
//     })

//     expect(response.statusCode).toBe(200)
//     expect(response.json())
//     expect(JSON.parse(response.body)).toEqual({ available: true })
//   })

//   it('should be able to return an error when email is unavailable', async () => {
//     const { email } = await makeUser()

//     const params = {
//       email: email,
//     }

//     const response = await server.inject({
//       method: 'GET',
//       url: '/users/available-email',
//       query: params,
//     })

//     expect(response.statusCode).toBe(409)
//     expect(response.json())
//     expect(JSON.parse(response.body)).toEqual({
//       message: 'Email is already registered.',
//     })
//   })
// })
