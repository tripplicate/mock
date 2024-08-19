import { HttpResponse, delay, graphql } from 'msw'
import { buildSchema, graphql as executeGraphQL } from 'graphql'
import { faker } from '@faker-js/faker'

const storage = new Map()

for (let i = 0; i < 20; i++) {
  const uuid = faker.string.uuid()

  storage.set(uuid, {
    uuid,
    firsName: faker.person.firstName,
    lastName: faker.person.lastName,
  })
}

const schema = buildSchema(`
  type User {
    uuid: ID!
  }

  type Query {
    users: [User!]
  }
`)

export const handlers = [
  graphql.query('GetUsers', async ({ query, variables }) => {
    await delay()

    const { errors, data } = await executeGraphQL({
      schema,
      source: query,
      variableValues: variables,
      rootValue: {
        users: Array.from(storage.values()),
      },
    })

    return HttpResponse.json({
      data,
      errors,
    })
  }),

  graphql.mutation('CreateUser', async ({ variables }) => {
    await delay()

    const { user } = variables

    storage.set(user.uuid, user)

    if (storage.get(user.uuid)) {
      return HttpResponse.json({
        data: {
          createUser: {
            uuid: user.uuid,
          },
        },
      })
    }
    else {
      return HttpResponse.json({
        errors: [
          {
            message: `Cannot create user with uuid ${user.uuid}`,
          },
        ],
      })
    }
  }),
]
