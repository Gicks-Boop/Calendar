<template>
  <div class="visualizador-tareas">
    <!-- Panel de visualización de tareas -->
    <div
      v-if="mostrarPanel"
      class="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out border-l border-gray-200"
      :class="{ 'translate-x-0': mostrarPanel, 'translate-x-full': !mostrarPanel }"
    >
      <!-- Cabecera del panel -->
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 flex justify-between items-center">
        <h3 class="text-lg font-bold truncate">
          Tareas Agendadas
        </h3>
        <button @click="cerrarPanel" class="text-white hover:text-gray-200 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Contenido del panel -->
      <div class="p-4 h-full overflow-y-auto pb-20">
        <!-- Si no hay eventos -->
        <div v-if="!tieneTareas" class="flex flex-col items-center justify-center h-64 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-center">No hay tareas agendadas</p>
          <button
            @click="abrirModalAgendar"
            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Agregar tarea
          </button>
        </div>

        <!-- Lista de todas las tareas -->
        <div v-else class="space-y-4">
          <h4 class="font-medium text-gray-700 mb-2">Tareas agendadas:</h4>

          <!-- Filtro por mes/año -->
          <div class="mb-4">
            <label for="filtro-mes" class="block text-sm font-medium text-gray-700 mb-1">Filtrar por:</label>
            <div class="grid grid-cols-2 gap-2">
              <select
                id="filtro-mes"
                v-model="filtroMes"
                class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
              >
                <option value="todos">Todos los meses</option>
                <option v-for="(mes, index) in mesesDelAño" :key="index" :value="index">
                  {{ mes }}
                </option>
              </select>
              <select
                id="filtro-anio"
                v-model="filtroAnio"
                class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
              >
                <option value="todos">Todos los años</option>
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
                  {{ anio }}
                </option>
              </select>
            </div>
          </div>

          <div
            v-for="(eventosPorFecha, fecha) in eventosFiltrados"
            :key="fecha"
            class="mb-4"
          >
            <div class="bg-blue-50 p-2 rounded-t-lg border border-blue-200 mb-2">
              <h5 class="font-medium text-blue-800">{{ formatearFechaCompleta(fecha) }}</h5>
            </div>

            <div
              v-for="evento in eventosPorFecha"
              :key="evento.id"
              class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow mb-2"
            >
              <!-- Barra superior con título y acciones -->
              <div class="flex justify-between items-start mb-2">
                <div class="flex items-center space-x-2">
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: evento.color }"></div>
                  <h5 class="font-medium text-gray-800">{{ evento.titulo }}</h5>
                </div>
                <div class="flex space-x-1">
                  <button
                    @click="editarEvento(evento, fecha)"
                    class="text-gray-500 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    @click="confirmarEliminacion(evento.id, fecha)"
                    class="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- Detalles del evento -->
              <div class="pl-5">
                <!-- Categoría -->
                <div class="text-sm text-gray-500 flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {{ obtenerNombreCategoria(evento.categoria) }}
                </div>

                <!-- Hora (si existe) -->
                <div v-if="evento.hora" class="text-sm text-gray-500 flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {{ formatearHora(evento.hora) }}
                </div>

                <!-- Descripción (si existe) -->
                <div v-if="evento.descripcion" class="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2">
                  {{ evento.descripcion }}
                </div>
              </div>
            </div>
          </div>

          <!-- Botón para agregar más tareas -->
          <button
            @click="abrirModalAgendar"
            class="w-full mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Agregar tarea
          </button>
        </div>
      </div>
    </div>

    <!-- Botón flotante para mostrar panel siempre visible -->
    <button
      v-if="!mostrarPanel"
      @click="mostrarPanel = true"
      class="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-colors z-30 flex items-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <span class="ml-1">{{ contadorTareas }}</span>
    </button>

    <!-- Modal de confirmación para eliminar tarea -->
    <div
      v-if="mostrarModalConfirmacion"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="mostrarModalConfirmacion = false"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 w-80 transform transition-all">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Confirmar eliminación</h3>
        <p class="text-gray-600 mb-6">¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="mostrarModalConfirmacion = false"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            @click="eliminarEventoConfirmado"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VisualizadorTareas',
  props: {
    diaSeleccionado: {
      type: Date,
      default: null
    },
    eventos: {
      type: Object,
      default: () => ({})
    },
    categorias: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      mostrarPanel: false,
      filtroMes: 'todos',
      filtroAnio: 'todos',
      mostrarModalConfirmacion: false,
      eventoEliminarId: null,
      fechaEliminar: null,
      mesesDelAño: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ]
    };
  },
  computed: {
    contadorTareas() {
      let contador = 0;
      Object.values(this.eventos).forEach(eventosArray => {
        contador += eventosArray.length;
      });
      return contador;
    },
    tieneTareas() {
      return this.contadorTareas > 0;
    },
    aniosDisponibles() {
      const anios = new Set();
      Object.keys(this.eventos).forEach(fecha => {
        const anio = parseInt(fecha.split('-')[0]);
        anios.add(anio);
      });
      return [...anios].sort();
    },
    eventosFiltrados() {
      const resultado = {};

      Object.entries(this.eventos).forEach(([fecha, eventos]) => {
        const [anio, mes] = fecha.split('-').map(Number);

        // Aplicar filtros
        if (
          (this.filtroAnio === 'todos' || parseInt(this.filtroAnio) === anio) &&
          (this.filtroMes === 'todos' || parseInt(this.filtroMes) === mes - 1)
        ) {
          resultado[fecha] = eventos;
        }
      });

      // Ordenar fechas cronológicamente
      return Object.fromEntries(
        Object.entries(resultado).sort(([fechaA], [fechaB]) => {
          return fechaA.localeCompare(fechaB);
        })
      );
    }
  },
  methods: {
    cerrarPanel() {
      this.mostrarPanel = false;
    },
    formatFecha(fecha) {
      if (!fecha) return '';

      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, '0');
      const dia = String(fecha.getDate()).padStart(2, '0');
      return `${año}-${mes}-${dia}`;
    },
    formatearFechaCompleta(fechaStr) {
      const [anio, mes, dia] = fechaStr.split('-');
      const fecha = new Date(anio, mes - 1, dia);

      return fecha.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },
    abrirModalAgendar() {
      this.$emit('abrir-modal-tarea', this.diaSeleccionado || new Date());
    },
    editarEvento(evento, fechaStr) {
      // Crear objeto fecha a partir del string
      const [anio, mes, dia] = fechaStr.split('-');
      const fecha = new Date(anio, mes - 1, dia);

      // Asegurar que el evento tenga la propiedad fecha
      const eventoCompleto = {
        ...evento,
        fecha: fecha
      };

      this.$emit('editar-evento', eventoCompleto);
    },
    confirmarEliminacion(id, fecha) {
      this.eventoEliminarId = id;
      this.fechaEliminar = fecha;
      this.mostrarModalConfirmacion = true;
    },
    eliminarEventoConfirmado() {
      this.$emit('eliminar-evento', this.eventoEliminarId, this.fechaEliminar);
      this.mostrarToast('Tarea eliminada correctamente', 'success');
      this.mostrarModalConfirmacion = false;
      this.eventoEliminarId = null;
      this.fechaEliminar = null;
    },
    obtenerNombreCategoria(categoriaValor) {
      const categoriaEncontrada = this.categorias.find(cat => cat.valor === categoriaValor);
      return categoriaEncontrada ? categoriaEncontrada.nombre : categoriaValor;
    },
    formatearHora(hora) {
      if (!hora) return '';

      try {
        const [horas, minutos] = hora.split(':');
        return `${horas}:${minutos}`;
      } catch {
        return hora;
      }
    },
    mostrarToast(mensaje, tipo) {
      this.$emit('mostrar-toast', mensaje, tipo);
    }
  }
};
</script>
