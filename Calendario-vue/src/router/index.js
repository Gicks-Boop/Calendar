import { createRouter, createWebHistory } from 'vue-router';
import RegistroUsuario from '@/Views/Registro-Usuario.vue';
import login from '@/Views/Inicio-Sesion.vue';
import CalendarioMain from '@/Views/Calendario-main.vue';
import Session from '@/middleware/session';

const routes = [
  {
    path: '/',
    redirect: () => {
      const usuario = Session.GetSession();
      return usuario ? '/calendario' : '/login';
    }
  },
  {path:'/login', component:login},
  {path:'/registro', component:RegistroUsuario},
  {path: '/calendario',component: CalendarioMain},
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Guard de navegación
router.beforeEach((to, from, next) => {
  const usuario = Session.GetSession();
  
  if (to.path === '/calendario' && !usuario) {
    next('/login');
  } else if (to.path === '/login' && usuario) {
    next('/calendario');
  } else if (to.path === '/registro') {
    // NUEVO: Verificar que esté autenticado Y sea ADMIN para acceder a registro
    if (!usuario) {
      next('/login');
    } else if (usuario.rol?.nombre !== 'ADMIN') {
      next('/calendario'); // Si no es ADMIN, redirigir al calendario
    } else {
      next(); // Es ADMIN, permitir acceso
    }
  } else {
    next();
  }
});

export default router;