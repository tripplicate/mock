import { h, provide, createApp } from 'vue';

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { DefaultApolloClient } from '@vue/apollo-composable';

import App from './App.vue';

import './assets/main.css';

const httpLink = createHttpLink({
  uri: import.meta.env.BASE_URL,
});

// Cache implementation
const cache = new InMemoryCache();

// Create the apollo client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});

const enableMocking = async () => {
  if (import.meta.env.DEV) {
    const { worker } = await import('./mocks/browser');

    return worker.start();
  }
};

enableMocking()
  .then(() => {
    createApp({
      name: 'Application',
      setup() {
        provide(DefaultApolloClient, apolloClient);
      },

      render: () => h(App),
    }).mount('#app');
  })
  .catch(Error);
