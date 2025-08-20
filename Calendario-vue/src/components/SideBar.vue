<template>
  <div class="relative">
    <!-- Botón flotante para abrir el menú -->
    <button @click="toggleMenu"
      class="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white"
      :class="{ 'rotate-90': menuAbierto }" aria-label="Menú">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <!-- Menú desplegable -->
    <div class="fixed top-0 left-0 h-full bg-white shadow-xl z-30 transition-all duration-300 ease-in-out"
      :class="menuAbierto ? 'w-64' : 'w-0 overflow-hidden'">
      <div class="pt-20 h-full flex flex-col">
        <!-- Información del usuario -->
        <div class="px-6 py-4 mb-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
          <div class="flex items-center space-x-4">
            <div
              class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-full w-14 h-14 flex items-center justify-center text-white font-semibold text-lg shadow-md ring-2 ring-blue-100">
              {{ iniciales }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-lg font-semibold text-gray-900 truncate">
                {{ userInfo.fullName || "Usuario" }}
              </div>
              <div class="text-sm text-gray-600 truncate flex items-center mt-1">
                <svg class="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207">
                  </path>
                </svg>
                {{ userInfo.email || "usuario@ejemplo.com" }}
              </div>
              <div class="text-sm text-blue-600 font-medium mt-1 flex items-center">
                <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4">
                  </path>
                </svg>
                {{ userInfo.oficina }}
              </div>
            </div>
          </div>
        </div>

        <!-- Opciones simplificadas -->
        <div class="flex-1 px-4 py-2 space-y-3">
          <button v-if="canUseAdminTools" @click="abrirModalRegistro"
            class="w-full flex items-center justify-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-colors bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            <span>Registrar Usuario</span>
          </button>

          <!-- Botón Eliminar Usuario -->
          <button v-if="canUseAdminTools" @click="abrirModalEliminarUsuario"
            class="w-full flex items-center justify-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-red-100 hover:text-red-700 transition-colors bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Eliminar Usuario</span>
          </button>

          <!-- Botón Editar Usuario -->
          <button v-if="canUseAdminTools" @click="abrirModalEditarUsuario"
            class="w-full flex items-center justify-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-yellow-100 hover:text-yellow-700 transition-colors bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar Usuario</span>
          </button>

          <!-- Botón Asignar Basura -->
          <button v-if="canUseAdminTools" @click="abrirModalBasura"
            class="w-full flex items-center justify-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Asignar Basura</span>
          </button>

          <!-- Botón Ruleta -->
          <button v-if="canUseAdminTools" @click="abrirModalRuleta"
            class="w-full flex items-center justify-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ruleta</span>
          </button>
        </div>

        <!-- Botón cerrar sesión en la parte inferior -->
        <div class="px-4 py-3 border-t border-gray-200 mt-auto">
          <button @click="cerrarSesion"
            class="w-full bg-red-500 hover:bg-red-600 text-white rounded px-3 py-2 transition-colors flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay para cerrar el menú cuando está abierto -->
    <div v-if="menuAbierto" class="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-20" @click="toggleMenu"></div>

    <!-- Componente SacarBasura -->
    <SacarBasura :mostrarModal="mostrarModalBasura" @cerrar="cerrarModalBasura"
      @guardar-asignaciones="handleGuardarAsignaciones" />

    <!-- Componente RuletteBar-->
    <RuletteBar :mostrarRuleta="mostrarModalRuleta" @cerrar="cerrarModalRuleta"
      @guardar-asignaciones="handleGuardarAsignaciones" />

    <!-- Componente EliminarUsuario -->
    <EliminarUsuario :mostrarModal="mostrarModalEliminarUsuario" @cerrar="cerrarModalEliminarUsuario"
      @usuario-eliminado="handleUsuarioEliminado" />

    <!-- Componente EditarUsuario -->
    <EditarUsuario :mostrarModal="mostrarModalEditarUsuario" @cerrar="cerrarModalEditarUsuario"
      @usuario-actualizado="handleUsuarioActualizado" />

    <RegistroUsuario 
      :mostrarModal="mostrarModalRegistro" 
      @cerrar="cerrarModalRegistro"
      @usuario-registrado="handleUsuarioRegistrado"/>

  </div>
</template>

<script>
import SacarBasura from './SacarBasura.vue';
import RuletteBar from './RuletteBar.vue';
import EliminarUsuario from './EliminarUsuario.vue';
import EditarUsuario from './EditarUsuario.vue';
import RegistroUsuario from '@/Views/Registro-Usuario.vue';

export default {
  name: "SideBar",
  emits: [
    'cerrar-sesion',
    'asignar-basura', 
    'ruleta',
    'guardar-asignaciones',
    'usuario-eliminado',
    'usuario-actualizado',
    'usuario-registrado'
  ],

  components: {
    SacarBasura,
    RuletteBar,
    EliminarUsuario,
    EditarUsuario,
    RegistroUsuario
  },

  data() {
    return {
      menuAbierto: false,
      userInfo: {},
      mostrarModalBasura: false,
      mostrarModalRuleta: false,
      mostrarModalEliminarUsuario: false,
      mostrarModalEditarUsuario: false,
      mostrarModalRegistro: false
    };
  },
  computed: {
    iniciales() {
      const userData = this.$static.BM_GET_SIDEBAR_DATA();

      if (userData.name && userData.lastName) {
        return (userData.name[0] + userData.lastName[0]).toUpperCase();
      } else if (userData.name) {
        const palabras = userData.name.split(" ");
        if (palabras.length > 1) {
          return (palabras[0][0] + palabras[1][0]).toUpperCase();
        }
        return palabras[0][0].toUpperCase();
      }

      return "U";
    },
    canUseAdminTools() {
      return this.$static.BM_IS_ADMIN();
    }
  },
  methods: {
    toggleMenu() {
      this.menuAbierto = !this.menuAbierto;
    },

      abrirModalRegistro() {
      if (this.$static.BM_GET_USER_ROLE()?.nombre === 'USUARIO') {
        return;
      }
      this.mostrarModalRegistro = true;
      this.menuAbierto = false;
    },

    cerrarModalRegistro() {
      this.mostrarModalRegistro = false;
      this.menuAbierto = true;
    },

    handleUsuarioRegistrado(usuario) {
      console.log("SideBar: Usuario registrado", usuario);
      this.$emit("usuario-registrado", usuario);
    },


    abrirModalEliminarUsuario() {
      if (this.$static.BM_GET_USER_ROLE()?.nombre === 'USUARIO') {
        return;
      }
      this.mostrarModalEliminarUsuario = true;
      this.menuAbierto = false;
    },

    cerrarModalEliminarUsuario() {
      this.mostrarModalEliminarUsuario = false;
      this.menuAbierto = true;
    },

    handleUsuarioEliminado(usuario) {
      console.log("SideBar: Usuario eliminado", usuario);
      this.$emit("usuario-eliminado", usuario);
    },

    abrirModalBasura() {
      if (this.$static.BM_GET_USER_ROLE()?.nombre === 'USUARIO') {
        return;
      }
      this.mostrarModalBasura = true;
      this.menuAbierto = false;
    },
    cerrarModalBasura() {
      this.mostrarModalBasura = false;
      this.menuAbierto = true;
    },

    abrirModalRuleta() {
      if (this.$static.BM_GET_USER_ROLE()?.nombre === 'USUARIO') {
        return;
      }
      this.mostrarModalRuleta = true;
      this.menuAbierto = false;
    },

    cerrarModalRuleta() {
      this.mostrarModalRuleta = false;
      this.menuAbierto = true;
    },

    handleGuardarAsignaciones(eventos) {
      console.log("SideBar: Asignaciones guardadas", eventos);
      this.$emit("guardar-asignaciones", eventos);
    },

    abrirModalEditarUsuario() {
      if (this.$static.BM_GET_USER_ROLE()?.nombre === 'USUARIO') {
        return;
      }
      this.mostrarModalEditarUsuario = true;
      this.menuAbierto = false;
    },

    cerrarModalEditarUsuario() {
      this.mostrarModalEditarUsuario = false;
      this.menuAbierto = true;
    },

    handleUsuarioActualizado(usuario) {
      console.log("SideBar: Usuario actualizado", usuario);
      this.$emit("usuario-actualizado", usuario);
    },

    cerrarSesion() {
      this.$session.logOut()
    }
  },
  mounted() {
    this.userInfo = this.$static.BM_GET_SIDEBAR_DATA();
  }
};
</script>