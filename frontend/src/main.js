import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Chat from './views/Chat.vue';
import Metrics from './views/Metrics.vue';

const routes = [
  { path: '/', redirect: '/chat' },
  { path: '/chat', component: Chat },
  { path: '/metrics', component: Metrics },
];

const router = createRouter({ history: createWebHistory(), routes });
createApp(App).use(router).mount('#app');
