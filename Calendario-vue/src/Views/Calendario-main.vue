<template>
  <div
    class="w-full h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
    <!-- Componente VisualizadorTareas -->
    <visualizador-tareas :eventos="eventos" :categorias="categoriasActivas" :permiso-service="permisoService"
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
        <!-- Toggle para colores daltónicos -->
        <button @click="toggleColorblindMode"
          class="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white"
          :title="colorblindMode ? 'Desactivar modo daltónico' : 'Activar modo daltónico'"
          :class="{ 'bg-blue-400': colorblindMode }">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            <circle v-if="colorblindMode" cx="12" cy="12" r="2" fill="currentColor" />
          </svg>
        </button>

        <!-- Toggle para mostrar detalles -->
        <button @click="mostrarDetallesEventos = !mostrarDetallesEventos"
          class="p-2 rounded-full hover:bg-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white text-white"
          :title="mostrarDetallesEventos ? 'Ocultar detalles' : 'Mostrar detalles'">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="!mostrarDetallesEventos" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
          </svg>
        </button>

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

        <notificacion-calendar />

        <!-- SideBar component -->
        <side-bar :usuario="usuario" @cerrar-sesion="cerrarSesion" @asignar-basura="handleAsignarBasura"
          @ruleta="handleRuleta" @usuario-eliminado="handleUsuarioEliminado"
          @usuario-actualizado="handleUsuarioActualizado">
        </side-bar>



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
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
        <span class="text-gray-700">Cargando eventos...</span>
      </div>
    </div>

    <div class="flex-1 grid grid-cols-7 gap-1 bg-gray-100 p-2 overflow-auto">
      <div v-for="(dia, index) in diasCalendario" :key="index" @click="selectDay(dia)" :class="[
        'flex flex-col items-start justify-start p-1 relative rounded-lg transition-all duration-200 min-h-[100px] max-h-[140px] lg:min-h-[120px] lg:max-h-[180px]',
        { 'bg-blue-300 text-white font-bold shadow-lg ring-2 ring-blue-500': dia.esHoy },
        { 'bg-blue-100 font-medium border border-blue-300': dia.esSeleccionado && !dia.esHoy },
        { 'text-gray-400 bg-gray-50 border border-gray-200': !dia.esMesActual },
        {
          'bg-white border border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer':
            dia.esMesActual && !dia.esHoy && !dia.esSeleccionado,
        },
      ]">
        <!-- Número del día -->
        <span :class="[
          'text-sm lg:text-base font-medium mb-1 w-6 h-6 lg:w-8 lg:h-8 flex items-center justify-center rounded-full flex-shrink-0 sticky top-0 z-10',
          { 'bg-blue-500 text-white': dia.esHoy },
          { 'hover:bg-blue-100': dia.esMesActual && !dia.esHoy && !dia.esSeleccionado },
          { 'bg-blue-700': dia.esHoy }, // Asegurar que el número sea visible sobre el fondo azul
        ]">{{ dia.numero }}</span>

        <!-- Contenedor de eventos con scroll -->
        <div v-if="tieneEventos(dia)" class="w-full flex-1 overflow-hidden">

          <!-- Vista con detalles (responsive) -->
          <div v-if="mostrarDetallesEventos" class="h-full overflow-y-auto event-container pr-1">
            <div class="space-y-1 pb-1">
              <!-- TODOS los eventos visibles con texto (sin limitación) -->
              <div v-for="(evento, eventoIndex) in getEventos(dia)" :key="`${evento.id}-${eventoIndex}`"
                class="relative group cursor-pointer" :title="obtenerTituloCompleto(evento)">

                <!-- Versión desktop/tablet -->
                <div class="hidden sm:flex items-center space-x-1 p-1 rounded text-xs hover:shadow-sm transition-shadow"
                  :style="{ backgroundColor: obtenerColorEvento(evento) + '20', borderLeft: `3px solid ${obtenerColorEvento(evento)}` }">

                  <!-- Icono -->
                  <div class="flex-shrink-0 w-3 h-3 rounded-full flex items-center justify-center"
                    :style="{ backgroundColor: obtenerColorEvento(evento) }">
                    <svg class="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <g v-html="obtenerIconoCategoria(evento.categoria)"></g>
                    </svg>
                  </div>

                  <!-- Texto del evento -->
                  <div class="flex-1 min-w-0">
                    <div class="font-medium text-gray-800 truncate text-xs"
                      :style="{ color: obtenerColorEvento(evento) }">
                      {{ evento.titulo }}
                    </div>
                    <div v-if="evento.fechaInicio" class="text-gray-500 text-xs">
                      {{ formatearHora(evento.fechaInicio) }}
                    </div>
                  </div>

                  <!-- Indicador de evento global -->
                  <div v-if="esEventoGlobal(evento)"
                    class="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full border border-white" title="Evento global">
                  </div>
                </div>

                <!-- Versión móvil -->
                <div class="sm:hidden flex items-center justify-between p-1 rounded text-xs"
                  :style="{ backgroundColor: obtenerColorEvento(evento) + '15' }">

                  <div class="flex items-center space-x-1 flex-1 min-w-0">
                    <!-- Icono pequeño -->
                    <div class="flex-shrink-0 w-2 h-2 rounded-full"
                      :style="{ backgroundColor: obtenerColorEvento(evento) }"></div>

                    <!-- Texto truncado -->
                    <span class="font-medium truncate text-xs" :style="{ color: obtenerColorEvento(evento) }">
                      {{ evento.titulo.length > 8 ? evento.titulo.substring(0, 8) + '...' : evento.titulo }}
                    </span>
                  </div>

                  <!-- Indicadores -->
                  <div class="flex items-center space-x-1 flex-shrink-0">
                    <div v-if="esEventoGlobal(evento)" class="w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Global">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Indicador de scroll si hay más contenido -->
            <div
              class="absolute bottom-0 right-0 bg-gradient-to-t from-white via-white to-transparent h-3 w-full pointer-events-none opacity-50">
            </div>
          </div>

          <!-- Vista compacta (solo iconos) -->
          <div v-else class="h-full overflow-y-auto event-container">
            <div class="flex flex-wrap justify-start items-start gap-1 pb-1">
              <!-- TODOS los iconos de eventos (sin limitación) -->
              <div v-for="(evento, eventoIndex) in getEventos(dia)" :key="`${evento.id}-${eventoIndex}`"
                class="relative flex items-center justify-center w-4 h-4 lg:w-5 lg:h-5 rounded-full shadow-sm transition-transform hover:scale-110 cursor-pointer flex-shrink-0"
                :style="{ backgroundColor: obtenerColorEvento(evento) }" :title="obtenerTituloCompleto(evento)">

                <!-- Indicador de evento global -->
                <div v-if="esEventoGlobal(evento)"
                  class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 lg:w-2 lg:h-2 bg-yellow-400 rounded-full border border-white"
                  title="Evento global"></div>

                <!-- SVG Icon basado en la categoría -->
                <svg class="w-2 h-2 lg:w-3 lg:h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <g v-html="obtenerIconoCategoria(evento.categoria)"></g>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-gray-50 border-t border-gray-200 p-3 text-center text-sm text-gray-600">
      <span class="font-medium">Hoy: </span>{{ fechaFormateada }}
      <span class="ml-4 text-xs">
        <button @click="mostrarDetallesEventos = !mostrarDetallesEventos"
          class="text-blue-600 hover:text-blue-800 mr-3">
          {{ mostrarDetallesEventos ? 'Vista compacta' : 'Vista detallada' }}
        </button>
        <button @click="toggleColorblindMode" class="text-blue-600 hover:text-blue-800">
          {{ colorblindMode ? 'Colores normales' : 'Modo daltónico' }}
        </button>
      </span>
    </div>

    <!-- Modal de Agendar Tareas -->
    <agendar-tareas :mostrar-modal="mostrarModalTarea" :fecha-seleccionada="diaSeleccionado"
      :evento-editar="eventoEditando" :categorias="categoriasActivas" :permiso-service="permisoService"
      @cerrar="cerrarModalTarea" @guardar-evento="guardarEventoYPropagar" @exito="mostrarMensajeExito"
      @error="mostrarMensajeError" />

    <!-- Toast/Notificaciones -->
    <div v-if="mostrarNotificacion" :class="[
      'fixed top-25 right-4 p-4 rounded-lg shadow-lg transition-all duration-300 z-50',
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
    notificacionCalendar,
  },
  props: {
    usuario: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      eventos: {},
      cargandoEventos: false,
      mostrarDetallesEventos: true,
      colorblindMode: false, //Modo para daltónicos

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
      mostrarModalBasura: false,

      // Categorías con iconos
      categorias: [
        { nombre: "Trabajo", valor: "trabajo", color: "#4299e1" },
        { nombre: "Cumpleaños", valor: "cumpleaños", color: "#e64e81" },
        { nombre: "Basura", valor: "basura", color: "#8a4e03" },
        { nombre: "Otro", valor: "otro", color: "#9f7aea" },
      ],

      // Paleta de colores para daltónicos
      categoriasColorblind: [
        { nombre: "Trabajo", valor: "trabajo", color: "#0066CC" }, // Azul fuerte
        { nombre: "Cumpleaños", valor: "cumpleaños", color: "#FF6600" }, // Naranja
        { nombre: "Basura", valor: "basura", color: "#006600" }, // Verde oscuro
        { nombre: "Otro", valor: "otro", color: "#660066" }, // Morado oscuro
      ],

      // MAPA DE ICONOS PARA CADA CATEGORÍA
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
    categoriasActivas() {
      return this.colorblindMode ? this.categoriasColorblind : this.categorias;
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
    /**Toggle para modo daltónico*/
    toggleColorblindMode() {
      this.colorblindMode = !this.colorblindMode;

      // Guardar preferencia en localStorage
      localStorage.setItem('calendar_colorblind_mode', this.colorblindMode.toString());

      // Reorgar eventos para aplicar nuevos colores
      this.reorganizarEventosConNuevosColores();

      // Mostrar mensaje
      const mensaje = this.colorblindMode
        ? 'Modo daltónico activado - colores adaptados'
        : 'Modo daltónico desactivado - colores normales';
      this.mostrarMensajeExito(mensaje);
    },
    reorganizarEventosConNuevosColores() {
      Object.keys(this.eventos).forEach(fecha => {
        if (Array.isArray(this.eventos[fecha])) {
          this.eventos[fecha].forEach(evento => {
            evento.color = this.obtenerColorEvento(evento);
          });
        }
      });
    },

    /**Cargar preferencia de modo daltónico desde localStorage*/
    cargarPreferenciasColorblind() {
      const savedMode = localStorage.getItem('calendar_colorblind_mode');
      if (savedMode !== null) {
        this.colorblindMode = savedMode === 'true';
      }
    },
    /**Determina el número máximo de eventos visibles según el tamaño de pantalla*/
    getMaxEventosVisibles() {
      // En móvil mostrar menos eventos para evitar overflow
      if (window.innerWidth < 640) return 2; // sm
      if (window.innerWidth < 1024) return 3; // lg
      return 4; // xl y superior
    },

    /**Obtiene los eventos visibles para un día específico*/
    getEventosVisibles(dia) {
      const eventos = this.getEventos(dia);
      const maxVisible = this.getMaxEventosVisibles();
      return eventos.slice(0, maxVisible);
    },

    /**Formatea la hora de un evento para mostrarla en el calendario*/
    formatearHora(fechaISO) {
      try {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        });
      } catch (error) {
        return '';
      }
    },
    obtenerTituloCompleto(evento) {
      let titulo = `${evento.titulo}`;

      if (evento.fechaInicio) {
        titulo += ` - ${this.formatearHora(evento.fechaInicio)}`;
      }

      titulo += ` (${this.obtenerNombreCategoria(evento.categoria)})`;

      if (this.esEventoGlobal(evento)) {
        titulo += ' - Evento Global';
      }

      if (evento.descripcion) {
        titulo += `\n${evento.descripcion}`;
      }

      return titulo;
    },

    // MÉTODO PRINCIPAL: CARGAR EVENTOS DEL USUARIO + GLOBALES 
    async cargarEventos() {
      try {
        this.cargandoEventos = true;

        const userData = this.$static.BM_GET_USER_DATA();

        // USAR MÉTODO QUE OBTIENE EVENTOS ASIGNADOS + GLOBALES DE OFICINA
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

        // Ordenar eventos por hora dentro de cada día
        Object.keys(eventosOrganizados).forEach(fecha => {
          eventosOrganizados[fecha].sort((a, b) => {
            const horaA = new Date(a.fechaInicio).getTime();
            const horaB = new Date(b.fechaInicio).getTime();
            return horaA - horaB;
          });
        });
      }

      // Actualizar el estado
      this.eventos = eventosOrganizados;
    },
    esEventoGlobal(evento) {
      // Un evento es global si no tiene usuarios asignados
      return !evento.usuariosAsignados || evento.usuariosAsignados.length === 0;
    },
    obtenerTituloEvento(evento) {
      const titulo = `${evento.titulo} - ${this.obtenerNombreCategoria(evento.categoria)}`;
      if (this.esEventoGlobal(evento)) {
        return `${titulo} (Global)`;
      }
      return titulo;
    },
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
    contarEventosTotales() {
      return Object.values(this.eventos).reduce((total, eventosDia) => total + eventosDia.length, 0);
    },
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
      if (evento.color && !this.colorblindMode) {
        return evento.color;
      }

      // Usar la paleta apropiada según el modo
      const paleta = this.categoriasActivas;
      const categoria = paleta.find(cat => cat.valor === evento.categoria);
      return categoria ? categoria.color : (this.colorblindMode ? "#660066" : "#9f7aea");
    },

    obtenerIconoCategoria(categoria) {
      return this.iconosPorCategoria[categoria] || this.iconosPorCategoria.otro;
    },

    obtenerNombreCategoria(categoria) {
      const cat = this.categoriasActivas.find(c => c.valor === categoria);
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

    // Después de guardar, recargar los eventos
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
      }, 1000);
    },

    mostrarMensajeError(mensaje) {
      this.mostrarNotificacion = true;
      this.mensajeNotificacion = mensaje;
      this.tipoNotificacion = "error";

      setTimeout(() => {
        this.mostrarNotificacion = false;
      }, 1000);
    },

    abrirModalAgendar() {
      this.eventoEditando = null;
      this.mostrarModalTarea = true;
    },
    handleUsuarioEliminado(usuario) {
      console.log("CalendarioMain: Usuario eliminado", usuario);

      // Mostrar mensaje de confirmación
      this.mostrarMensajeExito(`Usuario ${usuario.name} ${usuario.lastName} eliminado correctamente`);

      // Opcional: Recargar eventos si el usuario eliminado tenía eventos asignados
      // esto ayudará a refrescar la vista en caso de que hubiera eventos asignados al usuario eliminado
      this.cargarEventos();
    },
    handleUsuarioActualizado(usuario) {
      console.log("CalendarioMain: Usuario actualizado", usuario);
      this.mostrarMensajeExito(`Usuario ${usuario.nombre} ${usuario.apellido} actualizado correctamente`);
      // Opcional: recargar eventos si es necesario
      this.cargarEventos();
    }
  },

  // CICLO DE VIDA: CARGAR EVENTOS AL INICIAR
  async created() {
    // Establecer el día seleccionado como hoy al iniciar
    this.diaSeleccionado = new Date();
  },

  // CARGAR EVENTOS CUANDO SE MONTA EL COMPONENTE
  async mounted() {
    this.userInfo = this.$static.BM_GET_SIDEBAR_DATA();

    //Cargar preferencias de modo daltónico
    this.cargarPreferenciasColorblind();

    await this.cargarEventos();

    // Listener para cambios de tamaño de pantalla
    window.addEventListener('resize', () => {
      // Force re-render para recalcular eventos visibles
      this.$forceUpdate();
    });
  },

  beforeUnmount() {
    window.removeEventListener('resize', () => { });
  },
};
</script>

<style scoped>
/* Transiciones suaves para cambio de vista */
.calendar-day-content {
  transition: all 0.3s ease;
}

/* Hover effects mejorados */
.calendar-event-item:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Responsive text sizes */
@media (max-width: 640px) {
  .calendar-event-text {
    font-size: 0.6rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .calendar-event-text {
    font-size: 0.7rem;
  }
}

@media (min-width: 1025px) {
  .calendar-event-text {
    font-size: 0.75rem;
  }
}

/* Animación para toggle de vista */
.view-transition {
  transition: opacity 0.2s ease-in-out;
}

/* Scroll personalizado para contenido de eventos */
.event-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.event-container::-webkit-scrollbar {
  width: 4px;
}

.event-container::-webkit-scrollbar-track {
  background: transparent;
}

.event-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

.event-container::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Efecto de fade en la parte inferior para indicar scroll */
.event-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(transparent, rgba(255, 255, 255, 0.8));
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.event-container:hover::after {
  opacity: 1;
}

/* Scroll suave */
.event-container {
  scroll-behavior: smooth;
}

/* Evitar que el contenido se salga del contenedor */
.event-container>div {
  word-wrap: break-word;
  overflow-wrap: break-word;
}
</style>