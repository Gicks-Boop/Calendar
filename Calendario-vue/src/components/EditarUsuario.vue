<template>
  <div v-if="mostrarModal" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
    <!--contenedor del modal-->
    <div class="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
      <!--cabecera del modal-->
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Editar Usuario</h3>
        <button @click="cerrar" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Lista de usuarios para seleccionar -->
      <div v-if="!usuarioSeleccionado" class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Selecciona el usuario a editar:
        </label>
        
        <!-- Buscador -->
        <div class="mb-3">
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar usuario..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>

        <!-- Loading -->
        <div v-if="cargando" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p class="mt-2 text-sm text-gray-600">Cargando usuarios...</p>
        </div>

        <!-- Lista de usuarios filtrados -->
        <div v-else-if="usuariosFiltrados.length > 0" class="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
          <div
            v-for="usuario in usuariosFiltrados"
            :key="usuario.id"
            @click="seleccionarUsuario(usuario)"
            class="p-3 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
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

      <!-- Formulario de edición -->
      <div v-if="usuarioSeleccionado" class="space-y-4">
        <!-- Botón volver -->
        <button @click="volverALista" class="flex items-center text-blue-600 hover:text-blue-800 mb-4">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          Volver a la lista
        </button>

        <!-- Información del usuario -->
        <div class="bg-blue-50 p-3 rounded-md mb-4">
          <h4 class="font-medium text-blue-900">Editando usuario:</h4>
          <p class="text-sm text-blue-800">{{ usuarioOriginal.nombre }} {{ usuarioOriginal.apellido }}</p>
        </div>

        <!-- Campos del formulario -->
         
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            v-model="formulario.nombre"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
            placeholder="Nombre del usuario"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
          <input
            v-model="formulario.apellido"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
            placeholder="Apellido del usuario"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="formulario.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
            placeholder="correo@ejemplo.com"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Nueva Contraseña (opcional)
          </label>
          <input
            v-model="formulario.password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
            placeholder="Dejar vacío para no cambiar"
          >
        </div>

        <!-- Roles -->
        <div v-if="roles.length > 0">
          <label class="block text-sm font-medium text-gray-700 mb-1">Rol</label>
          <select
            v-model="formulario.idRol"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          >
            <option v-for="rol in roles" :key="rol.id" :value="rol.id">
              {{ rol.nombre }}
            </option>
          </select>
        </div>

        <!-- Oficinas -->
        <div v-if="oficinas.length > 0">
          <label class="block text-sm font-medium text-gray-700 mb-1">Oficina</label>
          <select
            v-model="formulario.idOficina"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
          >
            <option v-for="oficina in oficinas" :key="oficina.id" :value="oficina.id">
              {{ oficina.nombre }}
            </option>
          </select>
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
            @click="actualizarUsuario"
            :disabled="actualizando || !formularioValido"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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