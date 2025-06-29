<template>
  <div>
    <!-- Overlay modal que cubre toda la pantalla cuando está activo -->
    <div v-if="mostrarModal"
      class="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      :class="{ 'opacity-100': mostrarModal, 'opacity-0': !mostrarModal }" @click.self="cerrarModal">
      <!-- Contenedor del modal -->
      <div class="bg-white rounded-lg shadow-xl transform max-w-lg w-full mx-4" :class="{ 'animate-modal-appear': mostrarModal }">
        <!-- Cabecera del modal -->
        <div
          class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 flex justify-between items-center">
          <h3 class="text-lg font-bold">
            {{ eventoEditar ? "Editar evento" : "Crear evento" }}: {{ fechaFormateada }}
          </h3>
          <button @click="cerrarModal" class="text-white hover:text-gray-200 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Cuerpo del modal -->
        <div class="p-6">
          <form @submit.prevent="guardarEvento">

            <!-- Campo para título -->
            <div class="mb-4">
              <label for="titulo" class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <input type="text" id="titulo" v-model="nuevoEvento.titulo"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa el título del evento" required />
            </div>

            <!-- Selector de categoría -->
            <div class="mb-4">
              <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
              <div class="relative">
                <select id="categoria" v-model="nuevoEvento.categoria"
                  class="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                  required>
                  <option disabled value="">Selecciona una categoría</option>
                  <option v-for="cat in categorias" :key="cat.valor" :value="cat.valor">
                    {{ cat.nombre }}
                  </option>
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clip-rule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            <!-- Campo para descripción -->
            <div class="mb-4">
              <label for="descripcion" class="block text-sm font-medium text-gray-700 mb-1">Descripción
                (opcional)</label>
              <textarea id="descripcion" v-model="nuevoEvento.descripcion" rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Agrega detalles sobre este evento"></textarea>
            </div>

            <!-- Fechas de inicio y fin -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label for="fechaInicio" class="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de inicio
                  *</label>
                <input type="datetime-local" id="fechaInicio" v-model="nuevoEvento.fechaInicio"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required />
              </div>
              <div>
                <label for="fechaFin" class="block text-sm font-medium text-gray-700 mb-1">Fecha y hora de fin *</label>
                <input type="datetime-local" id="fechaFin" v-model="nuevoEvento.fechaFin"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required />
              </div>
            </div>

            <!-- Selector de usuarios múltiple -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">Asignar usuarios</label>
              
              <!-- Opciones de asignación -->
              <div class="flex flex-wrap gap-2 mb-3">
                <!-- <button type="button" @click="limpiarAsignaciones"
                  class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors">
                  Sin asignar (Global)
                </button> -->
                <button type="button" @click="asignarATodos"
                  class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
                  Asignar a todos
                </button>
                <button type="button" @click="asignarseAMismo"
                  class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors">
                  Solo para mí
                </button>
              </div>

              <!-- Lista de usuarios con checkboxes -->
              <div class="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                <div v-if="cargandoUsuarios" class="p-4 text-center text-gray-500">
                  <svg class="animate-spin h-5 w-5 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Cargando usuarios...
                </div>
                
                <div v-else-if="usuarios.length === 0" class="p-4 text-center text-gray-500">
                  No se encontraron usuarios
                </div>
                
                <div v-else>
                  <label v-for="usuario in usuarios" :key="usuario.id" 
                    class="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0">
                    <input type="checkbox" 
                      :value="usuario.id" 
                      v-model="nuevoEvento.usuariosAsignadosIds"
                      class="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
                    <div class="flex-1">
                      <div class="font-medium text-gray-900">
                        {{ usuario.nombre }} {{ usuario.apellido }}
                        <span v-if="esUsuarioActual(usuario)" class="text-blue-600 text-sm">(Tú)</span>
                      </div>
                      <div v-if="usuario.email" class="text-sm text-gray-500">{{ usuario.email }}</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Contador de usuarios seleccionados -->
              <div v-if="nuevoEvento.usuariosAsignadosIds.length > 0" class="mt-2 text-sm text-gray-600">
                {{ nuevoEvento.usuariosAsignadosIds.length }} usuario(s) seleccionado(s)
              </div>
              <!-- <div v-else class="mt-2 text-sm text-yellow-600">
                Evento global - visible para toda la oficina
              </div> -->
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end space-x-3 mt-6">
              <button type="button" @click="cerrarModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                :disabled="guardando">
                Cancelar
              </button>
              <button type="submit"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="guardando || !formularioValido">
                <span v-if="guardando" class="flex items-center">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                    </path>
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
import * as Static from '@/middleware/static';

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
        usuariosAsignadosIds: []
      },
      usuarios: [],
      cargandoUsuarios: false,
      guardando: false,
      usuarioActual: null
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
    eventoEditar: {
      handler(evento) {
        if (evento) {
          this.cargarDatosEvento(evento);
        }
      },
      immediate: true,
    },

    mostrarModal(visible) {
      if (visible) {
        this.cargarUsuarios();
        this.cargarUsuarioActual();
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

    'nuevoEvento.fechaInicio'() {
      this.validarFechas();
    },
  },

  methods: {
    async cargarUsuarios() {
      try {
        this.cargandoUsuarios = true;
        const response = await userService.getMyOfficeUsers();
        this.usuarios = response.data || response;
        console.log("Usuarios de la oficina cargados:", this.usuarios);
      } catch (error) {
        console.error('Error al cargar usuarios de la oficina:', error);
        this.$emit('error', 'Error al cargar la lista de usuarios');
        this.usuarios = [];
      } finally {
        this.cargandoUsuarios = false;
      }
    },

    cargarUsuarioActual() {
      this.usuarioActual = Static.BM_GET_USER_DATA();
    },

    esUsuarioActual(usuario) {
      return this.usuarioActual && this.usuarioActual.id === usuario.id;
    },

    // Métodos de asignación rápida
    limpiarAsignaciones() {
      this.nuevoEvento.usuariosAsignadosIds = [];
    },

    asignarATodos() {
      this.nuevoEvento.usuariosAsignadosIds = this.usuarios.map(u => u.id);
    },

    asignarseAMismo() {
      if (this.usuarioActual) {
        this.nuevoEvento.usuariosAsignadosIds = [this.usuarioActual.id];
      }
    },

    cargarDatosEvento(evento) {
      const fechaInicio = new Date(evento.fechaInicio);
      const fechaFin = new Date(evento.fechaFin);

      this.nuevoEvento = {
        titulo: evento.titulo || "",
        categoria: evento.categoria || "",
        descripcion: evento.descripcion || "",
        fechaInicio: this.formatearFechaParaInput(fechaInicio),
        fechaFin: this.formatearFechaParaInput(fechaFin),
        usuariosAsignadosIds: evento.usuariosAsignados?.map(u => u.id) || []
      };
    },

    inicializarFormulario() {
      if (this.fechaSeleccionada) {
        const fecha = new Date(this.fechaSeleccionada);
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(9, 0, 0, 0);
        const fechaFin = new Date(fechaInicio);
        fechaFin.setHours(10, 0, 0, 0);

        this.nuevoEvento.fechaInicio = this.formatearFechaParaInput(fechaInicio);
        this.nuevoEvento.fechaFin = this.formatearFechaParaInput(fechaFin);
      }

      this.limpiarFormulario();
    },

    formatearFechaParaInput(fecha) {
      const year = fecha.getFullYear();
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const day = String(fecha.getDate()).padStart(2, '0');
      const hours = String(fecha.getHours()).padStart(2, '0');
      const minutes = String(fecha.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    validarFechas() {
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

        const eventoData = {
          titulo: this.nuevoEvento.titulo.trim(),
          categoria: this.nuevoEvento.categoria,
          descripcion: this.nuevoEvento.descripcion.trim(),
          fechaInicio: new Date(this.nuevoEvento.fechaInicio).toISOString(),
          fechaFin: new Date(this.nuevoEvento.fechaFin).toISOString(),
          usuariosAsignadosIds: this.nuevoEvento.usuariosAsignadosIds || []
        };

        let eventoGuardado;

        if (this.eventoEditar) {
          eventoGuardado = await eventoService.updateEvento(this.eventoEditar.id, eventoData);
          this.$emit("exito", "Evento actualizado correctamente");
        } else {
          eventoGuardado = await eventoService.createEventoForCurrentUser(eventoData);
          this.$emit("exito", "Evento creado correctamente");
        }

        this.$emit("guardar-evento", eventoGuardado);

      } catch (error) {
        console.error('Error al guardar evento:', error);
        let mensajeError = 'Error al guardar el evento';

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
      if (!this.eventoEditar) {
        this.nuevoEvento.titulo = "";
        this.nuevoEvento.categoria = "";
        this.nuevoEvento.descripcion = "";
        this.nuevoEvento.usuariosAsignadosIds = [];
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