<template>
  <div>
    <registro-usuario v-if="!usuarioAutenticado" @auth-success="manejarAutenticacion" />
    <CalendarioMain v-else :usuario="datosUsuario" @cerrar-sesion="cerrarSesion" />

  </div>
</template>

<script>
import CalendarioMain from "./components/Calendario-main.vue";
import RegistroUsuario from "./components/Views/Registro-Usuario.vue";


export default {
  name: "App",

  components: {
    RegistroUsuario,
    CalendarioMain,
  },

  data() {
    return {
      usuarioAutenticado: false,
      datosUsuario: null,
    };
  },
  methods: {
    manejarAutenticacion(userData) {
      console.log("Usuario autenticado:", userData);
      this.usuarioAutenticado = true;
      this.datosUsuario = userData;

      // Opcional: guardar en localStorage para mantener la sesión
      localStorage.setItem("usuarioCalendario", JSON.stringify(userData));
    },
    cerrarSesion() {
      // Limpiar los datos de usuario
      this.usuarioAutenticado = false;
      this.datosUsuario = null;

      // Eliminar datos de localStorage
      localStorage.removeItem("usuarioCalendario");

      console.log("Sesión cerrada correctamente");
    },
  },
  created() {
    // Verificar si hay una sesión guardada al cargar la aplicación
    const usuarioGuardado = localStorage.getItem("usuarioCalendario");
    if (usuarioGuardado) {
      this.datosUsuario = JSON.parse(usuarioGuardado);
      this.usuarioAutenticado = true;
    }
  },
};
</script>

<style>
.app-container {
  height: 100vh;
  width: 100vw;
}
</style>
