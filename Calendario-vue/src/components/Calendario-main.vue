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
            :style="{ backgroundColor: evento.color }"
            :title="evento.titulo"
          ></div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 border-t border-gray-200 p-3 text-center text-sm text-gray-600">
      <span class="font-medium">Hoy: </span>{{ fechaFormateada }}
    </div>

    <agendar-tareas
      :mostrar-modal="mostrarModalTarea"
      :fecha-seleccionada="diaSeleccionado"
      :evento-editar="eventoEditando"
      :categorias="categorias"
      @cerrar="cerrarModalTarea"
      @guardar-evento="guardarEventoYPropagar"
    />
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
      fechaOriginalEvento: null, // Para guardar la fecha original formateada
      categorias: [
        { nombre: "Trabajo", valor: "trabajo", color: "#4299e1" },
        { nombre: "Personal", valor: "personal", color: "#48bb78" },
        { nombre: "Importante", valor: "importante", color: "#fc2f2c" },
        { nombre: "Basura", valor: "basura", color: "#8a4e03" },
        { nombre: "Cumpleaños", valor: "cumpleaños", color: "#e64e81" },
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
    // Propagar el evento de cierre de sesión al componente padre
    cerrarSesion() {
      this.$emit("cerrar-sesion");
    },

    // Manejar el evento de asignar basura
    handleAsignarBasura() {
      console.log("CalendarioMain: Propagando evento asignar-basura");
      this.$emit("asignar-basura");
    },

    // Manejar el evento de ruleta
    handleRuleta() {
      console.log("CalendarioMain: Propagando evento ruleta");
      this.$emit("ruleta");
    },

    esHoy(año, mes, dia) {
      const hoy = new Date();
      return año === hoy.getFullYear() && mes === hoy.getMonth() && dia === hoy.getDate();
    },

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
      this.eventoEditando = null; // Resetear evento en edición
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

    formatFecha(fecha) {
      if (!fecha) return "";

      // Si fecha es string, convertir a objeto Date
      if (typeof fecha === "string") {
        const [año, mes, dia] = fecha.split("-");
        fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
      }

      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const dia = String(fecha.getDate()).padStart(2, "0");
      return `${año}-${mes}-${dia}`;
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

    cerrarModalTarea() {
      this.mostrarModalTarea = false;
      this.eventoEditando = null;
    },

    guardarEventoYPropagar(evento) {
      // Propagar el evento al componente padre (App.vue)
      this.$emit("guardar-evento", evento);
      this.cerrarModalTarea();
    },

    eliminarEventoYPropagar(id, fecha) {
      // Si se recibió una fecha, usar esa
      if (fecha) {
        this.$emit("eliminar-evento", id, fecha);
        return;
      }

      // Sino, buscar el evento en todos los días
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

    abrirModalAgendar() {
      this.eventoEditando = null; // Resetear para un nuevo evento
      this.mostrarModalTarea = true;
    },

    editarEvento(evento) {
      // Crear una copia profunda del evento para no modificar el original
      this.eventoEditando = JSON.parse(JSON.stringify(evento));

      // Si la fecha viene como string, convertir a objeto Date
      if (typeof this.eventoEditando.fecha === "string") {
        const [año, mes, dia] = this.eventoEditando.fecha.split("-");
        this.eventoEditando.fecha = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
      }

      // Guardar la fecha original formateada para eliminar el evento original después
      this.fechaOriginalEvento = this.formatFecha(evento.fecha);

      // Mostrar el modal de edición
      this.mostrarModalTarea = true;
    },

    // Método para manejar toasts/notificaciones
    mostrarToast(mensaje, tipo) {
      // Implementar si se requiere un sistema de notificaciones
      console.log(`[${tipo}] ${mensaje}`);
    },
    eliminarTareasMes(fechasAEliminar) {
      // Propagar el evento al componente padre (App.vue)
      this.$emit("eliminar-tareas-mes", fechasAEliminar);
    },
  },

  created() {
    // Establecer el día seleccionado como hoy al iniciar
    this.diaSeleccionado = new Date();
  },
};
</script>
