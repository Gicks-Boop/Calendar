<template>
  <div>
     
     <!-- Mostrar login si no está autenticado -->
    <login v-if="!usuarioAutenticado" @login-exitoso="manejarLoginExitoso" /> 

    <!-- Mostrar calendario solo si está autenticado -->
    <div v-else>
    <calendario-main     
      @cerrar-sesion="cerrarSesion"
      @asignar-basura="abrirModalBasura"
      @ruleta="abrirModalRuleta"
      @guardar-evento="guardarEvento"
      @eliminar-evento="eliminarEvento"
      @eliminar-tareas-mes="eliminarTareasMes"
    />

    <!-- Componentes de modales -->
    <sacar-basura
      :mostrar-modal="mostrarModalBasura"
      @cerrar="cerrarModalBasura"
      @guardar-asignaciones="guardarAsignacionesEnCalendario"
    />

    <rulette-bar
      :mostrar-modal="mostrarModalRuleta"
      @cerrar="cerrarModalRuleta"
      @guardar-asignaciones="guardarAsignacionesEnCalendario"
    />
    </div>
  </div>
</template>

<script>
import CalendarioMain from "@/components/Calendario-main.vue";
import SacarBasura from "@/components/SacarBasura.vue";
import RuletteBar from "@/components/RuletteBar.vue";
import login from "@/views/Inicio-Sesion.vue";

export default {
  name: "App",

  components: {
    CalendarioMain,
    SacarBasura,
    RuletteBar,
    login,
  },

  data() {
    return {
      usuarioAutenticado: false,
      datosUsuario: null,
      mostrarModalBasura: false,
      mostrarModalRuleta: false,
      eventos: {}, // Objeto para almacenar todos los eventos del calendario
    };
  },

  methods: {
     manejarLoginExitoso(usuario) {
      this.usuarioAutenticado = true;
      this.datosUsuario = usuario;
      localStorage.setItem("usuarioCalendario", JSON.stringify(usuario));
    },
  
    cerrarSesion() {
     this.usuarioAutenticado = false;
      this.datosUsuario = null;
      localStorage.removeItem("usuarioCalendario");
      localStorage.setItem("eventosCalendario", JSON.stringify(this.eventos));
    },

    // Método para manejar la asignación de basura
    abrirModalBasura() {
      console.log("Abriendo modal de asignación de basura");
      this.mostrarModalBasura = true;
    },

    cerrarModalBasura() {
      this.mostrarModalBasura = false;
    },

    // Método para manejar la ruleta
    abrirModalRuleta() {
      console.log("Abriendo modal de ruleta");
      this.mostrarModalRuleta = true;
    },

    cerrarModalRuleta() {
      this.mostrarModalRuleta = false;
    },

    // Método para guardar un solo evento
    guardarEvento(evento) {
      // Formatear la fecha para usar como clave
      const fechaFormateada = this.formatFecha(evento.fecha);

      // Si no existe array para esta fecha, crear uno
      if (!this.eventos[fechaFormateada]) {
        this.eventos = {
          ...this.eventos,
          [fechaFormateada]: [],
        };
      }

      // Generar ID único si no tiene
      if (!evento.id) {
        evento.id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
      }

      // Agregar o actualizar evento
      const eventoIndex = this.eventos[fechaFormateada].findIndex((e) => e.id === evento.id);

      if (eventoIndex >= 0) {
        // Actualizar evento existente
        this.eventos[fechaFormateada][eventoIndex] = evento;
      } else {
        // Agregar nuevo evento
        this.eventos[fechaFormateada].push(evento);
      }

      // Guardar en localStorage
      this.guardarEventosEnStorage();

      console.log(`Evento guardado para ${fechaFormateada}:`, evento);
    },

    // Método para eliminar eventos
    eliminarEvento(id, fecha) {
      if (this.eventos[fecha]) {
        this.eventos[fecha] = this.eventos[fecha].filter((evento) => evento.id !== id);

        // Si no quedan eventos para esa fecha, eliminar la entrada
        if (this.eventos[fecha].length === 0) {
          const nuevoEventos = { ...this.eventos };
          delete nuevoEventos[fecha];
          this.eventos = nuevoEventos;
        }

        // Guardar en localStorage
        this.guardarEventosEnStorage();
        console.log(`Evento ${id} eliminado de ${fecha}`);
      }
    },

    // Método para guardar múltiples asignaciones en el calendario
    guardarAsignacionesEnCalendario(eventosNuevos) {
      console.log("Guardando asignaciones:", eventosNuevos.length, "eventos");

      // Iterar sobre cada evento nuevo
      eventosNuevos.forEach((evento) => {
        this.guardarEvento(evento);
      });

      // Cerrar los modales
      this.cerrarModalBasura();
      this.cerrarModalRuleta();
    },

    // Método para guardar eventos en localStorage
    guardarEventosEnStorage() {
      localStorage.setItem("eventosCalendario", JSON.stringify(this.eventos));
    },

    formatFecha(fecha) {
      // Si fecha es un string, convertir a objeto Date
      if (typeof fecha === "string") {
        const [año, mes, dia] = fecha.split("-");
        fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
      }

      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const dia = String(fecha.getDate()).padStart(2, "0");
      return `${año}-${mes}-${dia}`;
    },
    eliminarTareasMes(fechasAEliminar) {
      console.log("Eliminando tareas para las fechas:", fechasAEliminar);

      if (!Array.isArray(fechasAEliminar) || fechasAEliminar.length === 0) {
        return;
      }

      // Eliminar cada fecha de la lista de eventos
      fechasAEliminar.forEach((fecha) => {
        if (this.eventos[fecha]) {
          delete this.eventos[fecha];
        }
      });

      // Crear un nuevo objeto para forzar la actualización reactiva
      this.eventos = { ...this.eventos };

      // Guardar en localStorage
      this.guardarEventosEnStorage();
    },
  },

  created() {
    const usuarioGuardado = localStorage.getItem("usuarioCalendario");
    if (usuarioGuardado) {
      this.datosUsuario = JSON.parse(usuarioGuardado);
      this.usuarioAutenticado = true;

      const eventosGuardados = localStorage.getItem("eventosCalendario");
      if (eventosGuardados) {
        this.eventos = JSON.parse(eventosGuardados);
      }
    }
  },

  beforeUnmount() {
    // Guardar eventos antes de desmontar el componente
    this.guardarEventosEnStorage();
  },
};
</script>

<style>
.app-container {
  height: 100vh;
  width: 100vw;
}
</style>
