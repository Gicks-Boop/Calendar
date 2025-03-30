<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-50 p-4">
    <div class="w-full max-w-md">
      <!-- Tarjeta de autenticación -->
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <!-- Cabecera -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white text-center">
          <h2 class="text-2xl font-bold">{{ esModoRegistro ? 'Crear una cuenta' : 'Iniciar sesión' }}</h2>
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
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  v-model="usuario.email"
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tu@correo.com"
                  required
                />
              </div>
            </div>

            <!-- Campo de nombre (solo para registro) -->
            <div v-if="esModoRegistro" class="mb-4">
              <label for="nombre" class="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  id="nombre"
                  v-model="usuario.nombre"
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre Apellido"
                  required
                />
              </div>
            </div>

            <!-- Campo de contraseña -->
            <div class="mb-4">
              <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  :type="mostrarPassword ? 'text' : 'password'"
                  id="password"
                  v-model="usuario.password"
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                  minlength="6"
                />
                <button
                  type="button"
                  @click="mostrarPassword = !mostrarPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg v-if="mostrarPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Confirmación de contraseña (solo para registro) -->
            <div v-if="esModoRegistro" class="mb-4">
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  :type="mostrarPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  class="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                  required
                  minlength="6"
                />
              </div>
              <p v-if="errorConfirmacion" class="mt-1 text-sm text-red-600">
                Las contraseñas no coinciden
              </p>
            </div>

            <!-- Checkbox "Recordarme" (solo para inicio de sesión) -->
            <div v-if="!esModoRegistro" class="flex items-center justify-between mb-4">
              <div class="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  v-model="recordarme"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="remember" class="ml-2 block text-sm text-gray-700">
                  Recordarme
                </label>
              </div>
              <div class="text-sm">
                <a href="#" class="font-medium text-blue-600 hover:text-blue-500">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            <!-- Mensaje de error general -->
            <div v-if="error" class="mb-4 p-3 bg-red-100 rounded-md border border-red-300 text-red-700 text-sm">
              {{ error }}
            </div>

            <!-- Botón de acción -->
            <div class="mt-6">
              <button
                type="submit"
                class="w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                :class="{ 'opacity-75 cursor-wait': cargando }"
                :disabled="cargando"
              >
                <span v-if="cargando">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
                <span v-else>
                  {{ esModoRegistro ? 'Registrarse' : 'Iniciar sesión' }}
                </span>
              </button>
            </div>

            <!-- Enlace para cambiar entre registro e inicio de sesión -->
            <div class="text-center mt-4">
              <button
                type="button"
                class="text-sm font-medium text-blue-600 hover:text-blue-500"
                @click="cambiarModo"
              >
                {{ esModoRegistro ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes una cuenta? Regístrate' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Separador -->
        <div class="relative my-2 mx-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">O continúa con</span>
          </div>
        </div>

        <!-- Botones de redes sociales -->
        <div class="p-6 pt-0 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google
          </button>
          <button
            type="button"
            class="w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center"
          >
            <svg class="w-5 h-5 mr-2 text-[#3b5998]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
            Facebook
          </button>
        </div>
      </div>

      <!-- Política de privacidad -->
      <div class="text-center mt-4 text-xs text-gray-600">
        Al registrarte, aceptas nuestros <a href="#" class="text-blue-600 hover:underline">Términos de servicio</a> y <a href="#" class="text-blue-600 hover:underline">Política de privacidad</a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AuthComponent',
  data() {
    return {
      esModoRegistro: false,
      usuario: {
        email: '',
        password: '',
        nombre: ''
      },
      confirmPassword: '',
      recordarme: false,
      error: null,
      cargando: false,
      mostrarPassword: false,
      errorConfirmacion: false
    };
  },
  methods: {
    cambiarModo() {
      this.esModoRegistro = !this.esModoRegistro;
      this.error = null;
      this.errorConfirmacion = false;
    },
    validarFormulario() {
      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.usuario.email)) {
        this.error = "Por favor, introduce un correo electrónico válido.";
        return false;
      }

      // Validar contraseña
      if (this.usuario.password.length < 6) {
        this.error = "La contraseña debe tener al menos 6 caracteres.";
        return false;
      }

      // Si es modo registro, validar que las contraseñas coincidan
      if (this.esModoRegistro) {
        if (this.usuario.password !== this.confirmPassword) {
          this.errorConfirmacion = true;
          this.error = "Las contraseñas no coinciden.";
          return false;
        }

        // Validar que se haya ingresado un nombre
        if (!this.usuario.nombre || this.usuario.nombre.trim() === '') {
          this.error = "Por favor, introduce tu nombre completo.";
          return false;
        }
      }

      return true;
    },
    async submitForm() {
      // Limpiar errores previos
      this.error = null;
      this.errorConfirmacion = false;

      // Validar formulario
      if (!this.validarFormulario()) {
        return;
      }

      // Simular proceso de autenticación
      try {
        this.cargando = true;

        // Simular llamada a API (reemplazar con llamada real)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simular respuesta exitosa
        if (this.esModoRegistro) {
          console.log('Usuario registrado:', {
            email: this.usuario.email,
            nombre: this.usuario.nombre
          });
          // Aquí puedes redirigir al usuario o mostrar un mensaje de éxito
          this.$emit('auth-success', {
            email: this.usuario.email,
            nombre: this.usuario.nombre,
            accion: 'registro'
          });
        } else {
          console.log('Usuario autenticado:', {
            email: this.usuario.email,
            recordarme: this.recordarme
          });
          // Aquí puedes redirigir al usuario al calendario
          this.$emit('auth-success', {
            email: this.usuario.email,
            recordarme: this.recordarme,
            accion: 'login'
          });
        }
      } catch (err) {
        // Manejo de errores
        this.error = "Ocurrió un error. Por favor, intenta nuevamente.";
        console.error('Error de autenticación:', err);
      } finally {
        this.cargando = false;
      }
    }
  }
};
</script>
