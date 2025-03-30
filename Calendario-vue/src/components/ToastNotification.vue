<template>
  <div class="toast-container fixed right-4 bottom-4 flex flex-col gap-2 z-50">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast-notification py-3 px-4 rounded-lg shadow-lg flex items-center max-w-sm',
          {
            'bg-green-500 text-white': toast.tipo === 'success',
            'bg-red-500 text-white': toast.tipo === 'error',
            'bg-yellow-500 text-white': toast.tipo === 'warning',
            'bg-blue-500 text-white': toast.tipo === 'info'
          }
        ]"
      >
        <!-- Ícono según el tipo -->
        <div class="mr-3">
          <!-- Ícono de success -->
          <svg
            v-if="toast.tipo === 'success'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>

          <!-- Ícono de error -->
          <svg
            v-else-if="toast.tipo === 'error'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>

          <!-- Ícono de warning -->
          <svg
            v-else-if="toast.tipo === 'warning'"
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>

          <!-- Ícono de info -->
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <!-- Mensaje del toast -->
        <div class="flex-1">{{ toast.mensaje }}</div>

        <!-- Botón para cerrar el toast manualmente -->
        <button
          @click="cerrarToast(toast.id)"
          class="ml-2 text-white opacity-70 hover:opacity-100 focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'ToastNotification',
  data() {
    return {
      toasts: [],
      contador: 0
    };
  },
  methods: {
    mostrarToast(mensaje, tipo = 'info', duracion = 3000) {
      // Incrementar contador para ID único
      this.contador++;

      // Crear nuevo toast
      const nuevoToast = {
        id: this.contador,
        mensaje,
        tipo,
        temporizador: null
      };

      // Agregar toast a la lista
      this.toasts.push(nuevoToast);

      // Configurar auto-eliminación después de la duración
      nuevoToast.temporizador = setTimeout(() => {
        this.cerrarToast(nuevoToast.id);
      }, duracion);
    },

    cerrarToast(id) {
      // Encontrar el índice del toast
      const index = this.toasts.findIndex(toast => toast.id === id);

      if (index !== -1) {
        // Limpiar el temporizador si existe
        if (this.toasts[index].temporizador) {
          clearTimeout(this.toasts[index].temporizador);
        }

        // Eliminar el toast de la lista
        this.toasts.splice(index, 1);
      }
    }
  }
};
</script>

<style scoped>
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(30px);
}
</style>
