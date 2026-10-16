import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/vagas/nova',
      name: 'vagas.nova',
      component: () => import('@/views/PublicarVagaView.vue'),
    },
    {
      path: '/vagas/:id(\\d+)',
      name: 'vagas.detalhe',
      component: () => import('@/views/VagaDetalheView.vue'),
      props: (rota) => ({ id: Number(rota.params.id) }),
    },
    {
      path: '/:caminho(.*)*',
      name: 'nao-encontrado',
      component: () => import('@/views/NaoEncontradoView.vue'),
    },
  ],
  scrollBehavior: (_to, _from, posicaoSalva) => posicaoSalva ?? { top: 0 },
})

export default router
