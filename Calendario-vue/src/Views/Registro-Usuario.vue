<script>
import Oficina from '@/models/oficinaService';
const oficinas = new Oficina()
import User from '@/models/userService';
const user = new User()
import PermisoService from '@/models/permisoService'; // NUEVO
const permisoService = new PermisoService(); // NUEVO

export default {
  data() {
    return {
      usuario: {
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        idOficina: null,
        idRol: null, // NUEVO
      },
      oficinas: [],
      roles: [], // NUEVO
      error: null,
      exito: null,
    };
  },
  methods: {
    // Cargar oficinas desde el backend
    async cargarOficinas() {
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

      try {
        await user.createUser(this.usuario);
        this.exito = "Usuario registrado correctamente.";
        this.error = null;

        // Limpiar formulario
        this.usuario = {
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          idOficina: null,
          idRol: null, // NUEVO
        };

        // Redireccionar tras 2 segundos
        setTimeout(() => {
          this.$router.push('/calendario');
        }, 2000);
      } catch (err) {
        this.error = err.message || 'Error al registrar el usuario.';
        this.exito = null;
      }
    }
  },
  mounted() {
    this.cargarOficinas();
  }
};
</script>



<template>
  <div class="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-50 p-4">
    <div class="w-full max-w-md">
      <div class="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        <!-- Cabecera -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white text-center">
          <h2 class="text-2xl font-bold">Registro</h2>
          <p class="mt-1 text-blue-100">Registro al Calendario</p>
        </div>

        <!-- Formulario -->
        <form class="p-6 space-y-4" @submit.prevent="registrarUsuario">
          <!-- Mensajes de error o éxito -->
          <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
          <div v-if="exito" class="text-green-600 text-sm">{{ exito }}</div>

          <!-- Campo Nombre -->
          <div>
            <label for="nombre" class="block text-gray-700 font-medium mb-1">Nombre</label>
            <input v-model="usuario.nombre" type="text" class="w-full p-2 border rounded" placeholder="Nombre" />
          </div>

          <!-- Campo Apellido -->
          <div>
            <label for="apellido" class="block text-gray-700 font-medium mb-1">Apellido</label>
            <input v-model="usuario.apellido" type="text" class="w-full p-2 border rounded" placeholder="Apellido" />
          </div>

          <!-- Campo Email -->
          <div>
            <label for="email" class="block text-gray-700 font-medium mb-1">Email</label>
            <input v-model="usuario.email" type="email" class="w-full p-2 border rounded"
              placeholder="Correo electrónico" />
          </div>

          <!-- Campo Contraseña -->
          <div>
            <label for="password" class="block text-gray-700 font-medium mb-1">Contraseña</label>
            <input v-model="usuario.password" type="password" class="w-full p-2 border rounded"
              placeholder="Contraseña" />
          </div>

          <!-- Selección de Oficina -->
          <div>
            <label for="idOficina" class="block text-gray-700 font-medium mb-1">Oficina</label>
            <select v-model="usuario.idOficina" class="w-full p-2 border rounded">
              <option disabled value="">Seleccione una oficina</option>
              <option v-for="oficina in oficinas" :key="oficina.id" :value="oficina.id">
                {{ oficina.nombre }}
              </option>
            </select>
          </div>

          
                  <!-- Selección de Rol -->

          <div>
            <label for="idRol" class="block text-gray-700 font-medium mb-1">Rol</label>
            <select v-model="usuario.idRol" class="w-full p-2 border rounded">
              <option disabled value="">Seleccione un rol</option>
              <option v-for="rol in roles" :key="rol.id" :value="rol.id">
                {{ rol.nombre }}
              </option>
            </select>
          </div>

          <!-- Botón de registro -->
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Registrarse
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
