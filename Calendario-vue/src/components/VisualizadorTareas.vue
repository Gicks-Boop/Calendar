<template>
  <div class="visualizador-tareas">
    <!-- Panel de visualización de tareas con transición mejorada -->
    <div v-if="mostrarPanel"
      class="fixed inset-y-0 right-0 w-80  bg-white shadow-xl z-40 transform border-l border-gray-200" :class="{
        'translate-x-0 animate-slide-in': mostrarPanel,
        'translate-x-full': !mostrarPanel,
      }">
      <!-- Cabecera del panel -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 class="text-lg font-bold truncate">Eventos Agendados</h3>
        <button @click="cerrarPanel"
          class="text-white hover:text-gray-200 focus:outline-none transition-colors duration-200">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido del panel -->
      <div class="p-4 h-full overflow-y-auto pb-20">
        <!-- Si no hay eventos -->
        <div v-if="!tieneTareas" class="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-center">No hay eventos agendados</p>
        </div>

        <!-- Lista de todas las tareas -->
        <div v-else class="space-y-4">
          <!-- Filtros -->
          <div class="mb-4 space-y-2">
            <!-- Filtro por mes/año -->
            <div>
              <label for="filtro-mes" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por:</label>
              <div class="grid grid-cols-2 gap-2">
                <select id="filtro-mes" v-model="filtroMes"
                  class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm transition-shadow duration-200 hover:shadow-md">
                  <option value="todos">Todos los meses</option>
                  <option v-for="(mes, index) in mesesDelAño" :key="index" :value="index">
                    {{ mes }}
                  </option>
                </select>
                <select id="filtro-anio" v-model="filtroAnio"
                  class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm transition-shadow duration-200 hover:shadow-md">
                  <option value="todos">Todos los años</option>
                  <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
                    {{ anio }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Filtro por tipo de evento -->
            <div>
              <label for="filtro-tipo" class="block text-sm font-medium text-gray-700 mb-1">Tipo de evento:</label>
              <select id="filtro-tipo" v-model="filtroTipo"
                class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm transition-shadow duration-200 hover:shadow-md">
                <option value="todos">Todos los eventos</option>
                <option value="asignados">Solo mis eventos</option>
                <option value="globales">Solo eventos globales</option>
              </select>
            </div>
          </div>

          <!-- Eventos agrupados por categoría -->
          <div v-for="(categoriaData, valor) in eventosPorCategoria" :key="valor" class="mb-4">
            <!-- Cabecera por categoría -->
            <div class="p-2 rounded-lg border mb-2 cursor-pointer transition-all duration-200" :style="{
              backgroundColor: categoriaData.color + '20',
              borderColor: categoriaData.color,
            }" @click="toggleCategoria(valor)">
              <div class="flex justify-between items-center">
                <h5 class="font-medium" :style="{ color: categoriaData.color }">
                  {{ categoriaData.nombre }} ({{ categoriaData.eventos.length }})
                </h5>
                <div class="flex items-center space-x-2">
                  <!-- Indicadores de tipos de eventos en la categoría -->
                  <div v-if="categoriaData.tieneAsignados" class="w-2 h-2 bg-blue-500 rounded-full"
                    title="Tiene eventos asignados"></div>
                  <div v-if="categoriaData.tieneGlobales" class="w-2 h-2 bg-yellow-500 rounded-full"
                    title="Tiene eventos globales"></div>

                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-300"
                    :class="{ 'transform rotate-180': !categoriasColapsadas[valor] }"
                    :style="{ color: categoriaData.color }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Lista de eventos -->
            <div v-if="!categoriasColapsadas[valor]" class="transition-all duration-500 overflow-hidden">
              <div v-for="evento in categoriaData.eventos" :key="evento.id"
                class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-200 mb-2 transform hover:translate-x-1"
                :class="{
                  'border-l-4 border-l-yellow-400': esEventoGlobal(evento),
                  'border-l-4 border-l-blue-400': !esEventoGlobal(evento)
                }">
                <!-- Barra superior con título y acciones -->
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full flex items-center justify-center relative"
                      :style="{ backgroundColor: obtenerColorEvento(evento) }">
                      <!-- Indicador de evento global -->
                      <div v-if="esEventoGlobal(evento)"
                        class="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full border border-white"
                        title="Evento global"></div>
                    </div>
                    <h5 class="font-medium text-gray-800">{{ evento.titulo }}</h5>
                    <span v-if="esEventoGlobal(evento)"
                      class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      Global
                    </span>
                  </div>
                  <div class="flex space-x-1">
                    <button v-if="canEditSpecificEvent(evento)" @click="editarEvento(evento)"
                      class="text-gray-500 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                      title="Editar evento">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button v-if="canDeleteSpecificEvent(evento)"
                      @click="confirmarEliminacion(evento.id, evento.fechaStr)"
                      class="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                      title="Eliminar evento">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <div v-if="!canEditSpecificEvent(evento) && !canDeleteSpecificEvent(evento)"
                      class="text-xs text-gray-400 px-2 py-1" title="Sin permisos para modificar">
                      <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clip-rule="evenodd"></path>
                      </svg>
                    </div>

                  </div>
                </div>

                <!-- Detalles del evento -->
                <div class="pl-5">
                  <!-- Categoría -->
                  <div class="text-sm text-gray-500 flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ obtenerNombreCategoria(evento.categoria) }}
                  </div>

                  <!-- Fechas -->
                  <div class="text-sm text-gray-500 flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div class="flex flex-col">
                      <span class="font-medium">{{ formatearFechaCompleta(evento.fechaStr) }}</span>
                      <span v-if="evento.fechaInicio && evento.fechaFin" class="text-xs text-gray-400">
                        {{ formatearHoraCompleta(evento.fechaInicio) }} - {{ formatearHoraCompleta(evento.fechaFin) }}
                      </span>
                    </div>
                  </div>

                  <!-- Creador del evento -->
                  <div v-if="evento.creador" class="text-sm text-gray-500 flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <span class="font-medium">Creado por:</span>
                      {{ evento.creador.nombre }} {{ evento.creador.apellido }}
                    </div>
                  </div>

                  <!-- Usuarios asignados -->
                  <div class="text-sm text-gray-500 flex items-start mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 mt-0.5" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div class="flex flex-col">
                      <div v-if="esEventoGlobal(evento)" class="flex items-center">
                        <span class="text-yellow-600 font-medium">Evento Global</span>
                        <span class="text-xs text-gray-400 ml-2">(Visible para toda la oficina)</span>
                      </div>
                      <div v-else-if="evento.usuariosAsignados && evento.usuariosAsignados.length > 0">
                        <span class="font-medium">Asignado a ({{ evento.usuariosAsignados.length }}):</span>
                        <div class="text-xs mt-1 space-y-1">
                          <div v-for="usuario in evento.usuariosAsignados" :key="usuario.id" class="flex items-center">
                            <div class="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                            <span>{{ usuario.nombre }} {{ usuario.apellido }}</span>
                            <span v-if="usuario.email" class="text-gray-400 ml-1">({{ usuario.email }})</span>
                          </div>
                        </div>
                      </div>
                      <div v-else>
                        <span class="text-gray-400 italic">Sin usuarios asignados</span>
                      </div>
                    </div>
                  </div>

                  <!-- Oficina -->
                  <div v-if="evento.oficina" class="text-sm text-gray-500 flex items-center mb-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>{{ evento.oficina.nombre }}</span>
                  </div>

                  <!-- Descripción (si existe) -->
                  <div v-if="evento.descripcion" class="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
                    <div class="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 mt-0.5 text-gray-400" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>{{ evento.descripcion }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante para mostrar panel -->
    <button v-if="!mostrarPanel" @click="mostrarPanel = true"
      class="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all duration-300 z-30 flex items-center transform hover:scale-110"
      :class="{ 'animate-pulse': contadorTareas > 0 }">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <!-- <span
        class="ml-1 transition-all duration-300"
        :class="{ 'animate-bounce': contadorTareas > 0 }"
        >{{ contadorTareas }}</span> -->
      Eventos
    </button>

    <!-- Modal de confirmación para eliminar tarea -->
    <div v-if="mostrarModalConfirmacion"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
      @click.self="cerrarModalConfirmacion">
      <div class="bg-white rounded-lg shadow-xl p-6 w-80 transform transition-all duration-300 ease-out">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Confirmar eliminación</h3>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end space-x-3">
          <button @click="cerrarModalConfirmacion"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-200">
            Cancelar
          </button>
          <button @click="eliminarEventoConfirmado"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200">
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "VisualizadorTareas",
  props: {
    diaSeleccionado: {
      type: Date,
      default: null,
    },
    eventos: {
      type: Object,
      default: () => ({}),
    },
    categorias: {
      type: Array,
      default: () => [],
    },
    permisoService: {
      type: Object,
      required: true
    },
  },
  data() {
    return {
      mostrarPanel: false,
      filtroMes: new Date().getMonth(),
      filtroAnio: new Date().getFullYear(),
      filtroTipo: "todos",
      mostrarModalConfirmacion: false,
      mostrarModalBorrarMes: false,
      eventoEliminarId: null,
      fechaEliminar: null,
      mesBorrar: new Date().getMonth(),
      anioBorrar: new Date().getFullYear(),
      mesesDelAño: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ],
      categoriasColapsadas: {},
    };
  },
  computed: {
    contadorTareas() {
      let contador = 0;
      Object.values(this.eventos).forEach((eventosArray) => {
        if (Array.isArray(eventosArray)) {
          contador += eventosArray.length;
        }
      });
      return contador;
    },

    contadorEventosAsignados() {
      let contador = 0;
      Object.values(this.eventos).forEach((eventosArray) => {
        if (Array.isArray(eventosArray)) {
          eventosArray.forEach(evento => {
            if (!this.esEventoGlobal(evento)) {
              contador++;
            }
          });
        }
      });
      return contador;
    },

    contadorEventosGlobales() {
      let contador = 0;
      Object.values(this.eventos).forEach((eventosArray) => {
        if (Array.isArray(eventosArray)) {
          eventosArray.forEach(evento => {
            if (this.esEventoGlobal(evento)) {
              contador++;
            }
          });
        }
      });
      return contador;
    },

    tieneTareas() {
      return this.contadorTareas > 0;
    },

    aniosDisponibles() {
      const anios = new Set();
      anios.add(new Date().getFullYear());

      Object.keys(this.eventos).forEach((fecha) => {
        const anio = parseInt(fecha.split("-")[0]);
        if (!isNaN(anio)) {
          anios.add(anio);
        }
      });
      return [...anios].sort((a, b) => b - a);
    },

    eventosFiltrados() {
      const resultado = {};

      Object.entries(this.eventos).forEach(([fecha, eventos]) => {
        if (!Array.isArray(eventos)) return;

        const [anio, mes] = fecha.split("-").map(Number);
        if (isNaN(anio) || isNaN(mes)) return;

        // Aplicar filtros de fecha
        const cumpleFiltroAnio = this.filtroAnio === "todos" || parseInt(this.filtroAnio) === anio;
        const cumpleFiltroMes = this.filtroMes === "todos" || parseInt(this.filtroMes) === (mes - 1);

        if (cumpleFiltroAnio && cumpleFiltroMes) {
          // Aplicar filtro por tipo de evento
          let eventosFiltradosPorTipo = eventos;

          if (this.filtroTipo === "asignados") {
            eventosFiltradosPorTipo = eventos.filter(evento => !this.esEventoGlobal(evento));
          } else if (this.filtroTipo === "globales") {
            eventosFiltradosPorTipo = eventos.filter(evento => this.esEventoGlobal(evento));
          }

          if (eventosFiltradosPorTipo.length > 0) {
            resultado[fecha] = eventosFiltradosPorTipo;
          }
        }
      });

      // Ordenar fechas cronológicamente (más recientes primero)
      return Object.fromEntries(
        Object.entries(resultado).sort(([fechaA], [fechaB]) => {
          return fechaB.localeCompare(fechaA);
        })
      );
    },

    eventosPorCategoria() {
      const agrupados = {};

      // Inicializar con categorías definidas
      this.categorias.forEach((cat) => {
        agrupados[cat.valor] = {
          nombre: cat.nombre,
          color: cat.color,
          eventos: [],
          tieneAsignados: false,
          tieneGlobales: false,
        };
      });

      // Procesar eventos
      Object.entries(this.eventosFiltrados).forEach(([fecha, eventosEnFecha]) => {
        if (!Array.isArray(eventosEnFecha)) return;

        eventosEnFecha.forEach((evento) => {
          if (!evento || !evento.categoria) return;

          const eventoConFecha = {
            ...evento,
            fechaStr: fecha,
          };

          // Si la categoría no existe, crearla
          if (!agrupados[evento.categoria]) {
            agrupados[evento.categoria] = {
              nombre: this.obtenerNombreCategoria(evento.categoria),
              color: this.obtenerColorEvento(evento),
              eventos: [],
              tieneAsignados: false,
              tieneGlobales: false,
            };
          }

          agrupados[evento.categoria].eventos.push(eventoConFecha);

          // Marcar si tiene eventos asignados o globales
          if (this.esEventoGlobal(evento)) {
            agrupados[evento.categoria].tieneGlobales = true;
          } else {
            agrupados[evento.categoria].tieneAsignados = true;
          }
        });
      });

      // Filtrar solo categorías con eventos y ordenar eventos por fecha
      return Object.fromEntries(
        Object.entries(agrupados)
          .filter(([, data]) => data.eventos.length > 0)
          .map(([categoria, data]) => [
            categoria,
            {
              ...data,
              eventos: data.eventos.sort((a, b) => {
                // Ordenar por fecha de inicio si está disponible, sino por fechaStr
                const fechaA = a.fechaInicio ? new Date(a.fechaInicio) : new Date(a.fechaStr);
                const fechaB = b.fechaInicio ? new Date(b.fechaInicio) : new Date(b.fechaStr);
                return fechaB - fechaA; // Más recientes primero
              })
            }
          ])
      );
    },

    mesActualNombre() {
      return this.mesesDelAño[new Date().getMonth()];
    },

    añoActual() {
      return new Date().getFullYear();
    },

    calendarPermissions() {
      return this.permisoService ? this.permisoService.getCalendarPermissions() : {};
    },

    canEditEvents() {
      return this.calendarPermissions.canEdit || this.calendarPermissions.canManage;
    },

    canDeleteEvents() {
      return this.calendarPermissions.canDelete || this.calendarPermissions.canManage;
    },
  },

  methods: {
    cerrarPanel() {
      this.mostrarPanel = false;
    },

    // ACTUALIZADO: Método para verificar si un evento es global
    esEventoGlobal(evento) {
      // Un evento es global si no tiene usuarios asignados
      return !evento.usuariosAsignados || evento.usuariosAsignados.length === 0;
    },

    obtenerColorEvento(evento) {
      // Prioridad: color del evento > color por categoría > color por defecto
      if (evento.color) {
        return evento.color;
      }

      const categoria = this.categorias.find(cat => cat.valor === evento.categoria);
      return categoria ? categoria.color : "#9f7aea";
    },

    obtenerNombreCategoria(categoriaValor) {
      const categoria = this.categorias.find((cat) => cat.valor === categoriaValor);
      return categoria ? categoria.nombre : this.capitalize(categoriaValor);
    },

    capitalize(str) {
      if (!str) return "";
      return str.charAt(0).toUpperCase() + str.slice(1);
    },

    formatearFechaCompleta(fechaStr) {
      try {
        const [anio, mes, dia] = fechaStr.split("-");
        const fecha = new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));

        if (isNaN(fecha.getTime())) {
          return fechaStr;
        }

        return fecha.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      } catch (error) {
        console.error("Error al formatear fecha:", error);
        return fechaStr;
      }
    },

    formatearHoraCompleta(fechaISO) {
      try {
        if (!fechaISO) return "";

        const fecha = new Date(fechaISO);
        if (isNaN(fecha.getTime())) return "";

        return fecha.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        });
      } catch (error) {
        console.error("Error al formatear hora:", error);
        return "";
      }
    },

    editarEvento(evento) {
      if (!this.permisoService || !this.permisoService.canPerformEventAction(evento, 'edit')) {
        // Mostrar mensaje de error o simplemente no hacer nada
        console.warn("Sin permisos para editar evento");
        return;
      }

      // Asegurar que el evento tenga la fecha correcta
      const eventoParaEditar = {
        ...evento,
        // Si no tiene fecha como Date object, crear uno desde fechaStr
        fecha: evento.fecha || this.crearFechaDesdeString(evento.fechaStr)
      };

      console.log("Editando evento:", eventoParaEditar);
      this.$emit("editar-evento", eventoParaEditar);
    },

    crearFechaDesdeString(fechaStr) {
      try {
        const [anio, mes, dia] = fechaStr.split("-");
        return new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
      } catch (error) {
        console.error("Error al crear fecha desde string:", error);
        return new Date();
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

    confirmarEliminacion(id, fecha) {
      const evento = this.encontrarEventoPorId(id);
      if (!evento) {
        console.warn("Evento no encontrado");
        return;
      }

      if (!this.permisoService || !this.permisoService.canPerformEventAction(evento, 'delete')) {
        console.warn("Sin permisos para eliminar evento");
        return;
      }
      this.eventoEliminarId = id;
      this.fechaEliminar = fecha;
      this.mostrarModalConfirmacion = true;
    },



    cerrarModalConfirmacion() {
      this.mostrarModalConfirmacion = false;
      this.eventoEliminarId = null;
      this.fechaEliminar = null;
    },

    eliminarEventoConfirmado() {
      if (this.eventoEliminarId && this.fechaEliminar) {
        this.$emit("eliminar-evento", this.eventoEliminarId, this.fechaEliminar);
      }
      this.cerrarModalConfirmacion();
    },

    mostrarConfirmacionBorrarMes() {
      // Inicializar con valores del filtro actual si están seleccionados
      if (this.filtroMes !== "todos") {
        this.mesBorrar = parseInt(this.filtroMes);
      } else {
        this.mesBorrar = new Date().getMonth();
      }

      if (this.filtroAnio !== "todos") {
        this.anioBorrar = parseInt(this.filtroAnio);
      } else {
        this.anioBorrar = new Date().getFullYear();
      }

      this.mostrarModalBorrarMes = true;
    },

    cerrarModalBorrarMes() {
      this.mostrarModalBorrarMes = false;
    },


    toggleCategoria(categoriaId) {
      // Crear un nuevo objeto para forzar la reactividad
      this.categoriasColapsadas = {
        ...this.categoriasColapsadas,
        [categoriaId]: !this.categoriasColapsadas[categoriaId]
      };
    },

    inicializarEstadoColapso() {
      // Validar que categorias exista y sea un array
      if (!this.categorias || !Array.isArray(this.categorias)) {
        console.warn('Categorías no válidas:', this.categorias);
        return;
      }

      // Crear un nuevo objeto con todas las categorías inicializadas
      const nuevoEstado = { ...this.categoriasColapsadas };

      this.categorias.forEach((cat) => {
        if (cat && cat.valor && nuevoEstado[cat.valor] === undefined) {
          nuevoEstado[cat.valor] = true; // false = expandido
        }
      });

      // Asignar el nuevo objeto para forzar reactividad
      this.categoriasColapsadas = nuevoEstado;
    },

    abrirModalAgendar() {
      this.$emit("abrir-modal-tarea", this.diaSeleccionado || new Date());
    },
    canEditSpecificEvent(evento) { 
      return this.permisoService && this.permisoService.canPerformEventAction(evento, 'edit');
    },

    canDeleteSpecificEvent(evento) {
      
      return this.permisoService && this.permisoService.canPerformEventAction(evento, 'delete');
    },
  },

  watch: {
    // Observar cambios en las categorías para actualizar el estado de colapso
    categorias: {
      handler(newCategorias) {
        if (newCategorias && newCategorias.length > 0) {
          this.inicializarEstadoColapso();
        }
      },
      deep: true,
      immediate: true,
    },
  },

  mounted() {
    // Usar mounted en lugar de created para asegurar que el componente esté completamente inicializado
    this.inicializarEstadoColapso();
  },
};
</script>

<style scoped>
/* Estilos para las animaciones personalizadas */
@keyframes latido {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }
}

.animate-pulse {
  animation: latido 1.5s ease-in-out infinite;
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes appear {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }

  70% {
    opacity: 1;
    transform: scale(1.02);
  }

  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-appear {
  animation: appear 0.3s ease-out forwards;
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
  }

  70% {
    transform: translateX(-2%);
  }

  100% {
    transform: translateX(0);
  }
}

.animate-slide-in {
  animation: slide-in 0.3s ease-out forwards;
}

/* Estilos para el scroll personalizado */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Transiciones suaves */
.transition-all {
  transition: all 0.3s ease;
}

/* Hover effects */
.hover\:translate-x-1:hover {
  transform: translateX(0.25rem);
}

.hover\:scale-110:hover {
  transform: scale(1.1);
}
</style>