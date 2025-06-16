// src/stores/user.js
import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    usuario: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.usuario,
  },
  actions: {
    loadUser() {
      const userData = localStorage.getItem('usuarioCalendario');
      this.usuario = userData ? JSON.parse(userData) : null;
    },
    login(usuario) {
      this.usuario = usuario;
      localStorage.setItem('usuarioCalendario', JSON.stringify(usuario));
    },
    logout() {
      this.usuario = null;
      localStorage.removeItem('usuarioCalendario');
    },
  },
});
