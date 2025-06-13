import { createRouter, createWebHistory } from 'vue-router';
import CalendarioView from '@/views/CalendarioView.vue';
import RegistroUsuario from '@/views/Registro-Usuario.vue';
import login from '@/views/Inicio-Sesion.vue';

const routes = [
  {path:'/', component:login},
  {path:'/registro', component:RegistroUsuario},
  {path: '/calendario',component: CalendarioView},
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;