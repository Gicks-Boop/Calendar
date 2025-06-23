<template>
  <div
    class="w-full h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
  >
    <!-- Componente VisualizadorTareas -->
    <visualizador-tareas
      :eventos="eventos"
      :categorias="categorias"
      @editar-evento="editarEvento"
      @eliminar-evento="eliminarEventoYPropagar"
      @eliminar-tareas-mes="eliminarTareasMes"
    ></visualizador-tareas>

    <!-- Header con botón de menú -->
    <div
      class="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 border-b border-blue-600"
    >
      <div class="flex items-center">
        <button
          @click="prevMonth"
          class="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white"
          aria-label="Mes anterior"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h2 class="text-xl md:text-2xl font-bold text-white mx-2 text-center tracking-wide">
          {{ mesActual.toUpperCase() }} {{ añoActual }}
        </h2>

        <button
          @click="nextMonth"
          class="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white"
          aria-label="Mes siguiente"
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <!-- SideBar component -->
      <side-bar
        :usuario="usuario"
        @cerrar-sesion="cerrarSesion"
        @asignar-basura="handleAsignarBasura"
        @ruleta="handleRuleta"
      ></side-bar>
    </div>

    <div
      class="grid grid-cols-7 bg-indigo-100 text-sm font-semibold text-center text-indigo-800 border-b border-indigo-200 py-3"
    >
      <div v-for="dia in diasSemana" :key="dia" class="py-1">{{ dia }}</div>
    </div>

    <div class="flex-1 grid grid-cols-7 gap-1 bg-gray-100 p-2 overflow-auto">
      <div
        v-for="(dia, index) in diasCalendario"
        :key="index"
        @click="selectDay(dia)"
        :class="[
          'flex flex-col items-center justify-start p-2 relative rounded-lg transition-all duration-200 h-full',
          { 'bg-blue-700 text-white font-bold shadow-lg ring-2 ring-blue-500': dia.esHoy },
          { 'bg-blue-100 font-medium border border-blue-300': dia.esSeleccionado && !dia.esHoy },
          { 'text-gray-400 bg-gray-50 border border-gray-200': !dia.esMesActual },
          {
            'bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer':
              dia.esMesActual && !dia.esHoy && !dia.esSeleccionado,
          },
        ]"
      >
        <span
          :class="[
            'text-base font-medium mb-1 z-10 w-8 h-8 flex items-center justify-center rounded-full',
            { 'bg-blue-500': dia.esHoy },
            { 'hover:bg-blue-100': dia.esMesActual && !dia.esHoy && !dia.esSeleccionado },
          ]"
          >{{ dia.numero }}</span
        >

        <div v-if="tieneEventos(dia)" class="flex mt-1 space-x-1 flex-wrap justify-center">
          <div
            v-for="evento in getEventos(dia)"
            :key="evento.id"
            class="w-1.5 h-1.5 rounded-full mb-0.5"
            :style="{ backgroundColor: obtenerColorEvento(evento) }"
            :title="evento.titulo"
          ></div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 border-t border-gray-200 p-3 text-center text-sm text-gray-600">
      <span class="font-medium">Hoy: </span>{{ fechaFormateada }}
    </div>

    <!-- Modal de Agendar Tareas -->
    <agendar-tareas
      :mostrar-modal="mostrarModalTarea"
      :fecha-seleccionada="diaSeleccionado"
      :evento-editar="eventoEditando"
      :categorias="categorias"
      @cerrar="cerrarModalTarea"
      @guardar-evento="guardarEventoYPropagar"
      @exito="mostrarMensajeExito"
      @error="mostrarMensajeError"
    />

    <!-- Toast/Notificaciones -->
    <div
      v-if="mostrarNotificacion"
      :class="[
        'fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 z-50',
        {
          'bg-green-100 border border-green-400 text-green-700': tipoNotificacion === 'exito',
          'bg-red-100 border border-red-400 text-red-700': tipoNotificacion === 'error',
        }
      ]"
    >
      <div class="flex items-center">
        <svg
          v-if="tipoNotificacion === 'exito'"
          class="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <svg
          v-if="tipoNotificacion === 'error'"
          class="w-5 h-5 mr-2"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
        </svg>
        <span>{{ mensajeNotificacion }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import AgendarTareas from "./Agendar-Tareas.vue";
import VisualizadorTareas from "./VisualizadorTareas.vue";
import SideBar from "./SideBar.vue";

export default {
  name: "CalendarioMain",
  components: {
    AgendarTareas,
    VisualizadorTareas,
    SideBar,
  },
  props: {
    usuario: {
      type: Object,
      default: () => ({}),
    },
    eventos: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      fechaActual: new Date(),
      diaSeleccionado: null,
      diasSemana: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      mostrarModalTarea: false,
      eventoEditando: null,
      fechaOriginalEvento: null,
      // Sistema de notificaciones
      mostrarNotificacion: false,
      mensajeNotificacion: "",
      tipoNotificacion: "exito", // 'exito' o 'error'
      // Categorías actualizadas para coincidir con el backend
      categorias: [
        { nombre: "Trabajo", valor: "trabajo", color: "#4299e1" },
        { nombre: "Cumpleaños", valor: "cumpleaños", color: "#e64e81" },
        { nombre: "Basura", valor: "basura", color: "#8a4e03" },
        { nombre: "Otro", valor: "otro", color: "#9f7aea" },
      ],
    };
  },
  computed: {
    añoActual() {
      return this.fechaActual.getFullYear();
    },
    mesActual() {
      return this.fechaActual.toLocaleString("default", { month: "long" });
    },
    fechaFormateada() {
      const hoy = new Date();
      return hoy.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    diasCalendario() {
      const año = this.fechaActual.getFullYear();
      const mes = this.fechaActual.getMonth();
      const primerDiaMes = new Date(año, mes, 1);
      const primerDiaSemana = primerDiaMes.getDay();
      const ultimoDiaMes = new Date(año, mes + 1, 0);
      const totalDiasMes = ultimoDiaMes.getDate();
      const mesAnterior = new Date(año, mes, 0);
      const totalDiasMesAnterior = mesAnterior.getDate();

      // Obtener la fecha de hoy para comparación
      const hoy = new Date();
      const diaHoy = hoy.getDate();
      const mesHoy = hoy.getMonth();
      const añoHoy = hoy.getFullYear();

      const diasMesAnterior = Array.from(
        { length: primerDiaSemana },
        (_, i) => totalDiasMesAnterior - primerDiaSemana + i + 1
      );
      const diasMesActual = Array.from({ length: totalDiasMes }, (_, i) => i + 1);
      const diasRestantes = 42 - (diasMesAnterior.length + diasMesActual.length);
      const diasProximoMes = Array.from({ length: diasRestantes }, (_, i) => i + 1);

      return [
        ...diasMesAnterior.map((dia) => ({
          numero: dia,
          esMesActual: false,
          esHoy: false,
          fecha: new Date(año, mes - 1, dia),
          esSeleccionado: this.esSeleccionado(año, mes - 1, dia),
        })),
        ...diasMesActual.map((dia) => ({
          numero: dia,
          esMesActual: true,
          esHoy: dia === diaHoy && mes === mesHoy && año === añoHoy,
          fecha: new Date(año, mes, dia),
          esSeleccionado: this.esSeleccionado(año, mes, dia),
        })),
        ...diasProximoMes.map((dia) => ({
          numero: dia,
          esMesActual: false,
          esHoy: false,
          fecha: new Date(año, mes + 1, dia),
          esSeleccionado: this.esSeleccionado(año, mes + 1, dia),
        })),
      ];
    },
  },
  methods: {
    // Propagar eventos al componente padre
    cerrarSesion() {
      this.$emit("cerrar-sesion");
    },

    handleAsignarBasura() {
      console.log("CalendarioMain: Propagando evento asignar-basura");
      this.$emit("asignar-basura");
    },

    handleRuleta() {
      console.log("CalendarioMain: Propagando evento ruleta");
      this.$emit("ruleta");
    },

    // Métodos de navegación del calendario
    esSeleccionado(año, mes, dia) {
      if (!this.diaSeleccionado) return false;
      return (
        año === this.diaSeleccionado.getFullYear() &&
        mes === this.diaSeleccionado.getMonth() &&
        dia === this.diaSeleccionado.getDate()
      );
    },

    selectDay(dia) {
      this.diaSeleccionado = dia.fecha;
      this.eventoEditando = null;
      this.$emit("dia-seleccionado", dia.fecha);

      // Solo mostrar modal si es un día del mes actual
      if (dia.esMesActual) {
        this.mostrarModalTarea = true;
      }
    },

    prevMonth() {
      this.fechaActual = new Date(
        this.fechaActual.getFullYear(),
        this.fechaActual.getMonth() - 1,
        1
      );
    },

    nextMonth() {
      this.fechaActual = new Date(
        this.fechaActual.getFullYear(),
        this.fechaActual.getMonth() + 1,
        1
      );
    },

    // Métodos para manejo de eventos
    formatFecha(fecha) {
      if (!fecha) return "";

      // Manejar diferentes tipos de entrada de fecha
      let fechaObj;
      
      if (fecha instanceof Date) {
        fechaObj = fecha;
      } else if (typeof fecha === "string") {
        // Manejar formato ISO string del backend
        if (fecha.includes('T')) {
          fechaObj = new Date(fecha);
        } else {
          // Formato YYYY-MM-DD
          const [año, mes, dia] = fecha.split("-");
          fechaObj = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
        }
      } else {
        return "";
      }

      // Validar que la fecha sea válida
      if (isNaN(fechaObj.getTime())) {
        return "";
      }

      const año = fechaObj.getFullYear();
      const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaObj.getDate()).padStart(2, "0");
      return `${año}-${mes}-${dia}`;
    },

    obtenerColorEvento(evento) {
      // Si el evento ya tiene color, usarlo
      if (evento.color) {
        return evento.color;
      }
      
      // Buscar color por categoría
      const categoria = this.categorias.find(cat => cat.valor === evento.categoria);
      return categoria ? categoria.color : "#9f7aea";
    },

    tieneEventos(dia) {
      const fechaFormateada = this.formatFecha(dia.fecha);
      return this.eventos[fechaFormateada] && this.eventos[fechaFormateada].length > 0;
    },

    getEventos(dia) {
      const fechaFormateada = this.formatFecha(dia.fecha);
      return this.eventos[fechaFormateada] || [];
    },

    getEventosDelDia(fecha) {
      if (!fecha) return [];
      const fechaFormateada = this.formatFecha(fecha);
      return this.eventos[fechaFormateada] || [];
    },

    // Métodos del modal
    cerrarModalTarea() {
      this.mostrarModalTarea = false;
      this.eventoEditando = null;
    },

    guardarEventoYPropagar(evento) {
      try {
        console.log("Evento recibido para guardar:", evento);
        
        // Validar que el evento tenga las propiedades necesarias
        if (!evento || !evento.fechaInicio) {
          throw new Error("Evento inválido recibido");
        }

        // Preparar el evento con el formato correcto
        const eventoFormateado = {
          ...evento,
          // Asegurar que tenga la fecha en formato correcto para el calendario
          fecha: this.formatFecha(evento.fechaInicio),
          // Asegurar que tenga color
          color: evento.color || this.obtenerColorEvento(evento)
        };

        console.log("Evento formateado:", eventoFormateado);

        // Propagar al componente padre
        this.$emit("guardar-evento", eventoFormateado);
        
        // Cerrar modal
        this.cerrarModalTarea();
        
      } catch (error) {
        console.error("Error al procesar evento:", error);
        this.mostrarMensajeError("Error al procesar el evento");
      }
    },

    editarEvento(evento) {
      try {
        // Crear una copia del evento para edición
        this.eventoEditando = {
          ...evento,
          // Convertir fechas del backend al formato local si es necesario
          fechaInicio: evento.fechaInicio || evento.fecha,
          fechaFin: evento.fechaFin || evento.fecha
        };

        console.log("Editando evento:", this.eventoEditando);

        // Establecer el día seleccionado basado en la fecha del evento
        if (evento.fechaInicio) {
          this.diaSeleccionado = new Date(evento.fechaInicio);
        } else if (evento.fecha) {
          // Si viene en formato string YYYY-MM-DD
          const [año, mes, dia] = evento.fecha.split("-");
          this.diaSeleccionado = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
        }

        // Mostrar el modal
        this.mostrarModalTarea = true;
        
      } catch (error) {
        console.error("Error al editar evento:", error);
        this.mostrarMensajeError("Error al cargar el evento para edición");
      }
    },

    eliminarEventoYPropagar(id, fecha) {
      // Si se recibió una fecha, usar esa
      if (fecha) {
        this.$emit("eliminar-evento", id, fecha);
        return;
      }

      // Buscar el evento en todos los días
      let fechaEvento = "";
      Object.keys(this.eventos).forEach((fecha) => {
        const evento = this.eventos[fecha].find((e) => e.id === id);
        if (evento) {
          fechaEvento = fecha;
        }
      });

      if (fechaEvento) {
        this.$emit("eliminar-evento", id, fechaEvento);
      }
    },

    eliminarTareasMes(fechasAEliminar) {
      this.$emit("eliminar-tareas-mes", fechasAEliminar);
    },

    // Sistema de notificaciones
    mostrarMensajeExito(mensaje) {
      this.mostrarNotificacion = true;
      this.mensajeNotificacion = mensaje;
      this.tipoNotificacion = "exito";
      
      // Ocultar después de 3 segundos
      setTimeout(() => {
        this.mostrarNotificacion = false;
      }, 3000);
    },

    mostrarMensajeError(mensaje) {
      this.mostrarNotificacion = true;
      this.mensajeNotificacion = mensaje;
      this.tipoNotificacion = "error";
      
      // Ocultar después de 5 segundos
      setTimeout(() => {
        this.mostrarNotificacion = false;
      }, 5000);
    },

    abrirModalAgendar() {
      this.eventoEditando = null;
      this.mostrarModalTarea = true;
    },
  },

  created() {
    // Establecer el día seleccionado como hoy al iniciar
    this.diaSeleccionado = new Date();
  },
};
</script>