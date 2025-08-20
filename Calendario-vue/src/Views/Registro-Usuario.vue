<template>
  <div v-if="mostrarModal" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <!-- Contenedor del modal -->
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-md xl:max-w-3xl max-h-[90vh] flex flex-col">
      
      <!-- Cabecera mejorada -->
      <div class="bg-gradient-to-r from-white px-6 py-5 xl:px-8 xl:py-6 text-black border-b border-gray-100 rounded-t-2xl">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-lg xl:text-xl font-semibold text-gray-900 mb-1">Registro de Usuario</h3>
            <p class="text-sm text-gray-600">Crea un nuevo usuario</p>
          </div>
          <button @click="cerrar" class="text-gray-400 hover:text-red-600 transition-colors p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6 xl:p-8 space-y-4 xl:space-y-6 overflow-y-auto">
        <!-- Formulario optimizado -->
        <form class="space-y-4 xl:space-y-6" @submit.prevent="registrarUsuario">
          <!-- Mensajes de estado -->
          <div v-if="error" class="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded text-sm">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
              </svg>
              {{ error }}
            </div>
          </div>
          
          <div v-if="exito" class="bg-green-50 border-l-4 border-green-400 text-green-700 px-4 py-3 rounded text-sm">
            <div class="flex items-center">
              <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
              </svg>
              {{ exito }}
            </div>
          </div>

          <!-- Información Personal -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3 xl:mb-4 border-b border-gray-200 pb-2">Información Personal</h4>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
              <!-- Campo Nombre -->
              <div>
                <label for="nombre" class="block text-gray-700 font-medium mb-2">
                  Nombre <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="usuario.nombre" 
                  type="text" 
                  id="nombre"
                  class="w-full px-3 py-2.5 xl:px-4 xl:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white transition-colors" 
                  placeholder="Ingresa el nombre" 
                  :disabled="registrando"
                />
              </div>

              <!-- Campo Apellido -->
              <div>
                <label for="apellido" class="block text-gray-700 font-medium mb-2">
                  Apellido <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="usuario.apellido" 
                  type="text" 
                  id="apellido"
                  class="w-full px-3 py-2.5 xl:px-4 xl:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white transition-colors" 
                  placeholder="Ingresa el apellido" 
                  :disabled="registrando"
                />
              </div>
            </div>
          </div>

          <!-- Credenciales de Acceso -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3 xl:mb-4 border-b border-gray-200 pb-2">Credenciales de Acceso</h4>
            <div class="space-y-4">
              <!-- Campo Email -->
              <div>
                <label for="email" class="block text-gray-700 font-medium mb-2">
                  Correo Electrónico <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="usuario.email" 
                  type="email" 
                  id="email"
                  class="w-full px-3 py-2.5 xl:px-4 xl:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white transition-colors"
                  placeholder="ejemplo@empresa.com" 
                  :disabled="registrando"
                />
              </div>

              <!-- Campo Contraseña -->
              <div>
                <label for="password" class="block text-gray-700 font-medium mb-2">
                  Contraseña <span class="text-red-500">*</span>
                </label>
                <input 
                  v-model="usuario.password" 
                  type="password" 
                  id="password"
                  class="w-full px-3 py-2.5 xl:px-4 xl:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white transition-colors"
                  placeholder="Mínimo 6 caracteres" 
                  :disabled="registrando"
                />
              </div>
            </div>
          </div>

          <!-- Asignación de Permisos -->
          <div>
            <h4 class="text-sm font-medium text-gray-900 mb-3 xl:mb-4 border-b border-gray-200 pb-2">Asignación de Permisos</h4>
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
              <!-- Selección de Oficina -->
              <div>
                <label for="idOficina" class="block text-gray-700 font-medium mb-2">
                  Oficina <span class="text-red-500">*</span>
                </label>
                <select 
                  v-model="usuario.idOficina" 
                  id="idOficina"
                  class="w-full px-3 py-2.5 xl:px-4 xl:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white transition-colors"
                  :disabled="registrando"
                >
                  <option disabled value="">Seleccione una oficina</option>
                  <option v-for="oficina in oficinas" :key="oficina.id" :value="oficina.id">
                    {{ oficina.nombre }}
                  </option>
                </select>
              </div>

              <!-- Selección de Rol -->
              <div>
                <label for="idRol" class="block text-gray-700 font-medium mb-2">
                  Rol <span class="text-red-500">*</span>
                </label>
                <select 
                  v-model="usuario.idRol" 
                  id="idRol"
                  class="w-full px-3 py-2.5 xl:px-4 xl:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white transition-colors"
                  :disabled="registrando"
                >
                  <option disabled value="">Seleccione un rol</option>
                  <option v-for="rol in roles" :key="rol.id" :value="rol.id">
                    {{ rol.nombre }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </div>

      <!-- Botones del pie -->
      <div class="bg-gray-50 px-6 py-4 xl:px-8 xl:py-5 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 rounded-b-2xl">
        <button
          type="button"
          @click="cerrar"
          class="order-2 sm:order-1 px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          :disabled="registrando"
        >
          Cancelar
        </button>
        <button
          type="submit"
          @click="registrarUsuario"
          :disabled="registrando || !formularioValido"
          class="order-1 sm:order-2 px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          <svg v-if="registrando" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ registrando ? 'Registrando...' : 'Registrar Usuario' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Oficina from '@/models/oficinaService';
const oficinas = new Oficina()
import User from '@/models/userService';
const user = new User()
import PermisoService from '@/models/permisoService';
const permisoService = new PermisoService(); 
import Dialog from '@/components/dialog/dialog';

export default {
  name: 'RegistrarUsuario',
  emits: ['cerrar', 'usuario-registrado'],
  props: {
    mostrarModal: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      usuario: {
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        idOficina: null,
        idRol: null, 
      },
      oficinas: [],
      roles: [], 
      error: null,
      exito: null,
      registrando: false,
      cargando: false,
    };
  },
  computed: {
    formularioValido() {
      return this.usuario.nombre && 
             this.usuario.apellido && 
             this.usuario.email && 
             this.usuario.password && 
             this.usuario.idOficina && 
             this.usuario.idRol;
    }
  },
  watch: {
    mostrarModal(nuevo) {
      if (nuevo) {
        this.cargarDatos();
        this.resetearFormulario();
      }
    }
  },
  methods: {
    // Cargar oficinas y roles desde el backend
    async cargarDatos() {
      this.cargando = true;
      try {
        // Cargar oficinas y roles en paralelo
        const [oficinasData, rolesData] = await Promise.all([
          oficinas.getAllOficinas(),
          permisoService.getAllRoles()
        ]);

        this.oficinas = oficinasData.data || oficinasData || [];
        this.roles = rolesData.data || rolesData || [];
      } catch (error) {
        console.error('Error al cargar datos:', error);
        this.error = error.message || 'No se pudieron cargar los datos.';
      } finally {
        this.cargando = false;
      }
    },

    // Validación del formulario
    validarFormulario() {
      this.error = null;

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const nombreRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']+$/;

      if (!this.usuario.nombre || this.usuario.nombre.length < 3 || !nombreRegex.test(this.usuario.nombre)) {
        this.error = "Nombre inválido. Debe tener al menos 3 letras y solo contener caracteres válidos.";
        return false;
      }

      if (!this.usuario.apellido || !nombreRegex.test(this.usuario.apellido)) {
        this.error = "Apellido inválido. Solo se permiten letras y espacios.";
        return false;
      }

      if (!emailRegex.test(this.usuario.email)) {
        this.error = "Por favor, introduce un correo electrónico válido.";
        return false;
      }

      if (!this.usuario.password || this.usuario.password.length < 6) {
        this.error = "La contraseña debe tener al menos 6 caracteres.";
        return false;
      }

      if (!this.usuario.idOficina) {
        this.error = "Debe seleccionar una oficina.";
        return false;
      }

      if (!this.usuario.idRol) {
        this.error = "Debe seleccionar un rol.";
        return false;
      }

      return true;
    },

    // Registrar usuario
    async registrarUsuario() {
      if (!this.validarFormulario()) return;

      this.registrando = true;
      this.error = null;
      this.exito = null;

      try {
        const usuarioCreado = await user.createUser(this.usuario);
        
        this.exito = "Usuario registrado correctamente.";
        
        // Mostrar dialog de éxito
        const dialogExito = new Dialog(
          `Usuario ${this.usuario.nombre} ${this.usuario.apellido} registrado correctamente`, 
          "Éxito", 
          Dialog.type.success
        );
        dialogExito.open();

        // Emitir evento para notificar al componente padre
        this.$emit('usuario-registrado', {
          id: usuarioCreado.id,
          nombre: this.usuario.nombre,
          apellido: this.usuario.apellido,
          email: this.usuario.email,
          idOficina: this.usuario.idOficina,
          idRol: this.usuario.idRol
        });

        // Limpiar formulario
        this.resetearFormulario();

        // Cerrar modal después de un breve delay
        setTimeout(() => {
          this.cerrar();
        }, 1500);

      } catch (err) {
        console.error('Error al registrar usuario:', err);
        this.error = err.message || 'Error al registrar el usuario.';
        this.exito = null;
      } finally {
        this.registrando = false;
      }
    },

    resetearFormulario() {
      this.usuario = {
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        idOficina: null,
        idRol: null, 
      };
      this.error = null;
      this.exito = null;
    },

    cerrar() {
      this.resetearFormulario();
      this.$emit('cerrar');
    }
  }
};
</script>