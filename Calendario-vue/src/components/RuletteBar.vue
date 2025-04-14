<template>
  <div>
    <!-- Modal para la ruleta -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4"
      :class="{ 'opacity-100': mostrarModal, 'opacity-0': !mostrarModal }"
      @click.self="cerrarModal"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <!-- Contenedor del modal -->
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-4xl transform overflow-hidden max-h-[90vh] overflow-y-auto"
        :class="{ 'animate-modal-appear': mostrarModal }"
      >
        <!-- Cabecera del modal -->
        <div
          class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-10"
        >
          <h3 id="modal-title" class="text-base sm:text-lg font-bold">Ruleta de asignación</h3>
          <button
            @click="cerrarModal"
            class="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-500 rounded-full p-1"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 sm:h-6 sm:w-6"
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

        <!-- Cuerpo del modal -->
        <div class="p-4 sm:p-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Panel izquierdo: Ruleta y controles -->
            <div class="flex flex-col items-center">
              <!-- Contenedor de la ruleta con flecha indicadora -->
              <div class="relative mb-6">
                <!-- Flecha indicadora -->
                <div class="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="40"
                    viewBox="0 0 30 40"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M15 40L0 25H30L15 40Z" fill="#e74c3c" />
                  </svg>
                </div>

                <!-- Ruleta mejorada usando SVG -->
                <div
                  ref="ruletaContainer"
                  class="w-52 h-52 sm:w-64 sm:h-64 rounded-full border-4 border-gray-200 shadow-lg overflow-hidden relative flex items-center justify-center"
                >
                  <svg
                    v-if="personasDisponibles.length > 0"
                    ref="ruleta"
                    class="w-full h-full"
                    viewBox="-100 -100 200 200"
                    role="img"
                    aria-label="Ruleta de asignación con sectores para cada participante"
                    :style="{ transition: 'transform 3s cubic-bezier(0.17, 0.67, 0.83, 0.67)' }"
                  >
                    <!-- Crear sectores de la ruleta -->
                    <g v-for="(persona, index) in personasDisponibles" :key="persona.id">
                      <path
                        :d="crearSectorPath(index)"
                        :fill="persona.color"
                        stroke="#fff"
                        stroke-width="1"
                        :aria-label="`Sector para ${persona.nombre}`"
                      />
                      <!-- Mostrar nombres de participantes -->
                      <text
                        :transform="`rotate(${
                          index * (360 / personasDisponibles.length) +
                          360 / personasDisponibles.length / 2
                        }) translate(0, -60) rotate(${
                          index * (360 / personasDisponibles.length) +
                            360 / personasDisponibles.length / 2 >
                          180
                            ? 180
                            : 0
                        })`"
                        text-anchor="middle"
                        :fill="getContrastYIQ(persona.color)"
                        font-size="10"
                        font-weight="bold"
                        class="drop-shadow-lg"
                        style="pointer-events: none"
                      >
                        {{
                          persona.nombre.length > 10
                            ? persona.nombre.substring(0, 8) + "..."
                            : persona.nombre
                        }}
                      </text>
                    </g>

                    <!-- Círculo central -->
                    <circle cx="0" cy="0" r="3" fill="white" stroke="#cccccc" stroke-width="1" />
                  </svg>

                  <!-- Mostrar mensaje cuando no hay personas -->
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 rounded-full"
                  >
                    No hay personas disponibles
                  </div>
                </div>
              </div>

              <!-- Botón para girar -->
              <button
                @click="girarRuleta"
                class="px-4 sm:px-6 py-2 sm:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base flex items-center"
                :disabled="girando || personasDisponibles.length < 2"
                :aria-busy="girando ? 'true' : 'false'"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 sm:h-5 sm:w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                {{ girando ? "Girando..." : "Girar ruleta" }}
              </button>

              <!-- Resultado de la selección -->
              <div
                v-if="personaSeleccionada"
                class="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-sm sm:text-base"
                role="status"
                aria-live="polite"
              >
                <h4 class="font-bold text-green-800 mb-1 sm:mb-2">¡Persona seleccionada!</h4>
                <p class="text-green-700">
                  <span class="font-medium">{{ personaSeleccionada }}</span> debe sacar la basura el
                  día
                  <span class="font-medium">{{ fechaFormateada }}</span>
                </p>
              </div>
            </div>

            <!-- Panel derecho: Gestión y lista de personas -->
            <div>
              <div
                class="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 mb-4 text-xs sm:text-sm"
              >
                <h4 class="font-medium text-gray-700 mb-2">Instrucciones:</h4>
                <ol class="list-decimal pl-5 space-y-1">
                  <li class="text-gray-600">Agrega personas para participar en la asignación.</li>
                  <li class="text-gray-600">Gira la ruleta para seleccionar una persona.</li>
                  <li class="text-gray-600">
                    La persona seleccionada se eliminará de la ruleta hasta que todos hayan sido
                    asignados.
                  </li>
                </ol>
              </div>

              <!-- Selección de fecha -->
              <div class="mb-4">
                <label
                  for="fecha-asignacion"
                  class="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >Fecha de asignación:</label
                >
                <input
                  id="fecha-asignacion"
                  v-model="fechaAsignacion"
                  type="date"
                  class="w-full px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  :min="obtenerFechaActual()"
                  @keydown.enter="agregarPersona"
                />
              </div>

              <!-- Formulario para agregar persona -->
              <div class="mb-4">
                <label
                  for="nueva-persona"
                  class="block text-xs sm:text-sm font-medium text-gray-700 mb-1"
                  >Agregar persona:</label
                >
                <div class="flex items-center space-x-2">
                  <input
                    id="nueva-persona"
                    v-model="nuevaPersona"
                    type="text"
                    placeholder="Nombre de la persona"
                    class="flex-1 px-2 sm:px-3 py-1 sm:py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                    @keyup.enter="agregarPersona"
                  />
                  <button
                    @click="agregarPersona"
                    class="px-2 sm:px-4 py-1 sm:py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-xs sm:text-sm"
                    :disabled="!nuevaPersona.trim()"
                    title="Agregar persona a la ruleta"
                  >
                    Agregar
                  </button>
                </div>
                <p v-if="errorMensaje" class="mt-1 text-xs text-red-500">{{ errorMensaje }}</p>
              </div>

              <!-- Lista de personas disponibles - Mejorada visualmente -->
              <div class="justify-between items-center mb-3">
                <div class="flex">
                <h4 class="font-medium text-xs sm:text-sm text-gray-700 mr-auto">
                  Personas disponibles:
                </h4>
                <button
                    v-if="personasDisponibles.length > 0 || asignaciones.length > 0"
                    @click="limpiarPersonas"
                    class="text-sm text-red-500 hover:text-red-700 flex items-center ml-auto"
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
                    Limpiar
                  </button>
                </div>
                <div class="w-full bg-gray-50 rounded-lg p-2 mb-2 min-h-16"
                 v-if="personasDisponibles.length > 0 || asignaciones.length > 0">
                  <div
                    class="flex flex-wrap gap-2"
                    role="list"
                    aria-label="Lista de personas disponibles para asignación"
                  >
                    <span
                      v-for="(persona, index) in personasDisponibles"
                      :key="persona.id"
                      class="flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
                      :style="{
                        'background-color': persona.color,
                        color: getContrastYIQ(persona.color),
                      }"
                      role="listitem"
                    >
                      {{ persona.nombre }}
                      <button
                        @click="confirmarEliminarPersona(index)"
                        class="ml-2 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full p-0.5"
                        :style="{ color: getContrastYIQ(persona.color) }"
                        :aria-label="`Eliminar a ${persona.nombre}`"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          class="h-3 w-3 sm:h-4 sm:w-4"
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
                    </span>
                  </div>
                  <div
                    v-if="personasDisponibles.length === 0"
                    class="p-2 sm:p-4 text-center text-gray-500 bg-gray-100 rounded-lg border border-dashed border-gray-300 text-xs sm:text-sm mt-2"
                    role="status"
                  >
                    No hay personas disponibles
                  </div>
                </div>
              </div>

              <!-- Lista de asignaciones -->
              <div>
                <div class="flex ">
                <h4 class="font-medium text-xs sm:text-sm text-gray-700 mb-1 sm:mb-2">
                  Asignaciones realizadas:
                </h4>
                <button
                    v-if="asignaciones.length > 0"
                    @click="limpiarAsignaciones"
                    class="text-sm text-red-500 hover:text-red-700 flex items-center ml-auto"
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
                    Limpiar
                  </button>
              </div>
                <div
                  v-if="asignaciones.length > 0"
                  class="max-h-32 sm:max-h-40 overflow-y-auto pr-2 space-y-1 sm:space-y-2"
                  role="list"
                  aria-label="Lista de asignaciones realizadas"
                >
                  <div
                    v-for="(asignacion, index) in asignaciones"
                    :key="index"
                    class="flex items-center justify-between p-1 sm:p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-xs sm:text-sm"
                    role="listitem"
                  >
                    <div class="flex items-center">
                      <div
                        class="w-3 h-3 sm:w-4 sm:h-4 rounded-full mr-2"
                        :style="{ 'background-color': asignacion.color }"
                        aria-hidden="true"
                      ></div>
                      <span class="font-medium">{{ asignacion.persona }}</span>
                      <span class="text-gray-500 text-xs ml-1 sm:ml-2">{{
                        formatearFecha(asignacion.fecha)
                      }}</span>
                    </div>
                    <button
                      @click="confirmarEliminarAsignacion(index)"
                      class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                      :aria-label="`Eliminar asignación de ${asignacion.persona}`"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-3 w-3 sm:h-4 sm:w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
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
                </div>
                <div
                  v-else
                  class="p-2 sm:p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-xs sm:text-sm"
                  role="status"
                >
                  No hay asignaciones
                </div>
              </div>

              <!-- Botón para guardar asignaciones -->
              <div class="mt-4 sm:mt-6">
                <button
                  @click="guardarAsignaciones"
                  class="w-full px-3 sm:px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm flex items-center justify-center"
                  :disabled="asignaciones.length === 0"
                  :title="
                    asignaciones.length === 0
                      ? 'Necesitas crear asignaciones primero'
                      : 'Guardar asignaciones en el calendario'
                  "
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Guardar en calendario
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
    >
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 class="text-lg font-bold text-gray-900 mb-4">{{ confirmTitle }}</h3>
        <p class="text-gray-700 mb-6">{{ confirmMessage }}</p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelConfirmation"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancelar
          </button>
          <button
            @click="confirmAction"
            class="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "RuletteBar",
  props: {
    mostrarModal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      personasDisponibles: [],
      personasOriginales: [], // Copia para restablecer al finalizar
      nuevaPersona: "",
      girando: false,
      anguloActual: 0,
      personaSeleccionada: null,
      fechaAsignacion: this.obtenerFechaActual(),
      asignaciones: [],
      errorMensaje: "",
      colores: this.generarColoresArmonicos(20),

      // Datos para el modal de confirmación
      showConfirmModal: false,
      confirmTitle: "",
      confirmMessage: "",
      confirmCallback: null,
    };
  },
  computed: {
    fechaFormateada() {
      if (!this.fechaAsignacion) return "";

      const [year, month, day] = this.fechaAsignacion.split("-").map(Number);
      const fecha = new Date(year, month - 1, day); // Mes es base 0 en JavaScript

      return fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
  created() {
    // Cargar datos guardados en localStorage si existen
    this.cargarDatosGuardados();
  },
  methods: {
    cerrarModal() {
      console.log("RuletteBar: Emitiendo evento cerrar");
      this.$emit("cerrar");
    },

    generarColoresArmonicos(cantidad) {
      const colores = [];
      const paso = 360 / cantidad;

      for (let i = 0; i < cantidad; i++) {
        const h = (i * paso) % 360;
        const s = 70 + Math.random() * 20;
        const l = 40 + Math.random() * 20;

        colores.push(`hsl(${h}, ${s}%, ${l}%)`);
      }

      return colores;
    },

    agregarPersona() {
      if (!this.nuevaPersona.trim()) {
        return;
      }

      // Verificar si la persona ya existe
      const nombreNormalizado = this.nuevaPersona.trim().toLowerCase();
      const personaExistente = this.personasDisponibles.find(
        (p) => p.nombre.toLowerCase() === nombreNormalizado
      );

      if (personaExistente) {
        this.errorMensaje = "Esta persona ya está en la lista";
        return;
      }

      this.errorMensaje = "";
      const colorIndex = this.personasDisponibles.length % this.colores.length;
      const nuevaPersona = {
        id: Date.now(),
        nombre: this.nuevaPersona.trim(),
        color: this.colores[colorIndex],
      };

      this.personasDisponibles.push(nuevaPersona);
      this.personasOriginales.push({ ...nuevaPersona }); // Guardar copia
      this.nuevaPersona = "";

      // Guardar en localStorage
      this.guardarEnLocalStorage();
    },

    confirmarEliminarPersona(index) {
      const persona = this.personasDisponibles[index];
      this.confirmTitle = "Eliminar persona";
      this.confirmMessage = `¿Estás seguro de que deseas eliminar a ${persona.nombre} de la lista?`;
      this.confirmCallback = () => this.eliminarPersona(index);
      this.showConfirmModal = true;
    },

    eliminarPersona(index) {
      this.personasDisponibles.splice(index, 1);

      // Actualizar colores para mantener consistencia
      this.personasDisponibles.forEach((persona, i) => {
        persona.color = this.colores[i % this.colores.length];
      });

      // Actualizar también personasOriginales para mantener sincronización
      this.actualizarPersonasOriginales();

      // Guardar cambios en localStorage
      this.guardarEnLocalStorage();
    },

    actualizarPersonasOriginales() {
      // Recrear personasOriginales basado en el estado actual
      this.personasOriginales = this.personasDisponibles.map((p) => ({ ...p }));
    },

    limpiarPersonas() {
      this.personasDisponibles = [];
      this.actualizarPersonasOriginales();
      this.guardarEnLocalStorage();
    },

    limpiarAsignaciones(){
      this.asignaciones = [];
    },

    crearSectorPath(index) {
      const total = this.personasDisponibles.length;
      if (total === 0) return "";

      const angle = 360 / total;
      const startAngle = index * angle - 90; // -90 para comenzar desde arriba
      const endAngle = (index + 1) * angle - 90;

      // Convertir a radianes
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;

      // Coordenadas de puntos
      const largeArcFlag = angle <= 180 ? 0 : 1;
      const startX = 95 * Math.cos(startRad);
      const startY = 95 * Math.sin(startRad);
      const endX = 95 * Math.cos(endRad);
      const endY = 95 * Math.sin(endRad);

      // Crear el path de sector
      return `M 0 0 L ${startX} ${startY} A 95 95 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
    },

    girarRuleta() {
      if (this.girando || this.personasDisponibles.length < 2) return;

      this.girando = true;
      this.personaSeleccionada = null;

      // Configuración de la animación
      const vueltasMinimas = 3; // Mínimo de vueltas completas
      const vueltasMaximas = 5; // Máximo de vueltas completas
      const vueltas =
        vueltasMinimas + Math.floor(Math.random() * (vueltasMaximas - vueltasMinimas + 1));
      const anguloPorPersona = 360 / this.personasDisponibles.length;

      // Seleccionar aleatoriamente una persona (índice)
      const indiceSeleccionado = Math.floor(Math.random() * this.personasDisponibles.length);

      // Calcular el ángulo final exacto para que la flecha apunte a la persona seleccionada
      const anguloFinalPosicion =
        360 - (indiceSeleccionado * anguloPorPersona + anguloPorPersona / 2);
      const nuevoAngulo = this.anguloActual + vueltas * 360 + anguloFinalPosicion;

      // Aplicar la animación con easing más realista
      const ruleta = this.$refs.ruleta;
      if (ruleta) {
        ruleta.style.transition = "transform 4s cubic-bezier(0.2, 0.8, 0.3, 1)";
        ruleta.style.transform = `rotate(${nuevoAngulo}deg)`;
        this.anguloActual = nuevoAngulo % 360;

        // Determinar la persona seleccionada
        setTimeout(() => {
          this.personaSeleccionada = this.personasDisponibles[indiceSeleccionado].nombre;
          this.finalizarGiro(indiceSeleccionado);
          this.girando = false;
        }, 4000);
      }
    },

    finalizarGiro(indice) {
      // Agregar a las asignaciones
      if (this.fechaAsignacion) {
        const persona = this.personasDisponibles[indice];

        const [year, month, day] = this.fechaAsignacion.split("-").map(Number);
        const fechaCorrecta = new Date(year, month - 1, day);

        this.asignaciones.push({
          persona: persona.nombre,
          fecha: fechaCorrecta,
          color: persona.color,
        });

        // Eliminar de las personas disponibles
        this.personasDisponibles.splice(indice, 1);
        this.guardarEnLocalStorage();

        // Verificar si se deben reiniciar las personas
        if (this.personasDisponibles.length === 0) {
          setTimeout(() => {
            this.mostrarConfirmacionReinicio();
          }, 1000);
        }
      }
    },

    determinarPersonaSeleccionada() {
      if (this.personasDisponibles.length === 0) return;

      // El ángulo normalizado (0-360) determina quién fue seleccionado
      const anguloPorSeccion = 360 / this.personasDisponibles.length;
      const anguloNormalizado = ((this.anguloActual % 360) + 360) % 360; // Asegurar que sea positivo

      // La flecha apunta hacia arriba (0 grados), pero la ruleta gira, así que el índice:
      // Nota: Restamos de 360 porque la ruleta gira en sentido horario, pero el punto de referencia es hacia arriba
      const indiceSeleccionado =
        Math.floor((360 - anguloNormalizado) / anguloPorSeccion) % this.personasDisponibles.length;

      // Guardar la persona seleccionada
      const persona = this.personasDisponibles[indiceSeleccionado];
      this.personaSeleccionada = persona.nombre;

      // Agregar a las asignaciones
      if (this.fechaAsignacion) {
        const [year, month, day] = this.fechaAsignacion.split("-").map(Number);
        const fechaCorrecta = new Date(year, month - 1, day); // Mes es base 0 en JavaScript

        this.asignaciones.push({
          persona: persona.nombre,
          fecha: fechaCorrecta,
          color: persona.color,
        });

        // Eliminar de las personas disponibles
        this.personasDisponibles.splice(indiceSeleccionado, 1);

        // Guardar en localStorage
        this.guardarEnLocalStorage();

        // Si ya no hay personas disponibles, preguntar si quiere reiniciar
        if (this.personasDisponibles.length === 0) {
          setTimeout(() => {
            this.confirmTitle = "Reiniciar participantes";
            this.confirmMessage =
              "Ya se han asignado todas las personas. ¿Desea reiniciar la lista para nuevas asignaciones?";
            this.confirmCallback = this.reiniciarPersonas;
            this.showConfirmModal = true;
          }, 500);
        }
      }
    },

    reiniciarPersonas() {
      // Restaurar la lista original de personas
      this.personasDisponibles = this.personasOriginales.map((p) => ({ ...p }));

      // Guardar en localStorage
      this.guardarEnLocalStorage();
    },

    confirmarEliminarAsignacion(index) {
      const asignacion = this.asignaciones[index];
      this.confirmTitle = "Eliminar asignación";
      this.confirmMessage = `¿Estás seguro de que deseas eliminar la asignación de ${asignacion.persona}?`;
      this.confirmCallback = () => this.eliminarAsignacion(index);
      this.showConfirmModal = true;
    },

    eliminarAsignacion(index) {
      // Recuperar la persona de la asignación y agregarla a disponibles
      const asignacion = this.asignaciones[index];

      // Verificar si la persona ya está en disponibles
      const personaExistente = this.personasDisponibles.find(
        (p) => p.nombre === asignacion.persona
      );

      if (!personaExistente) {
        // Buscar en la lista original para mantener el mismo ID
        const original = this.personasOriginales.find((p) => p.nombre === asignacion.persona);

        if (original) {
          this.personasDisponibles.push({ ...original });
        } else {
          // Si no se encuentra en la lista original, crear una nueva entrada
          this.personasDisponibles.push({
            id: Date.now(),
            nombre: asignacion.persona,
            color: asignacion.color,
          });
        }
      }

      // Eliminar la asignación
      this.asignaciones.splice(index, 1);

      // Guardar en localStorage
      this.guardarEnLocalStorage();
    },

    guardarAsignaciones() {
      if (this.asignaciones.length === 0) return;

      // Crear eventos para cada asignación
      const eventos = this.asignaciones.map((asignacion) => {
        const fecha = new Date(asignacion.fecha);
        return {
          titulo: `Sacar basura: ${asignacion.persona}`,
          fecha: fecha,
          categoria: "basura",
          descripcion: `Tarea asignada por ruleta a ${asignacion.persona}`,
          hora: "18:00",
          id: Date.now() + Math.random().toString(36).substr(2, 9), // ID único
          color: asignacion.color,
        };
      });

      console.log("RuletteBar: Emitiendo guardar-asignaciones con", eventos.length, "eventos");
      // Emitir evento para guardar en el calendario principal
      this.$emit("guardar-asignaciones", eventos);
      this.cerrarModal();
    },

    formatearFecha(fecha) {
      return fecha.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
    },

    obtenerFechaActual() {
      const hoy = new Date();
      const anio = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, "0");
      const dia = String(hoy.getDate()).padStart(2, "0");
      return `${anio}-${mes}-${dia}`;
    },

    // Función para determinar si el texto debe ser blanco o negro según el fondo
    getContrastYIQ(hexcolor) {
      // Si el color no tiene formato "#rrggbb", devolver negro por defecto
      if (!hexcolor || typeof hexcolor !== "string" || !hexcolor.startsWith("#")) {
        return "#000";
      }

      // Expandir formato corto (#RGB) a completo (#RRGGBB)
      let hex = hexcolor.slice(1);
      if (hex.length === 3) {
        hex = hex
          .split("")
          .map((x) => x + x)
          .join("");
      }

      // Validar que sea un color hexadecimal válido
      if (hex.length !== 6 || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return "#000";
      }

      // Convertir a valores RGB
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      // Calcular luminosidad según fórmula WCAG
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Usar umbral adaptativo para mejor legibilidad
      return luminance > 0.6 ? "#000000" : "#FFFFFF";
    },

    // Manejo del modal de confirmación
    confirmAction() {
      if (typeof this.confirmCallback === "function") {
        this.confirmCallback();
      }
      this.showConfirmModal = false;
    },

    cancelConfirmation() {
      this.showConfirmModal = false;
    },

    // Persistencia con localStorage
    guardarEnLocalStorage() {
      try {
        localStorage.setItem("ruletaPersonasDisponibles", JSON.stringify(this.personasDisponibles));
        localStorage.setItem("ruletaPersonasOriginales", JSON.stringify(this.personasOriginales));
        localStorage.setItem(
          "ruletaAsignaciones",
          JSON.stringify(
            this.asignaciones.map((a) => {
              return {
                ...a,
                fecha: a.fecha.toISOString(), // Convertir Date a string para almacenar
              };
            })
          )
        );
        console.log("Datos guardados en localStorage");
      } catch (error) {
        console.error("Error al guardar en localStorage:", error);
      }
    },

    cargarDatosGuardados() {
      try {
        // Recuperar personas disponibles
        const personasGuardadas = localStorage.getItem("ruletaPersonasDisponibles");
        if (personasGuardadas) {
          this.personasDisponibles = JSON.parse(personasGuardadas);
        }

        // Recuperar personas originales
        const personasOriginalesGuardadas = localStorage.getItem("ruletaPersonasOriginales");
        if (personasOriginalesGuardadas) {
          this.personasOriginales = JSON.parse(personasOriginalesGuardadas);
        }

        // Recuperar asignaciones
        const asignacionesGuardadas = localStorage.getItem("ruletaAsignaciones");
        if (asignacionesGuardadas) {
          this.asignaciones = JSON.parse(asignacionesGuardadas).map((a) => {
            // Convertir string a Date pero asegurando que la fecha sea correcta
            const fecha = new Date(a.fecha);
            // Corregir el problema de zona horaria si es necesario
            fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());

            return {
              ...a,
              fecha: fecha,
            };
          });
        }

        console.log("Datos cargados desde localStorage");
      } catch (error) {
        console.error("Error al cargar datos desde localStorage:", error);
        // Si hay error, inicializar con valores por defecto
        this.personasDisponibles = [];
        this.personasOriginales = [];
        this.asignaciones = [];
      }
    },
  },
};
</script>

<style scoped>
@keyframes modal-appear {
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

.animate-modal-appear {
  animation: modal-appear 0.3s ease-out forwards;
}

/* Estilos responsivos adicionales */
@media (max-width: 640px) {
  .max-h-40 {
    max-height: 10rem;
  }
}

/* Agregar estilos para la ruleta */
.drop-shadow-lg {
  filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07)) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06));
}

/* Clase para ayudar con la navegación por teclado */
:focus-visible {
  outline: 2px solid #6366f1;
  outline-offset: 2px;
}

/* Agregar al estilo scoped */
.ruleta-container {
  position: relative;
  width: 260px;
  height: 260px;
  margin: 0 auto;
}

.ruleta-svg {
  width: 100%;
  height: 100%;
  transition: transform 4s cubic-bezier(0.2, 0.8, 0.3, 1);
  transform-origin: center;
}

.flecha-indicadora {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.sector-texto {
  pointer-events: none;
  user-select: none;
  transition: all 0.3s ease;
}

/* Animación de giro */
@keyframes spin {
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(var(--rotation-end));
  }
}

.girando {
  animation: spin 4s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
}
</style>
