import { createRouter, createWebHistory } from 'vue-router';
import DiceRoller from '../components/DiceRoller.vue';
import Character from '../components/Character/Character.vue';

const routes = [
  {
    path: '/',
    redirect: '/dices',
  },
  {
    path: '/dices',
    name: 'Dices',
    component: DiceRoller
  },
  {
    path: '/character',
    name: 'Character',
    component: Character
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

export default router;
