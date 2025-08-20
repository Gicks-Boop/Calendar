<template>
  <div v-if="mostrarModal" class="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <!-- Contenedor del modal - Responsivo -->
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md md:max-w-2xl lg:max-w-3xl xl:max-w-4xl max-h-[90vh] flex flex-col">
      <!-- Cabecera -->
      <div class="bg-gradient-to-r from-white-500 px-6 py-4 text-black flex items-center justify-between border-b border-gray-200 rounded-t-2xl">
        <!-- Títulos a la izquierda -->
        <div>
          <h3 class="text-lg md:text-xl font-semibold text-gray-900">Editar Usuario</h3>
          <p class="text-sm md:text-base text-gray-700">
            {{ !usuarioSeleccionado ? 'Selecciona el usuario a editar:' : 'Completa los siguientes campos:' }}
          </p>
        </div>

        <!-- Botón cerrar a la derecha -->
        <button @click="cerrar" class="text-black hover:text-red-600 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Contenido del formulario -->
      <div class="flex-1 overflow-y-auto min-h-0">
        <div class="p-6 md:p-8 space-y-6">
          <!-- Mensajes de error o éxito -->
          <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {{ error }}
          </div>
          <div v-if="exito" class="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
            {{ exito }}
          </div>

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
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white text-base"
              >
            </div>

            <!-- Loading -->
            <div v-if="cargando" class="text-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p class="mt-3 text-sm text-gray-600">Cargando usuarios...</p>
            </div>

            <!-- Lista de usuarios filtrados con grid responsivo -->
            <div v-else-if="usuariosFiltrados.length > 0" class="max-h-96 md:max-h-[400px] overflow-y-auto">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  v-for="usuario in usuariosFiltrados"
                  :key="usuario.id"
                  @click="seleccionarUsuario(usuario)"
                  class="p-4 cursor-pointer hover:bg-blue-50 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
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

          <!-- Formulario de edición -->
          <form v-if="usuarioSeleccionado" class="space-y-6" @submit.prevent="actualizarUsuario">
            <!-- Botón volver -->
            <button 
              type="button" 
              @click="volverALista" 
              class="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Volver a la lista
            </button>

            <!-- Información del usuario -->
            <div class="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg">
              <h4 class="font-medium text-blue-900">Editando usuario:</h4>
              <p class="text-sm text-blue-800">{{ usuarioOriginal.nombre }} {{ usuarioOriginal.apellido }}</p>
            </div>

            <!-- Campos del formulario en grid responsivo -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Campo Nombre -->
              <div>
                <label for="nombre" class="block text-gray-700 font-medium mb-2">Nombre</label>
                <input
                  v-model="formulario.nombre"
                  type="text"
                  id="nombre"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  placeholder="Nombre del usuario"
                  :disabled="actualizando"
                >
              </div>

              <!-- Campo Apellido -->
              <div>
                <label for="apellido" class="block text-gray-700 font-medium mb-2">Apellido</label>
                <input
                  v-model="formulario.apellido"
                  type="text"
                  id="apellido"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  placeholder="Apellido del usuario"
                  :disabled="actualizando"
                >
              </div>
            </div>

            <!-- Campo Email (ancho completo) -->
            <div>
              <label for="email" class="block text-gray-700 font-medium mb-2">Email</label>
              <input
                v-model="formulario.email"
                type="email"
                id="email"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                placeholder="correo@ejemplo.com"
                :disabled="actualizando"
              >
            </div>

            <!-- Campo Contraseña (ancho completo) -->
            <div>
              <label for="password" class="block text-gray-700 font-medium mb-2">Nueva Contraseña (opcional)</label>
              <input
                v-model="formulario.password"
                type="password"
                id="password"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                placeholder="Dejar vacío para no cambiar"
                :disabled="actualizando"
              >
            </div>

            <!-- Selectores en grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Selección de Rol -->
              <div v-if="roles.length > 0">
                <label for="idRol" class="block text-gray-700 font-medium mb-2">Rol</label>
                <select
                  v-model="formulario.idRol"
                  id="idRol"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  :disabled="actualizando"
                >
                  <option v-for="rol in roles" :key="rol.id" :value="rol.id">
                    {{ rol.nombre }}
                  </option>
                </select>
              </div>

              <!-- Selección de Oficina -->
              <div v-if="oficinas.length > 0">
                <label for="idOficina" class="block text-gray-700 font-medium mb-2">Oficina</label>
                <select
                  v-model="formulario.idOficina"
                  id="idOficina"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
                  :disabled="actualizando"
                >
                  <option v-for="oficina in oficinas" :key="oficina.id" :value="oficina.id">
                    {{ oficina.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Botones -->
      <div class="bg-white px-6 py-4 md:px-8 border-t border-gray-200 flex justify-end gap-4 rounded-b-2xl">
        <button
          type="button"
          @click="cerrar"
          class="px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          :disabled="actualizando"
        >
          Cancelar
        </button>
        <button
          v-if="usuarioSeleccionado"
          type="submit"
          :disabled="actualizando || !formularioValido"
          class="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          @click="actualizarUsuario"
        >
          <svg v-if="actualizando" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ actualizando ? 'Actualizando...' : 'Actualizar Usuario' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import User from '@/models/userService';
const userService = new User();
import Dialog from './dialog/dialog';

export default {
  name: 'EditarUsuario',
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
      usuarioOriginal: null,
      busqueda: '',
      cargando: false,
      actualizando: false,
      roles: [],
      oficinas: [],
      formulario: {
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        idRol: null,
        idOficina: null
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
    },
    formularioValido() {
      return this.formulario.nombre || 
             this.formulario.apellido || 
             this.formulario.email ||
             this.formulario.idRol ||
             this.formulario.idOficina;
    }
  },
  watch: {
    mostrarModal(nuevo) {
      if (nuevo) {
        this.cargarDatos();
        this.resetearModal();
      }
    }
  },
  methods: {
    async cargarDatos() {
      this.cargando = true;
      try {
        // Cargar usuarios, roles y oficinas en paralelo
        const [usuariosResponse, rolesResponse, oficinasResponse] = await Promise.all([
          userService.getAllUsers(),
          this.cargarRoles(),
          this.cargarOficinas()
        ]);

        // Filtrar usuarios eliminados
        const usuariosBrutos = usuariosResponse.data || usuariosResponse || [];
        this.usuarios = usuariosBrutos.filter(usuario => !usuario.fechaDelete);
        
        this.roles = rolesResponse;
        this.oficinas = oficinasResponse;
      } catch (error) {
        console.error('Error al cargar datos:', error);
        alert('Error al cargar datos: ' + error.message);
      } finally {
        this.cargando = false;
      }
    },

    async cargarRoles() {
      // Implementar según tu API de roles
      try {
        // Asumiendo que tienes un endpoint para roles
        const response = await fetch(`${this.$static.BM_SITE.API_ENDPOINT}roles/`, {
          headers: {
            'Authorization': `Bearer ${this.$static.BM_GET_USER_DATA()?.token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        return data.data || data || [];
      } catch (error) {
        console.error('Error al cargar roles:', error);
        return [];
      }
    },

    async cargarOficinas() {
      // Implementar según tu API de oficinas
      try {
        const response = await fetch(`${this.$static.BM_SITE.API_ENDPOINT}oficinas/`, {
          headers: {
            'Authorization': `Bearer ${this.$static.BM_GET_USER_DATA()?.token}`,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        return data.data || data || [];
      } catch (error) {
        console.error('Error al cargar oficinas:', error);
        return [];
      }
    },

    seleccionarUsuario(usuario) {
      this.usuarioSeleccionado = usuario;
      this.usuarioOriginal = { ...usuario };
      
      // Llenar el formulario con los datos actuales
      this.formulario = {
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        password: '', // Siempre vacío por seguridad
        idRol: usuario.rol?.id || null,
        idOficina: usuario.oficina?.id || null
      };
    },

    volverALista() {
      this.usuarioSeleccionado = null;
      this.usuarioOriginal = null;
      this.resetearFormulario();
    },

    async actualizarUsuario() {
      if (!this.usuarioSeleccionado || !this.formularioValido) return;

      this.actualizando = true;
      try {
        // Preparar datos para enviar (solo campos que cambiaron)
        const datosActualizacion = {};
        
        if (this.formulario.nombre !== this.usuarioOriginal.name) {
          datosActualizacion.nombre = this.formulario.nombre;
        }
        if (this.formulario.apellido !== this.usuarioOriginal.lastName) {
          datosActualizacion.apellido = this.formulario.apellido;
        }
        if (this.formulario.email !== this.usuarioOriginal.email) {
          datosActualizacion.email = this.formulario.email;
        }
        if (this.formulario.password.trim()) {
          datosActualizacion.password = this.formulario.password;
        }
        if (this.formulario.idRol !== this.usuarioOriginal.rol?.id) {
          datosActualizacion.idRol = this.formulario.idRol;
        }
        if (this.formulario.idOficina !== this.usuarioOriginal.oficina?.id) {
          datosActualizacion.idOficina = this.formulario.idOficina;
        }

        const usuarioActualizado = await userService.updateUser(this.usuarioSeleccionado.id, datosActualizacion);
        
        // Actualizar el usuario en la lista local
        const indiceUsuario = this.usuarios.findIndex(u => u.id === this.usuarioSeleccionado.id);
        if (indiceUsuario !== -1) {
          // Actualizar los datos del usuario en la lista
          this.usuarios[indiceUsuario] = {
            ...this.usuarios[indiceUsuario],
            name: this.formulario.nombre,
            lastName: this.formulario.apellido,
            email: this.formulario.email,
            // Actualizar rol y oficina si están disponibles en la respuesta
            ...(usuarioActualizado.rol && { rol: usuarioActualizado.rol }),
            ...(usuarioActualizado.oficina && { oficina: usuarioActualizado.oficina })
          };
        }
        
        const dialogExito = new Dialog(`Usuario ${this.formulario.nombre} ${this.formulario.apellido} actualizado correctamente`, "Éxito", Dialog.type.success);
        dialogExito.open();
        
        this.$emit('usuario-actualizado', {
          id: this.usuarioSeleccionado.id,
          nombre: this.formulario.nombre,
          apellido: this.formulario.apellido,
          email: this.formulario.email,
          ...datosActualizacion
        });
        
        // Volver a la lista en lugar de cerrar el modal
        this.volverALista();

        this.cargarDatos();
        
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
        alert('Error al actualizar el usuario: ' + error.message);
      } finally {
        this.actualizando = false;
      }
    },

    resetearFormulario() {
      this.formulario = {
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        idRol: null,
        idOficina: null
      };
    },

    resetearModal() {
      this.usuarioSeleccionado = null;
      this.usuarioOriginal = null;
      this.busqueda = '';
      this.actualizando = false;
      this.resetearFormulario();
    },

    cerrar() {
      this.resetearModal();
      this.$emit('cerrar');
    }
  }
};
</script>