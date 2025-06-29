<template>
  <div class="relative">
    <!-- Botón de notificaciones -->
    <button
      @click="togglePanel"
      class="relative p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white"
      title="Notificaciones"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      
      <!-- Badge de notificaciones no leídas -->
      <span
        v-if="contadorNoLeidas > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse"
      >
        {{ contadorNoLeidas > 99 ? '99+' : contadorNoLeidas }}
      </span>
    </button>

    <!-- Panel de notificaciones -->
    <div
      v-if="mostrarPanel"
      class="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      <!-- Header del panel -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 class="font-semibold">Notificaciones</h3>
        <div class="flex items-center space-x-2">
          <button
            v-if="contadorNoLeidas > 0"
            @click="marcarTodasLeidas"
            class="text-xs bg-blue-700 hover:bg-blue-800 px-2 py-1 rounded transition-colors"
            title="Marcar todas como leídas"
          >
            Marcar todas
          </button>
          <button
            @click="cerrarPanel"
            class="hover:bg-blue-700 p-1 rounded transition-colors"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="cargando" class="p-4 text-center">
        <svg class="animate-spin h-6 w-6 mx-auto text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-sm text-gray-600 mt-2">Cargando notificaciones...</p>
      </div>

      <!-- Lista de notificaciones -->
      <div v-else-if="notificaciones.length > 0" class="max-h-80 overflow-y-auto">
        <div
          v-for="notificacion in notificaciones"
          :key="notificacion.id"
          :class="[
            'p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer',
            { 'bg-blue-50 border-l-4 border-l-blue-500': !notificacion.leido }
          ]"
          @click="marcarComoLeida(notificacion)"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <p class="text-sm text-gray-800 leading-relaxed">
                {{ notificacion.mensaje }}
              </p>
              <p class="text-xs text-gray-500 mt-1">
                {{ formatearFecha(notificacion.fechaCreacion) }}
              </p>
            </div>
            
            <div class="flex items-center space-x-1 ml-2">
              <!-- Indicador de no leída -->
              <div
                v-if="!notificacion.leido"
                class="w-2 h-2 bg-blue-500 rounded-full"
                title="No leída"
              ></div>
              
              <!-- Botón eliminar -->
              <button
                @click.stop="eliminarNotificacion(notificacion.id)"
                class="text-gray-400 hover:text-red-500 p-1 rounded transition-colors"
                title="Eliminar notificación"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-else class="p-8 text-center text-gray-500">
        <svg class="h-12 w-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
        <p class="text-sm">No tienes notificaciones</p>
        <button
          @click="refrescarNotificaciones"
          class="text-xs text-blue-500 hover:text-blue-700 mt-2"
        >
          Refrescar
        </button>
      </div>

      <!-- Footer con opciones -->
      <div v-if="notificaciones.length > 0" class="bg-gray-50 px-4 py-2 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <button
            @click="refrescarNotificaciones"
            class="text-xs text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg class="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Refrescar
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay para cerrar el panel -->
    <div
      v-if="mostrarPanel"
      @click="cerrarPanel"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script>
import NotificacionService from '@/models/notificacionService';

// Instancia global del servicio de notificaciones
const notificacionService = new NotificacionService();

export default {
  name: 'NotificacionesComponent',
  
  data() {
    return {
      mostrarPanel: false,
      notificaciones: [],
      cargando: false,
      intervaloPoll: null,
      enviandoPrueba: false,
    };
  },

  computed: {
    contadorNoLeidas() {
      return this.notificaciones.filter(n => !n.leido).length;
    }
  },

  mounted() {
    this.cargarNotificaciones();
    this.iniciarPolling();
  },

  beforeUnmount() {
    this.detenerPolling();
  },

  methods: {
    async cargarNotificaciones() {
      try {
        this.cargando = true;
        const response = await notificacionService.getNotificacionesUsuarioActual();
        
        // Tu backend devuelve un array directamente
        this.notificaciones = Array.isArray(response) ? response : (response.data || []);
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        this.notificaciones = [];
      } finally {
        this.cargando = false;
      }
    },

    async marcarComoLeida(notificacion) {
      if (notificacion.leido) return;

      try {
        await notificacionService.marcarComoLeida(notificacion.id);
        notificacion.leido = true;
      } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
      }
    },

    async marcarTodasLeidas() {
      try {
        await notificacionService.marcarTodasComoLeidas();
        this.notificaciones.forEach(n => n.leido = true);
      } catch (error) {
        console.error('Error al marcar todas como leídas:', error);
      }
    },

    async eliminarNotificacion(notificacionId) {
      try {
        await notificacionService.eliminarNotificacion(notificacionId);
        this.notificaciones = this.notificaciones.filter(n => n.id !== notificacionId);
      } catch (error) {
        console.error('Error al eliminar notificación:', error);
        
        // Si el error es 404, la notificación ya no existe en el servidor
        // pero la eliminamos de la lista local
        if (error.message.includes('404') || error.message.includes('no encontrada')) {
          this.notificaciones = this.notificaciones.filter(n => n.id !== notificacionId);
        }
      }
    },

    async refrescarNotificaciones() {
      await this.cargarNotificaciones();
    },

    async enviarNotificacionPrueba() {
      try {
        this.enviandoPrueba = true;
        
        const mensaje = `🧪 Notificación de prueba enviada el ${new Date().toLocaleString('es-ES')}. Este email debería llegar a tu bandeja de entrada.`;
        
        await notificacionService.crearNotificacion(mensaje);
        
        // Actualizar la lista para mostrar la nueva notificación
        await this.cargarNotificaciones();
        
        console.log('✅ Notificación de prueba enviada con email');
      } catch (error) {
        console.error('❌ Error al enviar notificación de prueba:', error);
      } finally {
        this.enviandoPrueba = false;
      }
    },

    togglePanel() {
      this.mostrarPanel = !this.mostrarPanel;
      if (this.mostrarPanel) {
        this.cargarNotificaciones();
      }
    },

    cerrarPanel() {
      this.mostrarPanel = false;
    },

    formatearFecha(fechaISO) {
      try {
        const fecha = new Date(fechaISO);
        const ahora = new Date();
        const diferencia = ahora - fecha;
        const minutos = Math.floor(diferencia / 60000);
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);

        if (minutos < 1) return 'Ahora';
        if (minutos < 60) return `Hace ${minutos}m`;
        if (horas < 24) return `Hace ${horas}h`;
        if (dias < 7) return `Hace ${dias}d`;
        
        return fecha.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
      } catch (error) {
        return fechaISO;
      }
    },

    iniciarPolling() {
      // Verificar nuevas notificaciones cada 30 segundos
      this.intervaloPoll = setInterval(() => {
        if (!this.mostrarPanel) {
          this.verificarNuevasNotificaciones();
        }
      }, 30000);
    },

    detenerPolling() {
      if (this.intervaloPoll) {
        clearInterval(this.intervaloPoll);
        this.intervaloPoll = null;
      }
    },

    async verificarNuevasNotificaciones() {
      try {
        const response = await notificacionService.getNotificacionesNoLeidas();
        const nuevasNotificaciones = Array.isArray(response) ? response : (response.data || []);
        
        // Solo actualizar si hay cambios
        if (nuevasNotificaciones.length !== this.contadorNoLeidas) {
          await this.cargarNotificaciones();
        }
      } catch (error) {
        // Silenciosamente fallar para no spam en consola
        console.warn('Error al verificar nuevas notificaciones:', error);
      }
    }
  }
}
</script>

<style scoped>
/* Animación suave para el panel */
.absolute {
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>