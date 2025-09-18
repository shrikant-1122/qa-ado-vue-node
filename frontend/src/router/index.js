import { createRouter, createWebHistory } from 'vue-router';
import Metrics from '../views/Metrics.vue';
import Chat from '../views/Chat.vue';

const routes = [
  { path: '/metrics', name: 'Metrics', component: Metrics },
  { path: '/chat', name: 'Chat', component: Chat },
  { path: '/', redirect: '/metrics' }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
