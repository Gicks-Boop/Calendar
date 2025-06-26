<template>
  <div>
    <!-- Modal para la ruleta -->
    <div
      v-if="mostrarRuleta"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4"
      :class="{ 'opacity-100': mostrarRuleta, 'opacity-0': !mostrarRuleta }"
      @click.self="cerrarModal"
      role="dialog"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <!-- Contenedor del modal -->
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-4xl transform overflow-hidden max-h-[90vh] overflow-y-auto"
        :class="{ 'animate-modal-appear': mostrarRuleta }"
      >
        <!-- Cabecera del modal -->
        <div
          class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-10"
        >
          <div>
            <h3 id="modal-title" class="text-base sm:text-lg font-bold">Ruleta de asignación de tareas</h3>
            <p class="text-sm opacity-90">{{ oficinaActual?.nombre || 'Oficina actual' }}</p>
          </div>
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
          <!-- Explicación -->
          <div class="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p class="text-gray-700 text-xs sm:text-sm">
              Usa la ruleta para asignar tareas de forma aleatoria entre los usuarios de tu oficina.
              Agrega participantes, selecciona la fecha y gira la ruleta para crear eventos en el calendario.
            </p>
          </div>

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

              <!-- Botón para girar con información adicional -->
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

              <!-- Información de estado -->
              <div v-if="contadorGiros > 0" class="mt-2 text-xs text-center text-gray-600">
                Giros realizados: {{ contadorGiros }}
              </div>

              <!-- Botón de reset rápido -->
              <button
                v-if="contadorGiros > 0 && !girando"
                @click="reiniciarPersonas"
                class="mt-2 px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition duration-200"
              >
                Resetear ruleta
              </button>

              <!-- Resultado de la selección mejorado -->
              <div
                v-if="personaSeleccionada"
                class="mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg text-sm sm:text-base"
                role="status"
                aria-live="polite"
              >
                <h4 class="font-bold text-green-800 mb-1 sm:mb-2">¡Persona seleccionada!</h4>
                <p class="text-green-700">
                  <span class="font-medium">{{ personaSeleccionada }}</span> 
                  {{ ultimaAsignacionFueDirecta ? 'fue asignado(a) para el' : 'debe sacar la basura el' }} 
                  día <span class="font-medium">{{ 
                    ultimaAsignacionFueDirecta && asignaciones.length > 0 ? 
                    formatearFecha(asignaciones[asignaciones.length - 1].fecha) : 
                    fechaFormateada 
                  }}</span>
                </p>
                <div v-if="ultimaAsignacionFueDirecta" class="mt-2 text-xs text-green-600 italic">
                  * Asignación manual (última persona disponible)
                </div>
              </div>
            </div>

            <!-- Panel derecho: Gestión y lista de personas -->
            <div>
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

              <!-- Sección para cargar usuarios de la oficina -->
              <div class="mb-4">
                <div class="flex justify-between items-center mb-3">
                  <h4 class="font-medium text-xs sm:text-sm text-gray-700">
                    Usuarios de la oficina ({{ usuariosOficina.length }}):
                  </h4>
                  
                  <!-- Botones de selección rápida -->
                  <div class="flex space-x-2">
                    <button
                      @click="cargarUsuariosDeOficina"
                      class="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                      :disabled="cargandoUsuarios"
                    >
                      {{ cargandoUsuarios ? 'Cargando...' : 'Cargar usuarios' }}
                    </button>
                    <button
                      @click="agregarTodosUsuarios"
                      class="text-sm text-green-600 hover:text-green-800 px-2 py-1 rounded"
                      :disabled="cargandoUsuarios || usuariosOficina.length === 0"
                    >
                      Agregar todos
                    </button>
                  </div>
                </div>

                <!-- Loading de usuarios -->
                <div v-if="cargandoUsuarios" class="text-center py-4">
                  <svg class="animate-spin h-6 w-6 mx-auto text-purple-500 mb-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p class="text-gray-600 text-sm">Cargando usuarios de la oficina...</p>
                </div>

                <!-- Error al cargar usuarios -->
                <div v-else-if="errorUsuarios" class="text-center py-4">
                  <svg class="h-6 w-6 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-red-600 mb-2 text-sm">Error al cargar usuarios</p>
                  <button 
                    @click="cargarUsuariosDeOficina"
                    class="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Reintentar
                  </button>
                </div>

                <!-- Lista compacta de usuarios cargados -->
                <div v-else-if="usuariosOficina.length > 0" class="bg-gray-50 rounded-lg p-2 max-h-32 overflow-y-auto">
                  <div class="text-xs text-gray-600 mb-1">Usuarios cargados ({{ usuariosOficina.length }}):</div>
                  <div class="flex flex-wrap gap-1">
                    <span
                      v-for="usuario in usuariosOficina"
                      :key="usuario.id"
                      class="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                    >
                      {{ usuario.nombre }} {{ usuario.apellido }}
                    </span>
                  </div>
                </div>
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
                <div
                  class="w-full bg-gray-50 rounded-lg p-2 mb-2 min-h-16"
                  v-if="personasDisponibles.length > 0 || asignaciones.length > 0"
                >
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
                <div class="flex">
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
                      <!-- Indicador de asignación directa -->
                      <span 
                        v-if="asignacion.asignacionDirecta" 
                        class="ml-2 text-xs bg-blue-100 text-blue-600 px-1 rounded"
                        title="Asignación automática"
                      >
                        Auto
                      </span>
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
                  :disabled="asignaciones.length === 0 || guardandoEventos"
                >
                  <svg
                    v-if="guardandoEventos"
                    class="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg
                    v-else
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
                  {{ guardandoEventos ? 'Guardando...' : 'Guardar en calendario' }}
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
            class="px-4 py-2 text-white rounded-md transition-all duration-200 focus:outline-none focus:ring-2"
            :class="{
              'bg-red-500 hover:bg-red-600 focus:ring-red-500': confirmTitle.includes('Eliminar'),
              'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500': confirmTitle.includes('Última persona'),
              'bg-green-500 hover:bg-green-600 focus:ring-green-500': confirmTitle.includes('Reiniciar')
            }"
          >
            {{ 
              confirmTitle.includes('Eliminar') ? 'Eliminar' :
              confirmTitle.includes('Última persona') ? 'Seleccionar fecha' :
              'Confirmar'
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal específico para seleccionar fecha de la última persona -->
    <div
      v-if="mostrarModalFechaUltimaPersona"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] transition-all duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="bg-white rounded-lg shadow-xl p-6 w-96 transform transition-all duration-300 ease-out"
      >
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          Asignar fecha a {{ personasDisponibles.length > 0 ? personasDisponibles[0].nombre : '' }}
        </h3>
        
        <p class="text-gray-600 mb-4">
          Selecciona la fecha en la que 
          <span class="font-medium">{{ personasDisponibles.length > 0 ? personasDisponibles[0].nombre : '' }}</span> 
          debe realizar la tarea de sacar la basura:
        </p>
        
        <div class="mb-6">
          <label for="fecha-ultima-persona" class="block text-sm font-medium text-gray-700 mb-2">
            Fecha de asignación:
          </label>
          <input
            id="fecha-ultima-persona"
            v-model="fechaUltimaPersona"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :min="obtenerFechaActual()"
          />
        </div>
        
        <div class="bg-blue-50 p-3 rounded-lg mb-4">
          <p class="text-sm text-blue-800">
            <strong>Fecha seleccionada:</strong> 
            {{ formatearFechaUltimaPersona() || 'Ninguna fecha seleccionada' }}
          </p>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button
            @click="cancelarAsignacionUltimaPersona"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            @click="asignarUltimaPersonaConFecha"
            class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-all duration-200"
            :disabled="!fechaUltimaPersona"
          >
            Asignar tarea
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import UserService from '@/models/userService';
import EventoService from '@/models/eventoService';
import * as Static from '@/middleware/static';

const userService = new UserService();
const eventoService = new EventoService();

export default {
  name: "RuletteBar",
  props: {
    mostrarRuleta: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // Selector de usuarios
      usuarioSeleccionado: "",
      
      // Usuarios de la oficina (integración con UserService)
      usuariosOficina: [],
      cargandoUsuarios: false,
      errorUsuarios: false,
      
      // Usuario y oficina actual
      usuarioActual: null,
      oficinaActual: null,
      
      // Personas en la ruleta
      personasDisponibles: [],
      personasOriginales: [],
      
      // Estado de la ruleta
      girando: false,
      personaSeleccionada: null,
      contadorGiros: 0, // Para tracking de giros
      
      // Configuración
      fechaAsignacion: this.obtenerFechaActual(),
      fechaUltimaPersona: this.obtenerFechaActual(),
      asignaciones: [],
      guardandoEventos: false,
      errorMensaje: "",
      colores: this.generarColoresArmonicos(20),

      // Datos para el modal de confirmación
      showConfirmModal: false,
      confirmTitle: "",
      confirmMessage: "",
      confirmCallback: null,
      
      // Modal específico para última persona
      mostrarModalFechaUltimaPersona: false,
    };
  },
  computed: {
    fechaFormateada() {
      if (!this.fechaAsignacion) return "";

      const [year, month, day] = this.fechaAsignacion.split("-").map(Number);
      const fecha = new Date(year, month - 1, day);

      return fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    
    usuariosDisponiblesParaAgregar() {
      // Filtrar usuarios que ya no están en la ruleta
      return this.usuariosOficina.filter(usuario => 
        !this.personasDisponibles.some(persona => persona.usuarioId === usuario.id)
      );
    },
    
    ultimaAsignacionFueDirecta() {
      if (this.asignaciones.length === 0) return false;
      const ultimaAsignacion = this.asignaciones[this.asignaciones.length - 1];
      return ultimaAsignacion.asignacionDirecta === true;
    },
    
    fechaFormateadaUltimaPersona() {
      if (!this.fechaUltimaPersona) return "";
      
      const [year, month, day] = this.fechaUltimaPersona.split("-").map(Number);
      const fecha = new Date(year, month - 1, day);
      
      return fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric", 
        month: "long",
        year: "numeric",
      });
    },
  },
  watch: {
    mostrarRuleta: {
      handler(nuevo) {
        if (nuevo) {
          this.inicializar();
        }
      },
      immediate: true
    }
  },
  created() {
    // Cargar datos guardados en localStorage si existen
    this.cargarDatosGuardados();
  },
  methods: {
    async inicializar() {
      this.cargarUsuarioActual();
      // No cargar automáticamente, dejar que el usuario haga clic en "Cargar usuarios"
    },

    cargarUsuarioActual() {
      this.usuarioActual = Static.BM_GET_USER_DATA();
      this.oficinaActual = this.usuarioActual?.oficina;
      console.log('Usuario actual:', this.usuarioActual);
    },

    esUsuarioActual(usuario) {
      return this.usuarioActual && this.usuarioActual.id === usuario.id;
    },

    async cargarUsuariosDeOficina() {
      try {
        this.cargandoUsuarios = true;
        this.errorUsuarios = false;
        
        const response = await userService.getMyOfficeUsers();
        this.usuariosOficina = response.data || response || [];
        
        console.log('Usuarios de oficina cargados:', this.usuariosOficina);
        
      } catch (error) {
        console.error('Error al cargar usuarios de oficina:', error);
        this.errorUsuarios = true;
        this.usuariosOficina = [];
      } finally {
        this.cargandoUsuarios = false;
      }
    },

    agregarTodosUsuarios() {
      if (this.usuariosOficina.length === 0) {
        this.errorMensaje = "Primero debes cargar los usuarios de la oficina";
        return;
      }

      // Limpiar personas existentes para evitar duplicados
      this.personasDisponibles = [];
      this.personasOriginales = [];

      // Agregar todos los usuarios de la oficina
      this.usuariosOficina.forEach((usuario, index) => {
        const colorIndex = index % this.colores.length;
        const persona = {
          id: usuario.id,
          nombre: `${usuario.nombre} ${usuario.apellido}`,
          color: this.colores[colorIndex],
          usuarioId: usuario.id // Guardar referencia al ID del usuario
        };

        this.personasDisponibles.push(persona);
        this.personasOriginales.push({ ...persona });
      });

      this.errorMensaje = "";
      this.guardarEnLocalStorage();
    },

    cerrarModal() {
      // Aplicar animación de salida
      const modalElement = this.$el.querySelector(".bg-white.rounded-lg.shadow-xl");
      if (modalElement) {
        modalElement.classList.remove("animate-modal-appear");
        modalElement.classList.add("animate-modal-disappear");

        // Aplicar fade out al backdrop
        const backdropElement = this.$el.querySelector(".fixed.inset-0");
        if (backdropElement) {
          backdropElement.classList.add("opacity-0");
        }

        // Esperar a que termine la animación antes de cerrar completamente
        setTimeout(() => {
          this.$emit("cerrar");
        }, 200);
      } else {
        this.$emit("cerrar");
      }
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
        usuarioId: null // Persona manual no tiene usuarioId
      };

      this.personasDisponibles.push(nuevaPersona);
      this.personasOriginales.push({ ...nuevaPersona });
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
      
      // Resetear estado de la ruleta
      this.contadorGiros = 0;
      this.personaSeleccionada = null;
      
      // Resetear visualmente la ruleta con animación suave
      const ruleta = this.$refs.ruleta;
      if (ruleta) {
        ruleta.style.transition = "transform 0.5s ease";
        ruleta.style.transform = "rotate(0deg)";
      }
      
      this.guardarEnLocalStorage();
    },

    limpiarAsignaciones() {
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

      const ruleta = this.$refs.ruleta;
      if (!ruleta) return;

      // RESETEAR COMPLETAMENTE la ruleta a 0 grados
      ruleta.style.transition = "none";
      ruleta.style.transform = "rotate(0deg)";
      
      // Forzar reflow para asegurar el reset
      void ruleta.offsetWidth;

      // Seleccionar persona aleatoriamente
      const indiceSeleccionado = Math.floor(Math.random() * this.personasDisponibles.length);
      
      // Configuración de animación completamente nueva cada vez
      const vueltasCompletas = 4 + Math.floor(Math.random() * 4); // 4-7 vueltas
      const anguloPorPersona = 360 / this.personasDisponibles.length;
      
      // Ángulo exacto donde debe parar (posición de la persona seleccionada)
      // La flecha apunta hacia arriba (0°), así que calculamos desde ahí
      const anguloPersona = indiceSeleccionado * anguloPorPersona;
      
      // Agregar variación aleatoria dentro del sector (±20% del sector)
      const variacion = (Math.random() - 0.5) * anguloPorPersona * 0.4;
      
      // Ángulo final: vueltas completas + posición específica + variación
      const anguloFinal = vueltasCompletas * 360 + anguloPersona + variacion;
      
      // Duración aleatoria para cada giro
      const duracion = 3000 + Math.random() * 2000; // 3-5 segundos

      // Aplicar la animación desde 0 hasta el ángulo final
      setTimeout(() => {
        ruleta.style.transition = `transform ${duracion}ms cubic-bezier(0.25, 0.1, 0.25, 1)`;
        ruleta.style.transform = `rotate(${anguloFinal}deg)`;
      }, 50); // Pequeño delay para asegurar que el reset se aplique

      // Finalizar después de la animación
      setTimeout(() => {
        this.personaSeleccionada = this.personasDisponibles[indiceSeleccionado].nombre;
        this.finalizarGiro(indiceSeleccionado);
        this.girando = false;
        
        // NO actualizar anguloActual, siempre empezamos desde 0
      }, duracion + 100);
    },

    finalizarGiro(indice) {
      // Incrementar contador de giros
      this.contadorGiros++;
      
      // Agregar a las asignaciones
      if (this.fechaAsignacion) {
        const persona = this.personasDisponibles[indice];

        const [year, month, day] = this.fechaAsignacion.split("-").map(Number);
        const fechaCorrecta = new Date(year, month - 1, day);

        this.asignaciones.push({
          persona: persona.nombre,
          fecha: fechaCorrecta,
          color: persona.color,
          usuarioId: persona.usuarioId, // Incluir usuarioId para el backend
          giro: this.contadorGiros // Número de giro para referencia
        });

        // Eliminar de las personas disponibles
        this.personasDisponibles.splice(indice, 1);
        this.guardarEnLocalStorage();

        // Verificar si se deben reiniciar las personas
        if (this.personasDisponibles.length === 0) {
          setTimeout(() => {
            this.mostrarConfirmacionReinicio();
          }, 1000);
        } else if (this.personasDisponibles.length === 1) {
          // Si solo queda una persona, mostrar mensaje especial
          setTimeout(() => {
            this.mostrarConfirmacionUltimaPersona();
          }, 1000);
        }
      }
    },

    mostrarConfirmacionUltimaPersona() {
      this.confirmTitle = "Última persona disponible";
      this.confirmMessage = `Solo queda ${this.personasDisponibles[0].nombre} disponible. ¿Desea asignarle una tarea seleccionando una nueva fecha o reiniciar la lista de participantes?`;
      this.confirmCallback = this.mostrarSelectorFechaUltimaPersona;
      this.showConfirmModal = true;
    },

    mostrarSelectorFechaUltimaPersona() {
      // Cerrar modal de confirmación
      this.showConfirmModal = false;
      
      // Mostrar modal especializado para seleccionar fecha de la última persona
      this.mostrarModalFechaUltimaPersona = true;
    },

    asignarUltimaPersonaConFecha() {
      if (this.personasDisponibles.length === 1 && this.fechaUltimaPersona) {
        const ultimaPersona = this.personasDisponibles[0];
        
        // Usar la fecha específica seleccionada para la última persona
        const [year, month, day] = this.fechaUltimaPersona.split("-").map(Number);
        const fechaCorrecta = new Date(year, month - 1, day);

        this.asignaciones.push({
          persona: ultimaPersona.nombre,
          fecha: fechaCorrecta,
          color: ultimaPersona.color,
          usuarioId: ultimaPersona.usuarioId,
          giro: this.contadorGiros + 1,
          asignacionDirecta: true
        });

        // Incrementar contador
        this.contadorGiros++;
        
        // Mostrar resultado
        this.personaSeleccionada = ultimaPersona.nombre;
        
        // Eliminar de las personas disponibles
        this.personasDisponibles.splice(0, 1);
        this.guardarEnLocalStorage();
        
        // Cerrar modal de fecha
        this.mostrarModalFechaUltimaPersona = false;
        
        // Mostrar confirmación de reinicio si ya no hay más personas
        setTimeout(() => {
          this.mostrarConfirmacionReinicio();
        }, 1500);
      } else {
        console.error("No se puede asignar: no hay persona o fecha disponible");
      }
    },

    cancelarAsignacionUltimaPersona() {
      this.mostrarModalFechaUltimaPersona = false;
      this.fechaUltimaPersona = this.obtenerFechaActual();
    },

    mostrarConfirmacionReinicio() {
      this.confirmTitle = "Reiniciar participantes";
      this.confirmMessage =
        "Ya se han asignado todas las personas. ¿Desea reiniciar la lista para nuevas asignaciones?";
      this.confirmCallback = this.reiniciarPersonas;
      this.showConfirmModal = true;
    },

    reiniciarPersonas() {
      // Restaurar la lista original de personas
      this.personasDisponibles = this.personasOriginales.map((p) => ({ ...p }));

      // Resetear el contador de giros solamente
      this.contadorGiros = 0;
      
      // RESETEAR la ruleta visualmente a posición inicial
      const ruleta = this.$refs.ruleta;
      if (ruleta) {
        ruleta.style.transition = "transform 0.5s ease";
        ruleta.style.transform = "rotate(0deg)";
      }

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
            usuarioId: asignacion.usuarioId
          });
        }
      }

      // Eliminar la asignación
      this.asignaciones.splice(index, 1);

      // Guardar en localStorage
      this.guardarEnLocalStorage();
    },

    async guardarAsignaciones() {
      if (this.asignaciones.length === 0) return;

      try {
        this.guardandoEventos = true;
        
        // Crear eventos para cada asignación
        const eventosCreados = [];
        
        for (const asignacion of this.asignaciones) {
          const eventoData = {
            titulo: `Sacar basura`,
            descripcion: `Tarea asignada por ruleta a ${asignacion.persona}`,
            categoria: 'basura',
            fechaInicio: new Date(asignacion.fecha.getFullYear(), asignacion.fecha.getMonth(), asignacion.fecha.getDate(), 18, 0).toISOString(),
            fechaFin: new Date(asignacion.fecha.getFullYear(), asignacion.fecha.getMonth(), asignacion.fecha.getDate(), 18, 30).toISOString(),
            usuariosAsignadosIds: asignacion.usuarioId ? [asignacion.usuarioId] : []
          };

          try {
            const eventoCreado = await eventoService.createEventoForCurrentUser(eventoData);
            eventosCreados.push(eventoCreado);
          } catch (error) {
            console.error(`Error al crear evento para ${asignacion.persona}:`, error);
          }
        }

        console.log(`RuletteBar: ${eventosCreados.length} eventos creados exitosamente`);
        
        // Emitir evento para notificar al componente padre
        this.$emit("guardar-asignaciones", {
          eventosCreados: eventosCreados.length,
          totalAsignaciones: this.asignaciones.length,
          tipo: 'ruleta'
        });

        // Mostrar mensaje de éxito
        this.$emit("mostrar-exito", `Se crearon ${eventosCreados.length} eventos de basura asignados por ruleta`);
        
        // Limpiar asignaciones después del guardado exitoso
        this.asignaciones = [];
        this.guardarEnLocalStorage();
        
        this.cerrarModal();
        
      } catch (error) {
        console.error('Error al guardar asignaciones:', error);
        this.$emit("mostrar-error", "Error al guardar las asignaciones en el calendario");
      } finally {
        this.guardandoEventos = false;
      }
    },

    formatearFechaUltimaPersona() {
      if (!this.fechaUltimaPersona) return "";
      
      const [year, month, day] = this.fechaUltimaPersona.split("-").map(Number);
      const fecha = new Date(year, month - 1, day);
      
      return fecha.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric", 
        month: "long",
        year: "numeric",
      });
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
      if (!hexcolor || typeof hexcolor !== "string") {
        return "#000";
      }

      // Para colores HSL, convertir a contraste básico
      if (hexcolor.startsWith('hsl')) {
        // Extraer el valor de luminosidad del HSL
        const match = hexcolor.match(/hsl\(\d+,\s*\d+%,\s*(\d+)%\)/);
        if (match) {
          const lightness = parseInt(match[1]);
          return lightness > 50 ? "#000000" : "#FFFFFF";
        }
        return "#000000";
      }

      if (!hexcolor.startsWith("#")) {
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

    // Persistencia con localStorage simplificada
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
                fecha: a.fecha.toISOString(),
              };
            })
          )
        );
        localStorage.setItem("ruletaContadorGiros", this.contadorGiros.toString());
        
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
            const fecha = new Date(a.fecha);
            fecha.setMinutes(fecha.getMinutes() + fecha.getTimezoneOffset());
            return {
              ...a,
              fecha: fecha,
            };
          });
        }

        // Recuperar contador de giros
        const contadorGuardado = localStorage.getItem("ruletaContadorGiros");
        if (contadorGuardado) {
          this.contadorGiros = parseInt(contadorGuardado) || 0;
        }

        console.log("Datos cargados desde localStorage");
      } catch (error) {
        console.error("Error al cargar datos desde localStorage:", error);
        // Si hay error, inicializar con valores por defecto
        this.personasDisponibles = [];
        this.personasOriginales = [];
        this.asignaciones = [];
        this.contadorGiros = 0;
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

@keyframes modal-disappear {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.9);
  }
}

.animate-modal-disappear {
  animation: modal-disappear 0.2s ease-in forwards;
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