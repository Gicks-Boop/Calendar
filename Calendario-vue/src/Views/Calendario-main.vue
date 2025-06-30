<template>
  <div
    class="w-full h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <!-- Componente VisualizadorTareas -->
    <visualizador-tareas :eventos="eventos" :categorias="categorias" :permiso-service="permisoService"
      @editar-evento="editarEvento" @eliminar-evento="eliminarEventoYPropagar"></visualizador-tareas>

    <!-- Header con botón de menú -->
    <div
      class="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-500 to-indigo-600 border-b border-blue-600">
      <div class="flex items-center">
        <button @click="prevMonth"
          class="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white"
          aria-label="Mes anterior">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h2 class="text-xl md:text-2xl font-bold text-white mx-2 text-center tracking-wide">
          {{ mesActual.toUpperCase() }} {{ añoActual }}
        </h2>

        <button @click="nextMonth"
          class="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white"
          aria-label="Mes siguiente">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Botón de refrescar eventos y info del usuario -->
      <div class="flex items-center space-x-2">
        <!-- Indicador de oficina -->
        <div class="text-white text-sm bg-blue-700 px-3 py-1 rounded-full">
          <span class="font-medium">{{ userInfo.oficina || 'Sin oficina' }}</span>
          <span v-if="uiPermissions.user.role" class="ml-2 text-xs opacity-75">
            ({{ uiPermissions.user.role.nombre }})
          </span>
        </div>

        <button @click="cargarEventos" :disabled="cargandoEventos"
          class="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white disabled:opacity-50"
          title="Refrescar eventos">
          <svg :class="['h-5 w-5', { 'animate-spin': cargandoEventos }]" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <notificacion-calendar/>


        <!-- SideBar component -->
        <side-bar
         :usuario="usuario"
          @cerrar-sesion="cerrarSesion" 
          @asignar-basura="handleAsignarBasura"
          @ruleta="handleRuleta"></side-bar>
      </div>
    </div>

    <div
      class="grid grid-cols-7 bg-indigo-100 text-sm font-semibold text-center text-indigo-800 border-b border-indigo-200 py-3">
      <div v-for="dia in diasSemana" :key="dia" class="py-1">{{ dia }}</div>
    </div>

    <!-- Loading overlay -->
    <div v-if="cargandoEventos"
      class="absolute inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-40">
      <div class="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
        <svg class="animate-spin h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span class="text-gray-700">Cargando eventos...</span>
      </div>
    </div>

    <div class="flex-1 grid grid-cols-7 gap-1 bg-gray-100 p-2 overflow-auto">
      <div v-for="(dia, index) in diasCalendario" :key="index" @click="selectDay(dia)" :class="[
        'flex flex-col items-center justify-start p-2 relative rounded-lg transition-all duration-200 h-full',
        { 'bg-blue-700 text-white font-bold shadow-lg ring-2 ring-blue-500': dia.esHoy },
        { 'bg-blue-100 font-medium border border-blue-300': dia.esSeleccionado && !dia.esHoy },
        { 'text-gray-400 bg-gray-50 border border-gray-200': !dia.esMesActual },
        {
          'bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer':
            dia.esMesActual && !dia.esHoy && !dia.esSeleccionado,
        },
      ]">
        <span :class="[
          'text-base font-medium mb-1 z-10 w-8 h-8 flex items-center justify-center rounded-full',
          { 'bg-blue-500': dia.esHoy },
          { 'hover:bg-blue-100': dia.esMesActual && !dia.esHoy && !dia.esSeleccionado },
        ]">{{ dia.numero }}</span>

        <!-- ICONOS DE EVENTOS CARGADOS DESDE EL BACKEND -->
        <div v-if="tieneEventos(dia)" class="flex flex-wrap justify-center items-center mt-1 gap-1 max-w-full">
          <!-- Mostrar máximo 4 eventos con iconos -->
          <div v-for="(evento, eventoIndex) in getEventosLimitados(dia)" :key="`${evento.id}-${eventoIndex}`"
            class="flex items-center justify-center w-5 h-5 rounded-full shadow-sm transition-transform hover:scale-110 cursor-pointer relative"
            :style="{ backgroundColor: obtenerColorEvento(evento) }" :title="obtenerTituloEvento(evento)">
            <!-- Indicador de evento global -->
            <div v-if="esEventoGlobal(evento)"
              class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"
              title="Evento global"></div>

            <!-- SVG Icon basado en la categoría -->
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <!-- Icono dinámico basado en categoría -->
              <g v-html="obtenerIconoCategoria(evento.categoria)"></g>
            </svg>
          </div>

          <!-- Indicador de más eventos si hay más de 4 -->
          <div v-if="getEventos(dia).length > 4"
            class="flex items-center justify-center w-5 h-5 rounded-full bg-gray-500 text-white text-xs font-bold cursor-pointer hover:bg-gray-600"
            :title="`+${getEventos(dia).length - 4} eventos más`">
            +{{ getEventos(dia).length - 4 }}
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 border-t border-gray-200 p-3 text-center text-sm text-gray-600">
      <span class="font-medium">Hoy: </span>{{ fechaFormateada }}
    </div>

    <!-- Modal de Agendar Tareas -->
    <agendar-tareas :mostrar-modal="mostrarModalTarea" :fecha-seleccionada="diaSeleccionado"
      :evento-editar="eventoEditando" :categorias="categorias" :permiso-service="permisoService"
      @cerrar="cerrarModalTarea" @guardar-evento="guardarEventoYPropagar" @exito="mostrarMensajeExito"
      @error="mostrarMensajeError" />

    <!-- Toast/Notificaciones -->
    <div v-if="mostrarNotificacion" :class="[
      'fixed top-4 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 z-50',
      {
        'bg-green-100 border border-green-400 text-green-700': tipoNotificacion === 'exito',
        'bg-red-100 border border-red-400 text-red-700': tipoNotificacion === 'error',
      }
    ]">
      <div class="flex items-center">
        <svg v-if="tipoNotificacion === 'exito'" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clip-rule="evenodd"></path>
        </svg>
        <svg v-if="tipoNotificacion === 'error'" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"></path>
        </svg>
        <span>{{ mensajeNotificacion }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import AgendarTareas from "@/components/Agendar-Tareas.vue";
import VisualizadorTareas from "@/components/VisualizadorTareas.vue";
import SideBar from "@/components/SideBar.vue";
import EventoService from '@/models/eventoService';
const eventoService = new EventoService();
import PermisoService from "@/models/permisoService";
const permisoService = new PermisoService();
import notificacionCalendar from "@/components/notificacionCalendar.vue";

export default {
  name: "CalendarioMain",
  components: {
    AgendarTareas,
    VisualizadorTareas,
    SideBar,
    notificacionCalendar
  },
  props: {
    usuario: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      // EVENTOS CARGADOS DESDE EL BACKEND
      eventos: {},
      cargandoEventos: false,

      fechaActual: new Date(),
      diaSeleccionado: null,
      diasSemana: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
      mostrarModalTarea: false,
      eventoEditando: null,
      fechaOriginalEvento: null,

      // Sistema de notificaciones
      mostrarNotificacion: false,
      mensajeNotificacion: "",
      tipoNotificacion: "exito",

      // Categorías con iconos
      categorias: [
        { nombre: "Trabajo", valor: "trabajo", color: "#4299e1" },
        { nombre: "Cumpleaños", valor: "cumpleaños", color: "#e64e81" },
        { nombre: "Basura", valor: "basura", color: "#8a4e03" },
        { nombre: "Otro", valor: "otro", color: "#9f7aea" },
      ],

      // MAPA DE ICONOS SVG PARA CADA CATEGORÍA
      iconosPorCategoria: {
        trabajo: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>',
        cumpleaños: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h1.428M19 12a2 2 0 100-4H18.57"/>',
        basura: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>',
        otro: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>'
      },
      userInfo: {},
      permisoService

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
    calendarPermissions() {
      return permisoService.getCalendarPermissions();
    },

    uiPermissions() {
      return permisoService.getUIPermissions();
    },

    canCreateEvent() {
      return this.calendarPermissions.canCreate;
    },

    canViewAllEvents() {
      return this.calendarPermissions.canViewAll;
    },

    canManageCalendar() {
      return this.calendarPermissions.canManage;
    },

    isAdmin() {
      return permisoService.isAdmin();
    },

    // ACTUALIZAR ESTE COMPUTED
    canUseAssignmentTools() {
      return this.canCreateEvent && (this.isAdmin || permisoService.hasAnyPermission(['gestionarRoles', 'crearEvento']));
    },

    canUseAdminTools() {
      return this.$static.BM_IS_ADMIN();
    }


  },

  // WATCHERS PARA CARGAR EVENTOS CUANDO CAMBIA EL MES
  watch: {
    fechaActual: {
      handler(nuevaFecha, fechaAnterior) {
        if (!fechaAnterior) {
          this.cargarEventos();
        }
      },
      deep: true
    }
  },

  methods: {
    // MÉTODO PRINCIPAL: CARGAR EVENTOS DEL USUARIO + GLOBALES 
    async cargarEventos() {
      try {
        this.cargandoEventos = true;

        const userData = this.$static.BM_GET_USER_DATA();


        // USAR MÉTODO QUE OBTIENE EVENTOS ASIGNADOS + GLOBALES DE OFICINA console.log("Usuario actual:", userData);
        const response = await eventoService.getEventosCurrentUserWithGlobals();

        const eventos = response.data || response;

        this.organizarEventosPorFecha(eventos);

        const totalEventos = Object.keys(this.eventos).length;
        const eventosGlobales = this.contarEventosGlobales();
        const nombreOficina = userData?.oficina || 'tu oficina';

        this.mostrarMensajeExito(
          `Cargados ${totalEventos} días con eventos de ${nombreOficina} (${eventosGlobales} globales)`
        );

      } catch (error) {
        console.error("Error al cargar eventos:", error);
        this.mostrarMensajeError("Error al cargar eventos del servidor");
      } finally {
        this.cargandoEventos = false;
      }
    },

    // FILTRAR EVENTOS POR MES Y AÑO
    filtrarEventosPorMes(eventos, año, mes) {
      if (!Array.isArray(eventos)) return [];

      return eventos.filter(evento => {
        const fechaEvento = new Date(evento.fechaInicio);
        return fechaEvento.getFullYear() === año && fechaEvento.getMonth() === mes;
      });
    },

    // ORGANIZAR EVENTOS POR FECHA PARA EL CALENDARIO
    organizarEventosPorFecha(eventosArray) {
      const eventosOrganizados = {};

      if (Array.isArray(eventosArray)) {
        eventosArray.forEach(evento => {
          // Obtener fecha del evento
          const fechaEvento = this.formatFecha(evento.fechaInicio);

          if (!eventosOrganizados[fechaEvento]) {
            eventosOrganizados[fechaEvento] = [];
          }

          // Agregar color basado en categoría si no lo tiene
          const eventoConColor = {
            ...evento,
            color: evento.color || this.obtenerColorEvento(evento)
          };

          eventosOrganizados[fechaEvento].push(eventoConColor);
        });
      }

      // Actualizar el estado
      this.eventos = eventosOrganizados;
    },

    // VERIFICAR SI UN EVENTO ES GLOBAL
    esEventoGlobal(evento) {
      // Un evento es global si no tiene usuarios asignados
      return !evento.usuariosAsignados || evento.usuariosAsignados.length === 0;
    },

    // OBTENER TÍTULO COMPLETO DEL EVENTO
    obtenerTituloEvento(evento) {
      const titulo = `${evento.titulo} - ${this.obtenerNombreCategoria(evento.categoria)}`;
      if (this.esEventoGlobal(evento)) {
        return `${titulo} (Global)`;
      }
      return titulo;
    },

    // CONTAR EVENTOS GLOBALES
    contarEventosGlobales() {
      let contador = 0;
      Object.values(this.eventos).forEach((eventosDia) => {
        if (Array.isArray(eventosDia)) {
          eventosDia.forEach(evento => {
            if (this.esEventoGlobal(evento)) {
              contador++;
            }
          });
        }
      });
      return contador;
    },

    // FORMATEAR FECHA PARA ENVIAR AL BACKEND (YYYY-MM-DD)
    formatearFechaParaBackend(fecha) {
      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const dia = String(fecha.getDate()).padStart(2, "0");
      return `${año}-${mes}-${dia}`;
    },

    // CONTAR EVENTOS TOTALES
    contarEventosTotales() {
      return Object.values(this.eventos).reduce((total, eventosDia) => total + eventosDia.length, 0);
    },

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

    async refreshUserPermissions() {
      try {
        await permisoService.refreshUserPermissions();
        this.mostrarMensajeExito("Permisos actualizados");
      } catch (error) {
        console.error("Error al refrescar permisos:", error);
        this.mostrarMensajeError("Error al actualizar permisos");
      }
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
      if (this.$static.BM_GET_USER_ROLE()?.nombre === 'USUARIO') {
        return;
      }
      this.diaSeleccionado = dia.fecha;
      this.eventoEditando = null;
      this.$emit("dia-seleccionado", dia.fecha);

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

      let fechaObj;

      if (fecha instanceof Date) {
        fechaObj = fecha;
      } else if (typeof fecha === "string") {
        if (fecha.includes('T')) {
          fechaObj = new Date(fecha);
        } else {
          const [año, mes, dia] = fecha.split("-");
          fechaObj = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
        }
      } else {
        return "";
      }

      if (isNaN(fechaObj.getTime())) {
        return "";
      }

      const año = fechaObj.getFullYear();
      const mes = String(fechaObj.getMonth() + 1).padStart(2, "0");
      const dia = String(fechaObj.getDate()).padStart(2, "0");
      return `${año}-${mes}-${dia}`;
    },

    obtenerColorEvento(evento) {
      if (evento.color) {
        return evento.color;
      }

      const categoria = this.categorias.find(cat => cat.valor === evento.categoria);
      return categoria ? categoria.color : "#9f7aea";
    },

    obtenerIconoCategoria(categoria) {
      return this.iconosPorCategoria[categoria] || this.iconosPorCategoria.otro;
    },

    obtenerNombreCategoria(categoria) {
      const cat = this.categorias.find(c => c.valor === categoria);
      return cat ? cat.nombre : 'Otro';
    },

    tieneEventos(dia) {
      const fechaFormateada = this.formatFecha(dia.fecha);
      return this.eventos[fechaFormateada] && this.eventos[fechaFormateada].length > 0;
    },

    getEventos(dia) {
      const fechaFormateada = this.formatFecha(dia.fecha);
      return this.eventos[fechaFormateada] || [];
    },

    getEventosLimitados(dia) {
      const eventos = this.getEventos(dia);
      return eventos.slice(0, 4);
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

    // IMPORTANTE: Después de guardar, recargar eventos
    async guardarEventoYPropagar(evento) {
      try {


        // Recargar eventos para mostrar el nuevo evento
        await this.cargarEventos();

        // Cerrar modal
        this.cerrarModalTarea();

        this.mostrarMensajeExito(`Evento "${evento.titulo}" guardado correctamente`);

      } catch (error) {
        console.error("Error al procesar evento:", error);
        this.mostrarMensajeError("Error al procesar el evento");
      }
    },

    async editarEvento(evento) {

      if (!permisoService.canPerformEventAction(evento, 'edit')) {
        this.mostrarMensajeError("No tienes permisos para editar este evento");
        return;
      }

      try {
        this.eventoEditando = {
          ...evento,
          fechaInicio: evento.fechaInicio || evento.fecha,
          fechaFin: evento.fechaFin || evento.fecha
        };

        console.log("Editando evento:", this.eventoEditando);

        if (evento.fechaInicio) {
          this.diaSeleccionado = new Date(evento.fechaInicio);
        } else if (evento.fecha) {
          const [año, mes, dia] = evento.fecha.split("-");
          this.diaSeleccionado = new Date(parseInt(año), parseInt(mes) - 1, parseInt(dia));
        }

        this.mostrarModalTarea = true;

      } catch (error) {
        console.error("Error al editar evento:", error);
        this.mostrarMensajeError("Error al cargar el evento para edición");
      }
    },

    async eliminarEventoYPropagar(id, fecha) {
      const evento = this.encontrarEventoPorId(id);
      if (!evento) {
        this.mostrarMensajeError("Evento no encontrado");
        return;
      }

      if (!permisoService.canPerformEventAction(evento, 'delete')) {
        this.mostrarMensajeError("No tienes permisos para eliminar este evento");
        return;
      }

      try {
        console.log("Eliminando evento:", id);

        // Eliminar del backend
        await eventoService.deleteEvento(id);

        // Recargar eventos
        await this.cargarEventos();

        this.mostrarMensajeExito("Evento eliminado correctamente");

      } catch (error) {
        console.error("Error al eliminar evento:", error);
        this.mostrarMensajeError("Error al eliminar el evento");
      }
    },

    encontrarEventoPorId(id) {
      for (const eventosDelDia of Object.values(this.eventos)) {
        if (Array.isArray(eventosDelDia)) {
          const evento = eventosDelDia.find(e => e.id === id);
          if (evento) return evento;
        }
      }
      return null;
    },


    // Sistema de notificaciones
    mostrarMensajeExito(mensaje) {
      this.mostrarNotificacion = true;
      this.mensajeNotificacion = mensaje;
      this.tipoNotificacion = "exito";

      setTimeout(() => {
        this.mostrarNotificacion = false;
      }, 3000);
    },

    mostrarMensajeError(mensaje) {
      this.mostrarNotificacion = true;
      this.mensajeNotificacion = mensaje;
      this.tipoNotificacion = "error";

      setTimeout(() => {
        this.mostrarNotificacion = false;
      }, 5000);
    },

    abrirModalAgendar() {
      this.eventoEditando = null;
      this.mostrarModalTarea = true;
    },

  },

  // CICLO DE VIDA: CARGAR EVENTOS AL INICIAR
  async created() {
    // Establecer el día seleccionado como hoy al iniciar
    this.diaSeleccionado = new Date();
  },

  // CARGAR EVENTOS CUANDO SE MONTA EL COMPONENTE
  async mounted() {
    this.userInfo = this.$static.BM_GET_SIDEBAR_DATA();


    await this.cargarEventos();
  },
};
</script>