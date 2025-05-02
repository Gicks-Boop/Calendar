<template>
  <div class="visualizador-tareas">
    <!-- Panel de visualización de tareas con transición mejorada -->
    <div
      v-if="mostrarPanel"
      class="fixed inset-y-0 right-0 w-80 bg-white shadow-xl z-40 transform border-l border-gray-200"
      :class="{
        'translate-x-0 animate-slide-in': mostrarPanel,
        'translate-x-full': !mostrarPanel,
      }"
    >
      <!-- Cabecera del panel -->
      <div
        class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-3 flex justify-between items-center"
      >
        <h3 class="text-lg font-bold truncate">Tareas Agendadas</h3>
        <button
          @click="cerrarPanel"
          class="text-white hover:text-gray-200 focus:outline-none transition-colors duration-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Contenido del panel -->
      <div class="p-4 h-full overflow-y-auto pb-20">
        <!-- Si no hay eventos -->
        <div
          v-if="!tieneTareas"
          class="flex flex-col items-center justify-center h-64 text-gray-500"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-16 w-16 mb-4 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p class="text-center">No hay tareas agendadas</p>
        </div>

        <!-- Lista de todas las tareas -->
        <div v-else class="space-y-4">
          <div class="flex justify-between items-center">
            <h4 class="font-medium text-gray-700">Pendientes:</h4>
            <!-- Botón para borrar tareas del mes -->
            <button
              @click="mostrarConfirmacionBorrarMes"
              class="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-all duration-200 flex items-center"
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Borrar mes
            </button>
          </div>

          <!-- Filtro por mes/año -->
          <div class="mb-4">
            <label for="filtro-mes" class="block text-sm font-medium text-gray-700 mb-1"
              >Filtrar por:</label
            >
            <div class="grid grid-cols-2 gap-2">
              <select
                id="filtro-mes"
                v-model="filtroMes"
                class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm transition-shadow duration-200 hover:shadow-md"
              >
                <option value="todos">Mes</option>
                <option v-for="(mes, index) in mesesDelAño" :key="index" :value="index">
                  {{ mes }}
                </option>
              </select>
              <select
                id="filtro-anio"
                v-model="filtroAnio"
                class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm transition-shadow duration-200 hover:shadow-md"
              >
                <option value="todos">Año</option>
                <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
                  {{ anio }}
                </option>
              </select>
            </div>
          </div>

          <div v-for="(categoriaData, valor) in eventosPorCategoria" :key="valor" class="mb-4">
            <!-- Cabecera por categoría -->
            <div
              class="p-2 rounded-lg border mb-2 cursor-pointer transition-all duration-200"
              :style="{
                backgroundColor: categoriaData.color + '20',
                borderColor: categoriaData.color,
              }"
              @click="toggleCategoria(valor)"
            >
              <div class="flex justify-between items-center">
                <h5 class="font-medium" :style="{ color: categoriaData.color }">
                  {{ categoriaData.nombre }} ({{ categoriaData.eventos.length }})
                </h5>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 transition-transform duration-300"
                  :class="{ 'transform rotate-180': !categoriasColapsadas[valor] }"
                  :style="{ color: categoriaData.color }"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>

            <!-- Lista de eventos -->
            <div
              v-if="!categoriasColapsadas[valor]"
              class="transition-all duration-500 overflow-hidden"
              :class="{
                'max-h-0 opacity-0': categoriasColapsadas[valor],
                'max-h-full opacity-100': !categoriasColapsadas[valor],
              }"
            >
              <div
                v-for="evento in categoriaData.eventos"
                :key="evento.id"
                class="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all duration-200 mb-2 transform hover:translate-x-1"
              >
                <!-- Barra superior con título y acciones -->
                <div class="flex justify-between items-start mb-2">
                  <div class="flex items-center space-x-2">
                    <div
                      class="w-3 h-3 rounded-full"
                      :style="{ backgroundColor: evento.color }"
                    ></div>
                    <h5 class="font-medium text-gray-800">{{ evento.titulo }}</h5>
                  </div>
                  <div class="flex space-x-1">
                    <button
                      @click="editarEvento(evento, evento.fechaStr)"
                      class="text-gray-500 hover:text-blue-500 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </button>
                    <button
                      @click="confirmarEliminacion(evento.id, fechaStr)"
                      class="text-gray-500 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-all duration-200"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-4 w-4"
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
                    </button>
                  </div>
                </div>

                <!-- Detalles del evento -->
                <div class="pl-5">
                  <!-- Categoría -->
                  <div class="text-sm text-gray-500 flex items-center mb-1">
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
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    {{ obtenerNombreCategoria(evento.categoria) }}
                  </div>

                  <!-- Fecha -->
                  <div class="text-sm text-gray-500 flex items-center mb-1">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {{ formatearFechaCompleta(evento.fechaStr) }}
                  </div>

                  <!-- Hora (si existe) -->
                  <div v-if="evento.hora" class="text-sm text-gray-500 flex items-center mb-1">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {{ formatearHora(evento.hora) }}
                  </div>

                  <!-- Descripción (si existe) -->
                  <div
                    v-if="evento.descripcion"
                    class="mt-2 text-sm text-gray-600 border-t border-gray-100 pt-2"
                  >
                    {{ evento.descripcion }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Botón flotante para mostrar panel -->
    <button
      v-if="!mostrarPanel"
      @click="mostrarPanel = true"
      class="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all duration-300 z-30 flex items-center transform hover:scale-110"
      :class="{ 'animate-pulse': contadorTareas > 0 }"
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
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <span
        class="ml-1 transition-all duration-300"
        :class="{ 'animate-bounce': contadorTareas > 0 }"
        >{{ contadorTareas }}</span
      >
    </button>

    <!-- Modal de confirmación para eliminar tarea -->
    <div
      v-if="mostrarModalConfirmacion"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
      :class="{ 'opacity-100': mostrarModalConfirmacion, 'opacity-0': !mostrarModalConfirmacion }"
      @click.self="cerrarModalConfirmacion"
    >
      <div
        class="bg-white rounded-lg shadow-xl p-6 w-80 transform transition-all duration-300 ease-out origin-center"
        :class="{
          'scale-100 opacity-100 animate-appear': mostrarModalConfirmacion,
          'scale-90 opacity-0': !mostrarModalConfirmacion,
        }"
      >
        <h3 class="text-lg font-bold text-gray-900 mb-4">Confirmar eliminación</h3>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cerrarModalConfirmacion"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-200 transform hover:scale-105"
          >
            Cancelar
          </button>
          <button
            @click="eliminarEventoConfirmado"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200 transform hover:scale-105"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal para confirmar eliminación de tareas del mes -->
    <div
      v-if="mostrarModalBorrarMes"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
      :class="{ 'opacity-100': mostrarModalBorrarMes, 'opacity-0': !mostrarModalBorrarMes }"
      @click.self="cerrarModalBorrarMes"
    >
      <div
        class="bg-white rounded-lg shadow-xl p-6 w-96 transform transition-all duration-300 ease-out origin-center"
        :class="{
          'scale-100 opacity-100 animate-appear': mostrarModalBorrarMes,
          'scale-90 opacity-0': !mostrarModalBorrarMes,
        }"
      >
        <h3 class="text-lg font-bold text-gray-900 mb-4">Confirmar eliminación masiva</h3>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2"
            >Selecciona el mes a borrar</label
          >
          <div class="grid grid-cols-2 gap-4">
            <select
              v-model="mesBorrar"
              class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            >
              <option v-for="(mes, index) in mesesDelAño" :key="index" :value="index">
                {{ mes }}
              </option>
            </select>

            <select
              v-model="anioBorrar"
              class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm"
            >
              <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
                {{ anio }}
              </option>
            </select>
          </div>
        </div>

        <p class="text-red-600 font-medium mb-6">
          ¿Estás seguro de que deseas eliminar TODAS las tareas de {{ mesesDelAño[mesBorrar] }}
          {{ anioBorrar }}? Esta acción no se puede deshacer.
        </p>

        <div class="flex justify-end space-x-3">
          <button
            @click="cerrarModalBorrarMes"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            @click="eliminarTareasMes"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
          >
            Eliminar tareas
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
  },
  data() {
    return {
      mostrarPanel: false,
      filtroMes: "todos",
      filtroAnio: "todos",
      mostrarModalConfirmacion: false,
      mostrarModalBorrarMes: false,
      eventoEliminarId: null,
      fechaEliminar: null,
      mesBorrar: new Date().getMonth(),
      anioBorrar: new Date().getFullYear(),
      mesesDelAño: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
      ],
      categoriasColapsadas: {},
    };
  },
  computed: {
    contadorTareas() {
      let contador = 0;
      Object.values(this.eventos).forEach((eventosArray) => {
        contador += eventosArray.length;
      });
      return contador;
    },
    tieneTareas() {
      return this.contadorTareas > 0;
    },
    aniosDisponibles() {
      const anios = new Set();
      // Añadir el año actual si no hay eventos
      anios.add(new Date().getFullYear());

      Object.keys(this.eventos).forEach((fecha) => {
        const anio = parseInt(fecha.split("-")[0]);
        anios.add(anio);
      });
      return [...anios].sort();
    },
    eventosFiltrados() {
      const resultado = {};

      Object.entries(this.eventos).forEach(([fecha, eventos]) => {
        const [anio, mes] = fecha.split("-").map(Number);

        // Aplicar filtros
        if (
          (this.filtroAnio === "todos" || parseInt(this.filtroAnio) === anio) &&
          (this.filtroMes === "todos" || parseInt(this.filtroMes) === mes - 1)
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
    },
    eventosPorCategoria() {
      const agrupados = {};
      // Inicializamos con categorías definidas
      this.categorias.forEach((cat) => {
        agrupados[cat.valor] = {
          nombre: cat.nombre,
          color: cat.color,
          eventos: [],
        };
      });

      // Recorremos el objeto eventos correctamente
      Object.entries(this.eventosFiltrados).forEach(([fecha, eventosEnFecha]) => {
        // Para cada fecha, recorremos su array de eventos
        eventosEnFecha.forEach((evento) => {
          // Agregamos información de fecha al evento para referencia
          const eventoConFecha = {
            ...evento,
            fechaStr: fecha,
          };

          // Verificamos si la categoría ya está inicializada
          if (!agrupados[evento.categoria]) {
            // Si la categoría no está en la lista, la añadimos
            agrupados[evento.categoria] = {
              nombre: this.obtenerNombreCategoria(evento.categoria),
              color: evento.color || "#ccc", // usamos el color del evento o uno por defecto
              eventos: [],
            };
          }

          // Añadimos el evento a su categoría
          agrupados[evento.categoria].eventos.push(eventoConFecha);
        });
      });

      return Object.fromEntries(
        Object.entries(agrupados).filter(([, data]) => data.eventos.length > 0)
      );
    },
  },
  methods: {
    cerrarPanel() {
      this.mostrarPanel = false;
    },
    cerrarModalConfirmacion() {
      this.mostrarModalConfirmacion = false;
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
    formatFecha(fecha) {
      if (!fecha) return "";

      const año = fecha.getFullYear();
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const dia = String(fecha.getDate()).padStart(2, "0");
      return `${año}-${mes}-${dia}`;
    },
    formatearFechaCompleta(fechaStr) {
      const [anio, mes, dia] = fechaStr.split("-");
      const fecha = new Date(anio, mes - 1, dia);

      return fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    },
    abrirModalAgendar() {
      this.$emit("abrir-modal-tarea", this.diaSeleccionado || new Date());
    },
    editarEvento(evento, fechaStr) {
      // Crear objeto fecha a partir del string
      const [anio, mes, dia] = fechaStr.split("-");
      const fecha = new Date(anio, mes - 1, dia);

      // Asegurar que el evento tenga la propiedad fecha
      const eventoCompleto = {
        ...evento,
        fecha: fecha,
      };

      this.$emit("editar-evento", eventoCompleto);
    },
    confirmarEliminacion(id, fecha) {
      this.eventoEliminarId = id;
      this.fechaEliminar = fecha;
      this.mostrarModalConfirmacion = true;
    },
    eliminarEventoConfirmado() {
      this.$emit("eliminar-evento", this.eventoEliminarId, this.fechaEliminar);
      this.mostrarToast("Tarea eliminada correctamente", "success");
      this.mostrarModalConfirmacion = false;
      this.eventoEliminarId = null;
      this.fechaEliminar = null;
    },
    eliminarTareasMes() {
      // Crear evento para borrar todas las tareas del mes seleccionado
      const mesStr = String(this.mesBorrar + 1).padStart(2, "0");

      // Obtener todas las fechas que pertenecen al mes y año seleccionados
      const fechasAEliminar = Object.keys(this.eventos).filter((fecha) => {
        const [anio, mes] = fecha.split("-");
        return parseInt(anio) === this.anioBorrar && mes === mesStr;
      });

      if (fechasAEliminar.length > 0) {
        // Emitir evento con las fechas a eliminar
        this.$emit("eliminar-tareas-mes", fechasAEliminar);
        this.mostrarToast(
          `Tareas del mes ${this.mesesDelAño[this.mesBorrar]} ${this.anioBorrar} eliminadas`,
          "success"
        );
      } else {
        this.mostrarToast(
          `No hay tareas para eliminar en ${this.mesesDelAño[this.mesBorrar]} ${this.anioBorrar}`,
          "info"
        );
      }

      this.cerrarModalBorrarMes();
    },
    obtenerNombreCategoria(categoriaValor) {
      const categoriaEncontrada = this.categorias.find((cat) => cat.valor === categoriaValor);
      return categoriaEncontrada ? categoriaEncontrada.nombre : categoriaValor;
    },

    formatearHora(hora) {
      if (!hora) return "";

      try {
        const [horas, minutos] = hora.split(":");
        return `${horas}:${minutos}`;
      } catch {
        return hora;
      }
    },
    mostrarToast(mensaje, tipo) {
      this.$emit("mostrar-toast", mensaje, tipo);
    },
    inicializarEstadoColapso() {
      // Asegurarnos de que las categorías existentes estén representadas
      this.categorias.forEach((cat) => {
        // Si no existe la categoría en categoriasColapsadas, inicializarla como no colapsada
        if (this.categoriasColapsadas[cat.valor] === undefined) {
          this.categoriasColapsadas[cat.valor] = false;
        }
      });
    },
    toggleCategoria(categoriaId) {
      // Si la categoría no existe en el objeto, inicializarla
      if (this.categoriasColapsadas[categoriaId] === undefined) {
        this.categoriasColapsadas[categoriaId] = false;
      }
      // Invertir el estado actual
      this.categoriasColapsadas[categoriaId] = !this.categoriasColapsadas[categoriaId];
    },
  },
  watch: {
    // Observar cambios en las categorías para actualizar el estado de colapso
    categorias: {
      handler() {
        this.inicializarEstadoColapso();
      },
      deep: true,
    },
  },
  created() {
    this.inicializarEstadoColapso();
  },
};
</script>

<style>
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
</style>
