import { createRouter, createWebHistory } from 'vue-router';
import CalendarioView from '../Views/CalendarioView.vue';
import RegistroUsuario from '../Views/Registro-Usuario.vue';
import login from '@/Views/Inicio-Sesion.vue';

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