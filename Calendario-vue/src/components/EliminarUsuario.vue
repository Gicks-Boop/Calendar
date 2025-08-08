<template>
  <div v-if="mostrarModal" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Eliminar Usuario</h3>
        <button @click="cerrar" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Lista de usuarios -->
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Selecciona el usuario a eliminar:
        </label>
        
        <!-- Buscador -->
        <div class="mb-3">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar usuario..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
          <p class="mt-2 text-sm text-gray-600">Cargando usuarios...</p>
        </div>

        <!-- Lista de usuarios filtrados -->
        <div v-else-if="usuariosFiltrados.length > 0" class="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
          <div
            v-for="usuario in usuariosFiltrados"
            :key="usuario.id"
            @click="seleccionarUsuario(usuario)"
            :class="[
              'p-3 cursor-pointer hover:bg-red-50 border-b border-gray-100 last:border-b-0',
              usuarioSeleccionado?.id === usuario.id ? 'bg-red-100 border-red-200' : ''
            ]"
          >
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">{{ usuario.nombre }} {{ usuario.apellido }}</p>
                <p class="text-sm text-gray-600">{{ usuario.email }}</p>
                <!-- <p class="text-xs text-gray-500">{{ usuario.oficina || 'Sin oficina' }}</p> -->
              </div>
              <div class="flex items-center">
                <span class="text-xs px-2 py-1 rounded-full"
                      :class="usuario.rol?.nombre === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                  {{ usuario.rol?.nombre || 'Sin rol' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- No hay usuarios -->
        <div v-else-if="!cargando" class="text-center py-4 text-gray-500">
          <p>No se encontraron usuarios</p>
        </div>
      </div>

      <!-- Usuario seleccionado -->
      <div v-if="usuarioSeleccionado" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <h4 class="font-medium text-red-900 mb-2">Usuario seleccionado para eliminar:</h4>
        <div class="text-sm text-red-800">
          <p><strong>Nombre:</strong> {{ usuarioSeleccionado.nombre }} {{ usuarioSeleccionado.apellido }}</p>
          <p><strong>Email:</strong> {{ usuarioSeleccionado.email }}</p>
          <p><strong>Rol:</strong> {{ usuarioSeleccionado.rol?.nombre || 'Sin rol' }}</p>
        </div>
      </div>

      <!-- Advertencia -->
      <div v-if="usuarioSeleccionado" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <div class="flex">
          <svg class="w-5 h-5 text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div>
            <h4 class="text-sm font-medium text-yellow-800">¡Advertencia!</h4>
            <p class="text-sm text-yellow-700">Esta acción no se puede deshacer. El usuario será eliminado permanentemente del sistema.</p>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="sticky bottom-0 bg-white/95 backdrop-blur-md shadow-md border-t border-gray-200 px-4 sm:px-6 py-4 z-50">
        <div class="flex flex-col sm:flex-row sm:justify-between items-stretch gap-4 sm:gap-6">
        <button
          @click="cerrar"
          class="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          @click="mostrarConfirmacion"
          :disabled="!usuarioSeleccionado || eliminando"
          class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="eliminando" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ eliminando ? 'Eliminando...' : 'Eliminar Usuario' }}
        </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de confirmación -->
  <div v-if="mostrarModalConfirmacion" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60]">
    <div class="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl">
      <div class="flex items-center justify-center mb-4">
        <div class="p-3 bg-red-100 rounded-full">
          <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
        </div>
      </div>
      
      <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">Confirmar Eliminación</h3>
      
      <p class="text-sm text-gray-600 text-center mb-6">
        ¿Estás seguro de que deseas eliminar al usuario <strong>{{ usuarioSeleccionado?.nombre }} {{ usuarioSeleccionado?.apellido }}</strong>? 
        Esta acción no se puede deshacer.
      </p>
      
      <div class="flex justify-center space-x-3">
        <button
          @click="cancelarConfirmacion"
          class="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          @click="confirmarEliminacion"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Sí, eliminar
        </button>
      </div>
    </div>
  </div>

  <!-- Modal de notificación -->
  <div v-if="notificacion.mostrar" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[70]">
    <div class="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl">
      <div class="flex items-center justify-center mb-4">
        <div class="p-3 rounded-full" :class="notificacion.tipo === 'exito' ? 'bg-green-100' : 'bg-red-100'">
          <svg v-if="notificacion.tipo === 'exito'" class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <svg v-else class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
      </div>
      
      <h3 class="text-lg font-semibold text-gray-900 text-center mb-2">
        {{ notificacion.tipo === 'exito' ? 'Éxito' : 'Error' }}
      </h3>
      
      <p class="text-sm text-gray-600 text-center mb-6">
        {{ notificacion.mensaje }}
      </p>
      
      <div class="flex justify-center">
        <button
          @click="cerrarNotificacion"
          class="px-4 py-2 text-white rounded-md transition-colors"
          :class="notificacion.tipo === 'exito' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
        >
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import User from '@/models/userService';
const userService = new User();

export default {
  name: 'EliminarUsuario',
  props: {
    mostrarModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      usuarios: [],
      usuarioSeleccionado: null,
      busqueda: '',
      cargando: false,
      eliminando: false,
      mostrarModalConfirmacion: false,
      notificacion: {
        mostrar: false,
        tipo: 'exito', // 'exito' o 'error'
        mensaje: ''
      }
    };
  },
  computed: {
    usuariosFiltrados() {
      if (!this.busqueda) return this.usuarios;
      
      const termino = this.busqueda.toLowerCase();
      return this.usuarios.filter(usuario =>
        usuario.nombre.toLowerCase().includes(termino) ||
        usuario.apellido.toLowerCase().includes(termino) ||
        usuario.email.toLowerCase().includes(termino)
      );
    }
  },
  watch: {
    mostrarModal(nuevo) {
      if (nuevo) {
        this.cargarUsuarios();
        this.resetearModal();
      }
    }
  },
  methods: {
    async cargarUsuarios() {
      this.cargando = true;
      try {
        const response = await userService.getAllUsers();
        
        // Filtrar usuarios eliminados
        const usuariosBrutos = response.data || response || [];
        this.usuarios = usuariosBrutos.filter(usuario => !usuario.fechaDelete);
        
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        this.mostrarNotificacion('error', 'Error al cargar la lista de usuarios: ' + error.message);
      } finally {
        this.cargando = false;
      }
    },

    seleccionarUsuario(usuario) {
      this.usuarioSeleccionado = usuario;
    },

    mostrarConfirmacion() {
      if (!this.usuarioSeleccionado) return;
      this.mostrarModalConfirmacion = true;
    },

    cancelarConfirmacion() {
      this.mostrarModalConfirmacion = false;
    },

    async confirmarEliminacion() {
      this.mostrarModalConfirmacion = false;
      await this.eliminarUsuario();
    },

    async eliminarUsuario() {
      if (!this.usuarioSeleccionado) return;

      this.eliminando = true;
      try {
        await userService.deleteUser(this.usuarioSeleccionado.id);
        
        const nombreCompleto = `${this.usuarioSeleccionado.name} ${this.usuarioSeleccionado.lastName}`;
        this.mostrarNotificacion('exito', `Usuario ${nombreCompleto} eliminado correctamente`);
        
        // Remover de la lista local
        this.usuarios = this.usuarios.filter(u => u.id !== this.usuarioSeleccionado.id);
        
        this.$emit('usuario-eliminado', this.usuarioSeleccionado);
        
        // Cerrar el modal principal después de mostrar la notificación
        setTimeout(() => {
          this.cerrar();
        }, 2000);
        
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
        this.mostrarNotificacion('error', 'Error al eliminar el usuario: ' + error.message);
      } finally {
        this.eliminando = false;
      }
    },

    mostrarNotificacion(tipo, mensaje) {
      this.notificacion = {
        mostrar: true,
        tipo,
        mensaje
      };
    },

    cerrarNotificacion() {
      this.notificacion.mostrar = false;
    },

    resetearModal() {
      this.usuarioSeleccionado = null;
      this.busqueda = '';
      this.eliminando = false;
      this.mostrarModalConfirmacion = false;
      this.notificacion.mostrar = false;
    },

    cerrar() {
      this.resetearModal();
      this.$emit('cerrar');
    }
  }
};
</script>