<script setup lang="ts">
import { faker } from '@faker-js/faker'
import { useMutation, useQuery } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const getUsers = gql`
  query GetUsers {
          users {
            uuid
          }
        }
`

const { result: users, loading: isUsersLoading } = useQuery(getUsers)

/**
 * Механизм инвалидации кеша при мутации, случай, когда необходимо сделать hot-reload
 */
const { mutate } = useMutation(gql`
  mutation CreateUser($user: UserInput!) {
    createUser(user: $user) {
      uuid
    }
  }
`, {
  update(cache, { data: { createUser } }) {
    let data = cache.readQuery({ query: getUsers })

    data = { ...data, users: [
      ...data.users,
      {
        ...createUser,
      },
    ] }

    cache.writeQuery({ query: getUsers, data })
  },
})

async function handleCreate() {
  await mutate({
    user: {
      uuid: faker.string.uuid(),
    },
  })
}
</script>

<template>
  <main>
    <h1>Hello</h1>
    <button @click="handleCreate">
      create
    </button>

    <span v-if="isUsersLoading">loading</span>
    <section v-else class="flex flex-col">
      <article v-for="user in users.users" :key="user.uuid">
        {{ user.uuid }}
      </article>
    </section>
  </main>
</template>
