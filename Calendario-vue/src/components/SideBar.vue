<template>
  <div class="relative">
    <!-- Botón flotante para abrir el menú -->
    <button
      @click="toggleMenu"
      class="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white"
      :class="{ 'rotate-90': menuAbierto }"
      aria-label="Menú"
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
          d="M4 6h16M4 12h16M4 18h16"
        />
      </svg>
    </button>

    <!-- Menú desplegable -->
    <div
      class="fixed top-0 right-0 h-full bg-white shadow-xl z-30 transition-all duration-300 ease-in-out"
      :class="menuAbierto ? 'w-64' : 'w-0 overflow-hidden'"
    >
      <div class="pt-20 h-full flex flex-col">
        <!-- Información del usuario -->
        <div class="px-4 py-2 mb-4 border-b border-gray-200">
          <div class="flex items-center space-x-3">
            <div class="bg-blue-600 rounded-full w-10 h-10 flex items-center justify-center text-white font-bold">
              {{ iniciales }}
            </div>
            <div>
              <div class="font-medium text-gray-900">{{ usuario.nombre || 'Usuario' }}</div>
              <div class="text-sm text-gray-500">{{ usuario.email || 'usuario@ejemplo.com' }}</div>
            </div>
          </div>
        </div>

        <!-- Opciones simplificadas -->
        <div class="flex-1 px-4 py-2 space-y-3">
          <!-- Botón Asignar Basura -->
          <button
            @click="handleAsignarBasura"
            class="w-full flex items-center justify-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-green-100 hover:text-green-700 transition-colors bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-3 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span>Asignar Basura</span>
          </button>

          <!-- Botón Ruleta -->
          <button
            @click="handleRuleta"
            class="w-full flex items-center justify-center px-4 py-3 text-left rounded-lg text-gray-700 hover:bg-purple-100 hover:text-purple-700 transition-colors bg-gray-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 mr-3 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Ruleta</span>
          </button>
        </div>

        <!-- Botón cerrar sesión en la parte inferior -->
        <div class="px-4 py-3 border-t border-gray-200 mt-auto">
          <button
            @click="cerrarSesion"
            class="w-full bg-red-500 hover:bg-red-600 text-white rounded px-3 py-2 transition-colors flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>

    <!-- Overlay para cerrar el menú cuando está abierto -->
    <div
      v-if="menuAbierto"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-20"
      @click="toggleMenu"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'SideBar',
  props: {
    usuario: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      menuAbierto: false,
    };
  },
  computed: {
    iniciales() {
      if (this.usuario && this.usuario.nombre) {
        const palabras = this.usuario.nombre.split(' ');
        if (palabras.length > 1) {
          return (palabras[0][0] + palabras[1][0]).toUpperCase();
        }
        return palabras[0][0].toUpperCase();
      }
      return 'U';
    }
  },
  methods: {
    toggleMenu() {
      this.menuAbierto = !this.menuAbierto;
    },
    handleAsignarBasura() {
      console.log("SideBar: Emitiendo evento asignar-basura");
      this.$emit('asignar-basura');
      this.toggleMenu();
    },
    handleRuleta() {
      console.log("SideBar: Emitiendo evento ruleta");
      this.$emit('ruleta');
      this.toggleMenu();
    },
    cerrarSesion() {
      console.log("SideBar: Emitiendo evento cerrar-sesion");
      this.$emit('cerrar-sesion');
      this.toggleMenu();
    }
  }
};
</script>
