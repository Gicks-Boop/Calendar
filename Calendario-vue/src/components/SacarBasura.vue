<template>
  <div>
    <!-- Modal para asignar tareas de basura -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 p-4 sm:p-0"
      :class="{ 'opacity-100': mostrarModal, 'opacity-0': !mostrarModal }"
      @click.self="cerrarModal"
    >
      <!-- Contenedor del modal -->
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-3xl transform overflow-y-auto max-h-[90vh]"
        :class="{ 'animate-modal-appear': mostrarModal }"
      >
        <!-- Cabecera del modal -->
        <div
          class="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-lg sticky top-0 z-10"
        >
          <div>
            <h3 class="text-base sm:text-lg font-bold">Asignación automática de tareas de basura</h3>
            <p class="text-sm opacity-90">{{ oficinaActual?.nombre || 'Oficina actual' }}</p>
          </div>
          <button @click="cerrarModal" class="text-white hover:text-gray-200 focus:outline-none">
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
              Esta herramienta asignará automáticamente la tarea de sacar la basura entre los
              usuarios de tu oficina, de lunes a viernes. Selecciona el mes y los usuarios participantes.
            </p>
          </div>

          <!-- Selector de mes y año -->
          <div class="mb-6">
            <h4 class="font-medium text-gray-700 mb-3">Seleccionar período:</h4>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="mesSeleccionado" class="block text-sm text-gray-600 mb-1">Mes</label>
                <select
                  id="mesSeleccionado"
                  v-model="mesSeleccionado"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option v-for="(mes, index) in meses" :key="index" :value="index">
                    {{ mes }}
                  </option>
                </select>
              </div>
              <div>
                <label for="anioSeleccionado" class="block text-sm text-gray-600 mb-1">Año</label>
                <select
                  id="anioSeleccionado"
                  v-model="anioSeleccionado"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option v-for="anio in aniosDisponibles" :key="anio" :value="anio">
                    {{ anio }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Lista de usuarios de la oficina -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium text-gray-700">
                Usuarios de la oficina ({{ usuariosOficina.length }}):
              </h4>
              
              <!-- Botones de selección rápida -->
              <div class="flex space-x-2">
                <button
                  @click="seleccionarTodosUsuarios"
                  class="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded"
                  :disabled="cargandoUsuarios"
                >
                  Todos
                </button>
                <button
                  @click="deseleccionarTodosUsuarios"
                  class="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded"
                  :disabled="cargandoUsuarios"
                >
                  Ninguno
                </button>
                <button
                  v-if="usuariosSeleccionados.length > 0 || asignaciones.length > 0"
                  @click="mostrarConfirmacionLimpiarTodo"
                  class="text-sm text-red-500 hover:text-red-700 flex items-center px-2 py-1 rounded"
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
            </div>

            <!-- Loading de usuarios -->
            <div v-if="cargandoUsuarios" class="text-center py-8">
              <svg class="animate-spin h-8 w-8 mx-auto text-green-500 mb-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p class="text-gray-600">Cargando usuarios de la oficina...</p>
            </div>

            <!-- Error al cargar usuarios -->
            <div v-else-if="errorUsuarios" class="text-center py-8">
              <svg class="h-8 w-8 mx-auto text-red-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-red-600 mb-2">Error al cargar usuarios</p>
              <button 
                @click="cargarUsuariosOficina"
                class="text-sm text-blue-600 hover:text-blue-800"
              >
                Reintentar
              </button>
            </div>

            <!-- Lista de usuarios -->
            <div v-else-if="usuariosOficina.length > 0" class="space-y-2 max-h-60 overflow-y-auto">
              <div
                v-for="usuario in usuariosOficina"
                :key="usuario.id"
                class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                :class="{
                  'border-green-300 bg-green-50': usuariosSeleccionados.includes(usuario.id),
                  'border-blue-300 bg-blue-50': esUsuarioActual(usuario)
                }"
              >
                <div class="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    :value="usuario.id"
                    v-model="usuariosSeleccionados"
                    class="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div class="flex-1">
                    <div class="flex items-center space-x-2">
                      <span class="font-medium text-gray-900">
                        {{ usuario.nombre }} {{ usuario.apellido }}
                      </span>
                      <span v-if="esUsuarioActual(usuario)" class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        Tú
                      </span>
                    </div>
                    <p v-if="usuario.email" class="text-sm text-gray-500">{{ usuario.email }}</p>
                  </div>
                </div>
                
                <!-- Indicador de color asignado -->
                <div 
                  v-if="usuariosSeleccionados.includes(usuario.id)"
                  class="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  :style="{ backgroundColor: obtenerColorUsuario(usuario.id) }"
                  :title="`Color asignado: ${obtenerColorUsuario(usuario.id)}`"
                ></div>
              </div>
            </div>

            <!-- Sin usuarios -->
            <div v-else class="text-center py-8 text-gray-500">
              <svg class="h-8 w-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p>No se encontraron usuarios en la oficina</p>
            </div>

            <!-- Contador de usuarios seleccionados -->
            <div v-if="usuariosSeleccionados.length > 0" class="mt-3 text-sm text-gray-600 bg-green-50 p-2 rounded">
              <span class="font-medium">{{ usuariosSeleccionados.length }}</span> usuario(s) seleccionado(s) para participar
            </div>
          </div>

          <!-- Vista previa de asignaciones -->
          <div v-if="asignaciones.length > 0" class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium text-gray-700">Vista previa de asignaciones:</h4>

              <!-- Botón para limpiar asignaciones -->
              <button
                @click="limpiarAsignaciones"
                class="text-sm text-orange-500 hover:text-orange-700 flex items-center"
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
                Limpiar asignaciones
              </button>
            </div>

            <div class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Día
                      </th>
                      <th class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario asignado
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(asignacion, index) in asignaciones" :key="index" class="hover:bg-gray-50">
                      <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        {{ formatearFecha(asignacion.fecha) }}
                      </td>
                      <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700">
                        {{ obtenerDiaSemana(asignacion.fecha) }}
                      </td>
                      <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div class="relative">
                          <!-- Select para cambiar el usuario asignado -->
                          <select
                            v-model="asignaciones[index].usuarioId"
                            @change="actualizarNombreUsuario(index)"
                            class="appearance-none w-full text-xs sm:text-sm font-medium px-3 py-2 pr-8 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            :style="{
                              backgroundColor: obtenerColorUsuario(asignacion.usuarioId) + '20',
                              borderColor: obtenerColorUsuario(asignacion.usuarioId)
                            }"
                          >
                            <option
                              v-for="usuarioId in usuariosSeleccionados"
                              :key="usuarioId"
                              :value="usuarioId"
                            >
                              {{ obtenerNombreUsuario(usuarioId) }}
                            </option>
                          </select>
                          <!-- Icono de selector -->
                          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                            <svg
                              class="h-4 w-4 text-gray-400"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fill-rule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clip-rule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Botones de acción -->
          <div class="flex flex-col sm:flex-row flex-wrap justify-between gap-2 mt-6">
            <div class="flex flex-wrap gap-2">
              <button
                @click="generarAsignaciones"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="usuariosSeleccionados.length === 0 || cargandoUsuarios"
              >
                <span class="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span class="hidden xs:inline">Generar asignaciones</span>
                  <span class="xs:hidden">Generar</span>
                </span>
              </button>
              
              <button
                @click="guardarAsignaciones"
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="asignaciones.length === 0 || guardandoEventos"
              >
                <span class="flex items-center">
                  <svg
                    v-if="guardandoEventos"
                    class="animate-spin h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <svg
                    v-else
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  <span class="hidden xs:inline">
                    {{ guardandoEventos ? 'Guardando...' : 'Guardar en calendario' }}
                  </span>
                  <span class="xs:hidden">
                    {{ guardandoEventos ? 'Guardando...' : 'Guardar' }}
                  </span>
                </span>
              </button>
            </div>

            <button
              @click="exportarPDF"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="asignaciones.length === 0"
            >
              <span class="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span class="hidden xs:inline">Exportar PDF</span>
                <span class="xs:hidden">PDF</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para limpiar todo -->
    <div
      v-if="mostrarModalConfirmacion"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] transition-all duration-300"
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
        <h3 class="text-lg font-bold text-gray-900 mb-4">Confirmar</h3>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de que deseas eliminar todas las selecciones y asignaciones? Esta acción no se
          puede deshacer.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="cerrarModalConfirmacion"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            @click="limpiarTodo"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-all duration-200"
          >
            Eliminar todo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import html2pdf from "html2pdf.js";
import UserService from '@/models/userService';
import EventoService from '@/models/eventoService';
import * as Static from '@/middleware/static';

const userService = new UserService();
const eventoService = new EventoService();

export default {
  name: "SacarBasura",
  props: {
    mostrarModal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // Usuarios de la oficina
      usuariosOficina: [],
      usuariosSeleccionados: [],
      cargandoUsuarios: false,
      errorUsuarios: false,
      
      // Usuario y oficina actual
      usuarioActual: null,
      oficinaActual: null,
      
      // Asignaciones
      asignaciones: [],
      guardandoEventos: false,
      
      // UI
      mostrarModalConfirmacion: false,
      
      // Configuración temporal
      mesSeleccionado: new Date().getMonth(),
      anioSeleccionado: new Date().getFullYear(),
      meses: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
      ],
      colores: [
        "#4299E1", "#48BB78", "#ED8936", "#9F7AEA", "#F56565",
        "#38B2AC", "#ED64A6", "#667EEA", "#F6AD55", "#FC8181",
        "#4FD1C7", "#63B3ED", "#F687B3", "#A78BFA", "#34D399"
      ],
    };
  },
  computed: {
    aniosDisponibles() {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 4 }, (_, i) => currentYear + i);
    },
  },
  watch: {
    mostrarModal: {
      handler(nuevo) {
        if (nuevo) {
          this.inicializar();
        }
      },
      immediate: true
    }
  },
  methods: {
    async inicializar() {
      this.cargarUsuarioActual();
      await this.cargarUsuariosOficina();
    },

    cargarUsuarioActual() {
      this.usuarioActual = Static.BM_GET_USER_DATA();
      this.oficinaActual = this.usuarioActual?.oficina;
      console.log('Usuario actual:', this.usuarioActual);
    },

    async cargarUsuariosOficina() {
      try {
        this.cargandoUsuarios = true;
        this.errorUsuarios = false;
        
        const response = await userService.getMyOfficeUsers();
        this.usuariosOficina = response.data || response || [];
        
        console.log('Usuarios de oficina cargados:', this.usuariosOficina);
        
        // Auto-seleccionar al usuario actual
        if (this.usuarioActual && this.usuariosOficina.length > 0) {
          const usuarioActualEnLista = this.usuariosOficina.find(u => u.id === this.usuarioActual.id);
          if (usuarioActualEnLista && !this.usuariosSeleccionados.includes(this.usuarioActual.id)) {
            this.usuariosSeleccionados.push(this.usuarioActual.id);
          }
        }
        
      } catch (error) {
        console.error('Error al cargar usuarios de oficina:', error);
        this.errorUsuarios = true;
        this.usuariosOficina = [];
      } finally {
        this.cargandoUsuarios = false;
      }
    },

    esUsuarioActual(usuario) {
      return this.usuarioActual && this.usuarioActual.id === usuario.id;
    },

    seleccionarTodosUsuarios() {
      this.usuariosSeleccionados = this.usuariosOficina.map(u => u.id);
    },

    deseleccionarTodosUsuarios() {
      this.usuariosSeleccionados = [];
    },

    obtenerNombreUsuario(usuarioId) {
      const usuario = this.usuariosOficina.find(u => u.id === usuarioId);
      return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario no encontrado';
    },

    obtenerColorUsuario(usuarioId) {
      const index = this.usuariosSeleccionados.indexOf(usuarioId);
      return this.colores[index % this.colores.length];
    },

    generarAsignaciones() {
      if (this.usuariosSeleccionados.length === 0) return;

      // Obtener días de lunes a viernes del mes seleccionado
      const asignaciones = [];
      const anio = this.anioSeleccionado;
      const mes = this.mesSeleccionado;
      const ultimoDia = new Date(anio, mes + 1, 0);

      for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const fecha = new Date(anio, mes, dia);
        const diaSemana = fecha.getDay();

        // Solo incluir de lunes a viernes (1-5)
        if (diaSemana >= 1 && diaSemana <= 5) {
          asignaciones.push({
            fecha: fecha,
            usuarioId: null,
            nombreUsuario: null
          });
        }
      }

      // Asignar usuarios aleatoriamente pero de forma equilibrada
      const usuariosDisponibles = [...this.usuariosSeleccionados];
      let usuariosPorAsignar = [...usuariosDisponibles];

      for (let i = 0; i < asignaciones.length; i++) {
        // Si se acabaron los usuarios, reiniciar el array
        if (usuariosPorAsignar.length === 0) {
          usuariosPorAsignar = [...usuariosDisponibles];
        }

        // Seleccionar usuario aleatorio del grupo disponible
        const indiceAleatorio = Math.floor(Math.random() * usuariosPorAsignar.length);
        const usuarioId = usuariosPorAsignar[indiceAleatorio];
        
        asignaciones[i].usuarioId = usuarioId;
        asignaciones[i].nombreUsuario = this.obtenerNombreUsuario(usuarioId);

        // Quitar ese usuario de la lista temporal
        usuariosPorAsignar.splice(indiceAleatorio, 1);
      }

      this.asignaciones = asignaciones;
    },

    actualizarNombreUsuario(index) {
      if (this.asignaciones[index]) {
        this.asignaciones[index].nombreUsuario = this.obtenerNombreUsuario(this.asignaciones[index].usuarioId);
      }
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
            descripcion: `Tarea asignada a ${asignacion.nombreUsuario}`,
            categoria: 'basura',
            fechaInicio: new Date(asignacion.fecha.getFullYear(), asignacion.fecha.getMonth(), asignacion.fecha.getDate(), 18, 0).toISOString(),
            fechaFin: new Date(asignacion.fecha.getFullYear(), asignacion.fecha.getMonth(), asignacion.fecha.getDate(), 18, 30).toISOString(),
            usuariosAsignadosIds: [asignacion.usuarioId]
          };

          try {
            const eventoCreado = await eventoService.createEventoForCurrentUser(eventoData);
            eventosCreados.push(eventoCreado);
          } catch (error) {
            console.error(`Error al crear evento para ${asignacion.nombreUsuario}:`, error);
          }
        }

        console.log(`SacarBasura: ${eventosCreados.length} eventos creados exitosamente`);
        
        // Emitir evento para notificar al componente padre
        this.$emit("guardar-asignaciones", {
          eventosCreados: eventosCreados.length,
          totalAsignaciones: this.asignaciones.length,
          mes: this.meses[this.mesSeleccionado],
          anio: this.anioSeleccionado
        });

        // Mostrar mensaje de éxito
        this.$emit("mostrar-exito", `Se crearon ${eventosCreados.length} eventos de basura para ${this.meses[this.mesSeleccionado]} ${this.anioSeleccionado}`);
        
        this.cerrarModal();
        
      } catch (error) {
        console.error('Error al guardar asignaciones:', error);
        this.$emit("mostrar-error", "Error al guardar las asignaciones en el calendario");
      } finally {
        this.guardandoEventos = false;
      }
    },

    exportarPDF() {
      if (this.asignaciones.length === 0) {
        alert("No hay asignaciones para exportar.");
        return;
      }

      try {
        // Crear un elemento HTML temporal para renderizar el calendario
        const element = document.createElement("div");
        element.style.fontFamily = "Arial, sans-serif";
        element.style.padding = "15px";

        const anio = this.anioSeleccionado;
        const mes = this.mesSeleccionado;
        const nombreMes = this.meses[mes];

        // Crear mapa de asignaciones por día
        const asignacionesPorDia = {};
        this.asignaciones.forEach((asignacion) => {
          const dia = asignacion.fecha.getDate();
          asignacionesPorDia[dia] = {
            nombreUsuario: asignacion.nombreUsuario,
            color: this.obtenerColorUsuario(asignacion.usuarioId)
          };
        });

        const diasSemanaCortos = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

        // Añadir título
        element.innerHTML = `
          <div style="text-align: center; margin-bottom: 15px;">
            <h1 style="font-size: 22px; margin: 0; color: #1a56db;">${nombreMes.toUpperCase()} ${anio}</h1>
            <p style="font-size: 14px; margin: 5px 0; color: #666;">Asignación de tareas de basura - ${this.oficinaActual?.nombre || 'Oficina'}</p>
          </div>
        `;

        // Crear la estructura del calendario
        let tablaHTML = `
          <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
            <thead style="background-color: #4169E1;">
              <tr>
                ${diasSemanaCortos
                  .map(
                    (dia) =>
                      `<th style="padding: 8px; color: white; text-align: center; border: 1px solid #ccc;">${dia}</th>`
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
        `;

        // Determinar el primer día del mes
        const primerDia = new Date(anio, mes, 1);
        const ultimoDia = new Date(anio, mes + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const diaSemanaPrimerDia = primerDia.getDay();

        let diaActual = 1;

        // Generar filas del calendario
        for (let i = 0; i < 6; i++) {
          let filaHTML = '<tr style="height: 90px;">';

          for (let j = 0; j < 7; j++) {
            if ((i === 0 && j < diaSemanaPrimerDia) || diaActual > diasEnMes) {
              filaHTML += `<td style="border: 1px solid #ddd; background-color: #f5f5f5;"></td>`;
            } else {
              const esDiaActual =
                diaActual === new Date().getDate() &&
                mes === new Date().getMonth() &&
                anio === new Date().getFullYear();

              const fechaActual = new Date(anio, mes, diaActual);
              const diaSemana = fechaActual.getDay();
              const esLunesAViernes = diaSemana >= 1 && diaSemana <= 5;

              let fondoCelda = esDiaActual ? "#e3f2fd" : "white";
              let colorNumero = esDiaActual ? "#1976d2" : "#333";

              const asignacion = asignacionesPorDia[diaActual];

              let personaHTML = "";
              if (asignacion && esLunesAViernes) {
                personaHTML = `
                  <div style="
                    position: absolute;
                    bottom: 5px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    padding: 2px 0;
                    background-color: ${asignacion.color}20;
                    border-top: 2px solid ${asignacion.color};
                  ">
                    <span style="
                      font-size: 10px;
                      color: ${asignacion.color};
                      font-weight: 600;
                      padding: 2px 5px;
                      border-radius: 3px;
                      display: inline-block;
                      max-width: 90%;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    ">
                      ${asignacion.nombreUsuario}
                    </span>
                  </div>
                `;
              }

              filaHTML += `
                <td style="
                  border: 1px solid #ddd;
                  vertical-align: top;
                  background-color: ${fondoCelda};
                  position: relative;
                  height: 90px;
                  padding: 0;
                ">
                  <div style="
                    padding: 5px;
                    height: 100%;
                    box-sizing: border-box;
                    position: relative;
                  ">
                    <div style="
                      font-size: 16px;
                      font-weight: ${esDiaActual ? "bold" : "normal"};
                      color: ${colorNumero};
                      text-align: right;
                    ">
                      ${diaActual}
                    </div>
                    ${personaHTML}
                  </div>
                </td>
              `;

              diaActual++;
            }
          }

          filaHTML += "</tr>";
          tablaHTML += filaHTML;

          if (diaActual > diasEnMes) break;
        }

        tablaHTML += `
          </tbody>
        </table>
        `;

        element.innerHTML += tablaHTML;

        // Añadir leyenda con los usuarios
        let leyendaHTML = `
          <div style="margin-top: 20px;">
            <h3 style="font-size: 16px; color: #4169E1; margin-bottom: 8px;">Usuarios asignados para sacar la basura:</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 15px;">
        `;

        // Añadir cada usuario seleccionado con su color
        this.usuariosSeleccionados.forEach((usuarioId, index) => {
          const color = this.obtenerColorUsuario(usuarioId);
          const nombreUsuario = this.obtenerNombreUsuario(usuarioId);
          leyendaHTML += `
            <div style="display: flex; align-items: center;">
              <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%;
                    background-color: ${color}; margin-right: 5px;"></span>
              <span style="font-size: 13px;">${nombreUsuario}</span>
            </div>
          `;
        });

        leyendaHTML += `
          </div>
        </div>

        <div style="margin-top: 15px; text-align: center; font-size: 11px; color: #666;">
          Generado el ${new Date().toLocaleDateString("es-ES")} - ${this.oficinaActual?.nombre || 'Oficina'}
        </div>
        `;

        element.innerHTML += leyendaHTML;

        // Configurar las opciones de html2pdf
        const options = {
          margin: 10,
          filename: `Calendario_Basura_${nombreMes}_${anio}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            logging: false,
          },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };

        // Generar el PDF
        html2pdf()
          .from(element)
          .set(options)
          .save()
          .catch((error) => {
            console.error("Error durante la generación del PDF:", error);
            alert("Hubo un error al generar el PDF. Por favor, intenta de nuevo.");
          });
      } catch (error) {
        console.error("Error al generar el PDF:", error);
        alert("Hubo un error al generar el PDF. Por favor, intenta de nuevo.");
      }
    },

    formatearFecha(fecha) {
      return fecha.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },

    obtenerDiaSemana(fecha) {
      const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
      return diasSemana[fecha.getDay()];
    },

    limpiarAsignaciones() {
      this.asignaciones = [];
    },

    mostrarConfirmacionLimpiarTodo() {
      this.mostrarModalConfirmacion = true;
    },

    cerrarModalConfirmacion() {
      this.mostrarModalConfirmacion = false;
    },

    limpiarTodo() {
      this.usuariosSeleccionados = [];
      this.asignaciones = [];
      this.mostrarModalConfirmacion = false;
    },

    cerrarModal() {
      // Aplicar animación de salida
      const modalElement = this.$el.querySelector(".bg-white");
      if (modalElement) {
        modalElement.classList.remove("animate-modal-appear");
        modalElement.classList.add("animate-modal-disappear");

        const backdropElement = this.$el.querySelector(".fixed.inset-0");
        if (backdropElement) {
          backdropElement.classList.add("opacity-0");
        }

        setTimeout(() => {
          this.$emit("cerrar");
        }, 200);
      } else {
        this.$emit("cerrar");
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

/* Breakpoint personalizado para textos en botones */
@media (min-width: 420px) {
  .xs\:hidden {
    display: none;
  }
  .xs\:inline {
    display: inline;
  }
}

@media (max-width: 419px) {
  .xs\:hidden {
    display: inline;
  }
  .xs\:inline {
    display: none;
  }
}

.hidden {
  display: none;
}
</style>