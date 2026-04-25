import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue')
  },
  {
    path: '/server-form',
    name: 'ServerForm',
    component: () => import('@/views/ServerFormView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
