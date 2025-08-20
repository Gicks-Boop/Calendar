<template>
  <div v-if="mostrarModal" class="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <!-- Contenedor del modal - Responsivo -->
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[90vh] flex flex-col">
      <!-- Cabecera -->
      <div class="bg-gradient-to-r from-white-500 px-6 py-4 text-black flex items-center justify-between border-b border-gray-200 rounded-t-2xl">
        <!-- Títulos a la izquierda -->
        <div>
          <h3 class="text-lg md:text-xl font-semibold text-gray-900">Eliminar Usuario</h3>
          <p class="text-sm md:text-base text-gray-700">
            {{ !usuarioSeleccionado ? 'Selecciona el usuario a eliminar:' : 'Usuario seleccionado para eliminación:' }}
          </p>
        </div>

        <!-- Botón cerrar a la derecha -->
        <button @click="cerrar" class="text-black hover:text-red-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Contenido del modal -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <div class="p-6 md:p-8 space-y-6">
          <!-- Lista de usuarios para seleccionar -->
          <div v-if="!usuarioSeleccionado">
            <!-- Buscador -->
            <div class="mb-6">
              <label for="busqueda" class="block text-gray-700 font-medium mb-2">Buscar usuario</label>
              <input
                v-model="busqueda"
                type="text"
                id="busqueda"
                placeholder="Buscar por nombre, apellido o email..."
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-black bg-white text-base"
              >
            </div>

            <!-- Loading -->
            <div v-if="cargando" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
              <p class="mt-3 text-sm text-gray-600">Cargando usuarios...</p>
            </div>

            <!-- Lista de usuarios filtrados con grid responsivo -->
            <div v-else-if="usuariosFiltrados.length > 0" class="max-h-96 md:max-h-[400px] overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="usuario in usuariosFiltrados"
                  :key="usuario.id"
                  @click="seleccionarUsuario(usuario)"
                  class="p-4 cursor-pointer hover:bg-red-50 border border-gray-200 rounded-lg hover:border-red-300 hover:shadow-md transition-all duration-200"
                >
                  <div class="space-y-2">
                    <div>
                      <p class="font-medium text-gray-900">{{ usuario.nombre }} {{ usuario.apellido }}</p>
                      <p class="text-sm text-gray-600 break-all">{{ usuario.email }}</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="text-xs px-2 py-1 rounded-full"
                            :class="usuario.rol?.nombre === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                        {{ usuario.rol?.nombre || 'Sin rol' }}
                      </span>
                      <span v-if="usuario.oficina" class="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {{ usuario.oficina.nombre }}
                      </span>
                    </div>
                  </div>
                  <div class="mt-2 flex justify-end">
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- No hay usuarios -->
            <div v-else-if="!cargando" class="text-center py-12 text-gray-500">
              <svg class="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
              </svg>
              <p class="mt-4 text-lg">No se encontraron usuarios</p>
            </div>
          </div>

          <!-- Información del usuario seleccionado -->
          <div v-if="usuarioSeleccionado" class="space-y-4">
            <!-- Botón volver -->
            <button 
              type="button" 
              @click="usuarioSeleccionado = null" 
              class="flex items-center text-red-600 hover:text-red-800 transition-colors duration-200 font-medium text-sm md:text-base"
            >
              <svg class="w-4 h-4 md:w-5 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Volver a la lista
            </button>

            <!-- Información del usuario a eliminar - Optimizada para móvil -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm">
              <div class="flex items-center mb-3">
                <div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h4 class="text-base md:text-lg font-semibold text-red-900">Usuario seleccionado para eliminar</h4>
              </div>
              
              <div class="bg-white rounded-lg p-3 border border-red-200">
                <div class="space-y-3">
                  <!-- Información en formato vertical para móvil -->
                  <div class="space-y-2">
                    <div>
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</span>
                      <p class="text-sm md:text-base font-medium text-gray-900">{{ usuarioSeleccionado.nombre }} {{ usuarioSeleccionado.apellido }}</p>
                    </div>
                    
                    <div>
                      <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</span>
                      <p class="text-sm md:text-base text-gray-900 break-all">{{ usuarioSeleccionado.email }}</p>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Rol</span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                              :class="usuarioSeleccionado.rol?.nombre === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                          {{ usuarioSeleccionado.rol?.nombre || 'Sin rol' }}
                        </span>
                      </div>
                      
                      <div v-if="usuarioSeleccionado.oficina">
                        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1">Oficina</span>
                        <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {{ usuarioSeleccionado.oficina.nombre }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Advertencia optimizada para móvil -->
            <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 shadow-sm">
              <div class="flex items-start">
                <div class="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <h4 class="text-base md:text-lg font-semibold text-amber-900 mb-2">⚠️ Acción Irreversible</h4>
                  <div class="bg-white rounded-lg p-3 border border-amber-200">
                    <p class="text-sm text-amber-800 leading-relaxed mb-3">
                      Esta acción <span class="font-semibold">no se puede deshacer</span>. El usuario será eliminado permanentemente.
                    </p>
                    
                    <!-- Lista compacta para móvil -->
                    <div class="text-xs text-amber-700 space-y-1">
                      <div class="flex items-center">
                        <span class="w-1 h-1 bg-amber-500 rounded-full mr-2 flex-shrink-0"></span>
                        <span>Información personal</span>
                      </div>
                      <div class="flex items-center">
                        <span class="w-1 h-1 bg-amber-500 rounded-full mr-2 flex-shrink-0"></span>
                        <span>Historial de actividad</span>
                      </div>
                      <div class="flex items-center">
                        <span class="w-1 h-1 bg-amber-500 rounded-full mr-2 flex-shrink-0"></span>
                        <span>Acceso al sistema</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="bg-white px-6 py-4 md:px-8 border-t border-gray-200 flex justify-end gap-4 rounded-b-2xl">
        <button
          type="button"
          @click="cerrar"
          class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          :disabled="eliminando"
        >
          Cancelar
        </button>
        <button
          v-if="usuarioSeleccionado"
          type="button"
          :disabled="eliminando"
          class="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="mostrarConfirmacion"
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

  <!-- Modal de confirmación -->
  <div v-if="mostrarModalConfirmacion" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
      <div class="p-6">
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
        
        <div class="flex justify-center gap-3">
          <button
            @click="cancelarConfirmacion"
            class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmarEliminacion"
            class="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de notificación -->
  <div v-if="notificacion.mostrar" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4">
      <div class="p-6">
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
            class="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors"
            :class="notificacion.tipo === 'exito' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import User from '@/models/userService';
const userService = new User();

export default {
  name: 'EliminarUsuario',
  emits: ['cerrar', 'usuario-eliminado'],
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