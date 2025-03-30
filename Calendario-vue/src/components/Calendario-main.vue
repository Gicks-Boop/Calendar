<template>
  <div
    class="w-full h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
  >
    <visualizador-tareas
      :dia-seleccionado="diaSeleccionado"
      :eventos="eventos"
      :categorias="categorias"
      @abrir-modal-tarea="abrirModalAgendar"
      @editar-evento="editarEvento"
      @eliminar-evento="eliminarEvento"
    ></visualizador-tareas>
    <!-- Header con botón de cierre de sesión -->
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

      <!-- Botón de cierre de sesión -->
      <button
        @click="cerrarSesion"
        class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md text-sm flex items-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-1"
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
          { 'bg-red-500 text-white font-bold shadow-lg ring-2 ring-red-300': dia.esHoy },
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
            { 'bg-red-500': dia.esHoy },
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
      @cerrar="cerrarModalTarea"
      @guardar-evento="guardarEvento"
    />
  </div>
</template>

<script>
import AgendarTareas from "./Agendar-Tareas.vue";
import VisualizadorTareas from "./VisualizadorTareas.vue";

export default {
  name: "CalendarioMain",
  components: {
    AgendarTareas,
    VisualizadorTareas,
  },
  props: {
    usuario: {
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
      eventos: {}, // Objeto para almacenar eventos reales por fecha
      eventoEditado: null,
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
    // Método de cierre de sesión
    cerrarSesion() {
      // Emitir el evento que App.vue está esperando
      this.$emit("cerrar-sesion");
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
      if (dia.esMesActual) {
        this.diaSeleccionado = dia.fecha;
        this.mostrarModalTarea = true;
        this.$emit("dia-seleccionado", dia.fecha);
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
    cerrarModalTarea() {
      this.mostrarModalTarea = false;
    },
    guardarEvento(evento) {
      // Formatear la fecha para usar como clave en el objeto eventos
      const fechaFormateada = this.formatFecha(evento.fecha);

      // Crear una copia del objeto eventos
      const nuevoEventos = { ...this.eventos };

      // Verificar si ya existe un array para esta fecha
      if (!nuevoEventos[fechaFormateada]) {
        nuevoEventos[fechaFormateada] = [];
      }

      // Buscar si este evento ya existe (para edición)
      const indiceExistente = nuevoEventos[fechaFormateada].findIndex((e) => e.id === evento.id);

      if (indiceExistente >= 0) {
        // Actualizar evento existente
        nuevoEventos[fechaFormateada][indiceExistente] = evento;
      } else {
        // Agregar nuevo evento
        nuevoEventos[fechaFormateada].push(evento);
      }

      // Asignar el nuevo objeto completo para mantener la reactividad
      this.eventos = nuevoEventos;

      // Cerrar el modal
      this.cerrarModalTarea();
    },
        abrirModalAgendar() {
      this.eventoEditando = null; // Resetear para un nuevo evento
      this.mostrarModalTarea = true;
    },
    eliminarEvento(id, fecha) {
      if (this.eventos[fecha]) {
        this.eventos[fecha] = this.eventos[fecha].filter((evento) => evento.id !== id);

        // Si no quedan eventos, elimina la entrada para esa fecha
        if (this.eventos[fecha].length === 0) {
          delete this.eventos[fecha];
        }
      }
    },

    editarEvento(evento) {
      // Copia los datos del evento al formulario
      this.eventoEditando = evento;

      // Actualiza nuevoEvento en el componente AgendarTareas
      // Esto requiere una modificación en AgendarTareas para soportar edición
      this.mostrarModalTarea = true;

      // Puedes emitir un evento que AgendarTareas escuchará
      this.$emit("editar-evento", evento);
    },
  },
};
</script>
