<template>
  <div>
    <!-- Overlay modal que cubre toda la pantalla cuando está activo -->
    <div
      v-if="mostrarModal"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      :class="{ 'opacity-100': mostrarModal, 'opacity-0': !mostrarModal }"
      @click.self="cerrarModal"
    >
      <!-- Contenedor del modal -->
      <div
        class="bg-white rounded-lg shadow-xl transform"
        :class="{ 'animate-modal-appear': mostrarModal }"
      >
        <!-- Cabecera del modal -->
        <div
          class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 flex justify-between items-center"
        >
          <h3 class="text-lg font-bold">
            {{ eventoEditar ? "Editar evento" : "Crear evento" }}: {{ fechaFormateada }}
          </h3>
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
        <div class="p-6">
          <form @submit.prevent="guardarEvento">

            <!-- Campo para título -->
            <div class="mb-4">
              <label for="titulo" class="block text-sm font-medium text-gray-700 mb-1"
                >Título *</label
              >
              <input
                type="text"
                id="titulo"
                v-model="nuevoEvento.titulo"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa el título del evento"
                required
              />
            </div>

            <!-- Selector de categoría -->
            <div class="mb-4">
              <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1"
                >Categoría *</label
              >
              <div class="relative">
                <select
                  id="categoria"
                  v-model="nuevoEvento.categoria"
                  class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required
                >
                  <option disabled value="">Selecciona una categoría</option>
                  <option v-for="cat in categorias" :key="cat.valor" :value="cat.valor">
                    {{ cat.nombre }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Campo para descripción -->
            <div class="mb-4">
              <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1"
                >Descripción (opcional)</label
              >
              <textarea
                id="descripcion"
                v-model="nuevoEvento.descripcion"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Agrega detalles sobre este evento"
              ></textarea>
            </div>

            <!-- Fechas de inicio y fin -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="fechaInicio" class="block text-sm font-medium text-gray-700 mb-1"
                  >Fecha y hora de inicio *</label
                >
                <input
                  type="datetime-local"
                  id="fechaInicio"
                  v-model="nuevoEvento.fechaInicio"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label for="fechaFin" class="block text-sm font-medium text-gray-700 mb-1"
                  >Fecha y hora de fin *</label
                >
                <input
                  type="datetime-local"
                  id="fechaFin"
                  v-model="nuevoEvento.fechaFin"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <!-- Selector de usuario -->
            <div class="mb-4">
              <label for="usuario" class="block text-sm font-medium text-gray-700 mb-1"
                >Asignar a usuario (opcional)</label
              >
              <div class="relative">
                <select
                  id="usuario"
                  v-model="nuevoEvento.usuarioAsignadoId"
                  class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  :disabled="cargandoUsuarios"
                >
                  <option value="">Sin asignar (evento global)</option>
                  <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">
                    {{ usuario.nombre }} {{ usuario.apellido }}
                    <span v-if="usuario.oficina" class="text-gray-500">
                      - {{ usuario.oficina.nombre }}
                    </span>
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg v-if="!cargandoUsuarios" class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <svg v-else class="animate-spin w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="cerrarModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="guardando"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="guardando || !formularioValido"
              >
                <span v-if="guardando" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
                <span v-else>
                  {{ eventoEditar ? "Actualizar" : "Crear" }} evento
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import EventoService from '@/models/eventoService';
const eventoService = new EventoService();
import UserService from '@/models/userService';
const userService = new UserService();

export default {
  name: "AgendarTareas",

  props: {
    mostrarModal: {
      type: Boolean,
      default: false,
    },
    fechaSeleccionada: {
      type: Date,
      default: null,
    },
    eventoEditar: {
      type: Object,
      default: null,
    },
    categorias: {
      type: Array,
      default: () => [
        { nombre: "Trabajo", valor: "trabajo", color: "#4299e1" },
        { nombre: "Cumpleaños", valor: "cumpleaños", color: "#e64e81" },
        { nombre: "Basura", valor: "basura", color: "#8a4e03" },
        { nombre: "Otro", valor: "otro", color: "#9f7aea" },
      ],
    },
  },

  data() {
    return {
      nuevoEvento: {
        titulo: "",
        categoria: "",
        descripcion: "",
        fechaInicio: "",
        fechaFin: "",
        usuarioAsignadoId: null,
      },
      usuarios: [],
      cargandoUsuarios: false,
      guardando: false,
    };
  },

  computed: {
    fechaFormateada() {
      if (!this.fechaSeleccionada) return "";

      return this.fechaSeleccionada.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    formularioValido() {
      return (
        this.nuevoEvento.titulo.trim() &&
        this.nuevoEvento.categoria &&
        this.nuevoEvento.fechaInicio &&
        this.nuevoEvento.fechaFin &&
        new Date(this.nuevoEvento.fechaInicio) < new Date(this.nuevoEvento.fechaFin)
      );
    },
  },

  watch: {
    // Observar cambios en eventoEditar para cargar datos cuando se edita
    eventoEditar: {
      handler(evento) {
        if (evento) {
          this.cargarDatosEvento(evento);
        }
      },
      immediate: true,
    },

    // Observar cambios en el modal para configurar fechas por defecto
    mostrarModal(visible) {
      if (visible) {
        this.cargarUsuarios();
        if (!this.eventoEditar) {
          this.inicializarFormulario();
        }
      } else {
        setTimeout(() => {
          if (!this.mostrarModal && !this.eventoEditar) {
            this.limpiarFormulario();
          }
        }, 300);
      }
    },

    // Validar fechas cuando cambian
    'nuevoEvento.fechaInicio'() {
      this.validarFechas();
    },
  },

  methods: {
    async cargarUsuarios() {
      try {
        this.cargandoUsuarios = true;
        const response = await userService.getAllUsers();
        this.usuarios = response.data || response;
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        this.$emit('error', 'Error al cargar la lista de usuarios');
        this.usuarios = [];
      } finally {
        this.cargandoUsuarios = false;
      }
    },

    cargarDatosEvento(evento) {
      // Convertir fechas del backend al formato datetime-local
      const fechaInicio = new Date(evento.fechaInicio);
      const fechaFin = new Date(evento.fechaFin);

      this.nuevoEvento = {
        titulo: evento.titulo || "",
        categoria: evento.categoria || "",
        descripcion: evento.descripcion || "",
        fechaInicio: this.formatearFechaParaInput(fechaInicio),
        fechaFin: this.formatearFechaParaInput(fechaFin),
        usuarioAsignadoId: evento.usuarioAsignado?.id || null,
      };
    },

    inicializarFormulario() {
      // Configurar fechas por defecto basadas en la fecha seleccionada
      if (this.fechaSeleccionada) {
        const fecha = new Date(this.fechaSeleccionada);
        
        // Fecha de inicio: fecha seleccionada a las 9:00 AM
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(9, 0, 0, 0);
        
        // Fecha de fin: una hora después
        const fechaFin = new Date(fechaInicio);
        fechaFin.setHours(10, 0, 0, 0);

        this.nuevoEvento.fechaInicio = this.formatearFechaParaInput(fechaInicio);
        this.nuevoEvento.fechaFin = this.formatearFechaParaInput(fechaFin);
      }
      
      this.limpiarFormulario();
    },

    formatearFechaParaInput(fecha) {
      // Convertir Date a formato YYYY-MM-DDTHH:MM para input datetime-local
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const hours = String(fecha.getHours()).padStart(2, '0');
      const minutes = String(fecha.getMinutes()).padStart(2, '0');
      
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    validarFechas() {
      // Si se cambia la fecha de inicio y no hay fecha de fin, establecer una hora después
      if (this.nuevoEvento.fechaInicio && !this.nuevoEvento.fechaFin) {
        const fechaInicio = new Date(this.nuevoEvento.fechaInicio);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setHours(fechaInicio.getHours() + 1);
        
        this.nuevoEvento.fechaFin = this.formatearFechaParaInput(fechaFin);
      }
    },

    cerrarModal() {
      this.$emit("cerrar");
    },

    async guardarEvento() {
      if (!this.formularioValido) {
        this.$emit('error', 'Por favor completa todos los campos obligatorios');
        return;
      }

      try {
        this.guardando = true;
        
        // Preparar datos del evento según el DTO del backend
        const eventoData = {
          titulo: this.nuevoEvento.titulo.trim(),
          categoria: this.nuevoEvento.categoria,
          descripcion: this.nuevoEvento.descripcion.trim(),
          fechaInicio: new Date(this.nuevoEvento.fechaInicio).toISOString(),
          fechaFin: new Date(this.nuevoEvento.fechaFin).toISOString(),
          usuarioAsignadoId: this.nuevoEvento.usuarioAsignadoId || undefined,
        };

        let eventoGuardado;

        if (this.eventoEditar) {
          // Actualizar evento existente
          eventoGuardado = await eventoService.updateEvento(this.eventoEditar.id, eventoData);
          this.$emit("exito", "Evento actualizado correctamente");
        } else {
          // Crear nuevo evento
          eventoGuardado = await eventoService.createEvento(eventoData);
          this.$emit("exito", "Evento creado correctamente");
        }

        // Emitir evento con los datos guardados
        this.$emit("guardar-evento", eventoGuardado);
        
      } catch (error) {
        console.error('Error al guardar evento:', error);
        let mensajeError = 'Error al guardar el evento';
        
        // Manejar errores específicos del backend
        if (error.message.includes('fecha de inicio')) {
          mensajeError = 'La fecha de inicio debe ser anterior a la fecha de fin';
        } else if (error.message.includes('Usuario')) {
          mensajeError = 'El usuario seleccionado no es válido';
        } else if (error.message) {
          mensajeError = error.message;
        }
        
        this.$emit('error', mensajeError);
      } finally {
        this.guardando = false;
      }
    },

    limpiarFormulario() {
      // Solo limpiar los campos que no son fechas cuando no hay evento para editar
      if (!this.eventoEditar) {
        this.nuevoEvento.titulo = "";
        this.nuevoEvento.categoria = "";
        this.nuevoEvento.descripcion = "";
        this.nuevoEvento.usuarioAsignadoId = null;
        // Las fechas se mantienen si ya están establecidas
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
</style>