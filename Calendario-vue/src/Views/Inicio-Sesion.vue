<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-50 p-4">
    <div class="w-full max-w-md">
      <!-- Tarjeta de autenticación -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <!-- Cabecera -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white text-center">
          <h2 class="text-2xl font-bold">{{ 'Iniciar sesión' }}</h2>
          <p class="mt-1 text-blue-100">Accede a tu calendario personal</p>
        </div>

        <!-- Formulario -->
        <div class="p-6">
          <form @submit.prevent="submitForm">
            <!-- Campo de email -->
            <div class="mb-4">
              <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input type="email" id="email" v-model="Usuario.email"
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@correo.com" required />
              </div>
            </div>

            <!-- Campo de contraseña -->
            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input :type="mostrarPassword ? 'text' : 'password'" id="password" v-model="Usuario.password"
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••" required minlength="6" />
                <button type="button" @click="mostrarPassword = !mostrarPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <svg v-if="mostrarPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Checkbox "Recordarme" (solo para inicio de sesión) -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <input id="remember" type="checkbox" v-model="recordarme"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <label for="remember" class="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
            </div>

            <!-- Mensaje de error general -->
            <div v-if="error" class="mb-4 p-3 bg-red-100 rounded-md border border-red-300 text-red-700 text-sm">
              {{ error }}
            </div>

            <!-- Botón de acción -->
            <div class="mt-6">
              <button type="submit"
                class="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200">
                Login
              </button>
            </div>
          </form>
          <!-- Link a registro -->
          <div class="mt-4 text-center">
            <p class="text-sm text-gray-600">¿No tienes una cuenta?
              <router-link to="/registro" class="text-blue-600 hover:underline">Regístrate aquí</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Auth from '@/models/authService';
const _auth = new Auth()

export default {
  name: 'login',

  data() {
    return {
      Usuario: {
        email: '',
        password: '',
      },
      recordarme: false,
      error: null,
      mostrarPassword: false,
      errorConfirmacion: false
    };
  },
  methods: {
    validarFormulario() {
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.Usuario.email)) {
        this.error = "Por favor, introduce un correo electrónico válido.";
        return false
      }

      // Validar contraseña
      if (this.Usuario.password.length < 6) {
        this.error = "La contraseña debe tener al menos 6 caracteres.";
        return false
      }

      return true;
    },

    async submitForm() {
      this.error = null;

      if (!this.validarFormulario()) return;

      try {
        const response = await _auth.loginUsuario(this.Usuario.email, this.Usuario.password); 
        
        this.$session.assignUser(response)
        this.$router.push('/calendario');

      } catch (err) {
        this.error = err.message || 'usuario no encontrado';
      }
    },


  },
};
</script>
