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
            {{ eventoEditar ? "Editar tarea" : "Agendar tarea" }}: {{ fechaFormateada }}
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

            <!-- Selector de categoría -->
            <div class="mb-4">
              <label for="categoria" class="block text-sm font-medium text-gray-700 mb-1"
                >Categoría</label
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

            <!-- Campo para descripción o notas -->
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

            <!-- Hora del evento (opcional) -->
            <div class="mb-4">
              <label for="hora" class="block text-sm font-medium text-gray-700 mb-1"
                >Hora (opcional)</label
              >
              <input
                type="time"
                id="hora"
                v-model="nuevoEvento.hora"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <!-- Botones de acción -->
            <div class="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                @click="cerrarModal"
                class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {{ eventoEditar ? "Actualizar" : "Guardar" }} evento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
        { nombre: "Personal", valor: "personal", color: "#48bb78" },
        { nombre: "Importante", valor: "importante", color: "#fc2f2c" },
        { nombre: "Basura", valor: "basura", color: "#8a4e03" },
        { nombre: "Cumpleaños", valor: "cumpleaños", color: "#e64e81" },
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
        hora: "",
      },
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
  },
  watch: {
    // Observar cambios en eventoEditar para cargar datos cuando se edita
    eventoEditar(evento) {
      if (evento) {
        this.nuevoEvento = {
          titulo: evento.titulo || "",
          categoria: evento.categoria || "",
          descripcion: evento.descripcion || "",
          hora: evento.hora || "",
        };
      }
    },
    // Observar cambios en el modal para limpiar el formulario cuando se cierra
    mostrarModal(visible) {
      if (!visible) {
        // No limpiar inmediatamente para permitir que los datos persistan
        // hasta que el modal se cierre completamente
        setTimeout(() => {
          if (!this.mostrarModal && !this.eventoEditar) {
            this.limpiarFormulario();
          }
        }, 300);
      } else if (visible && !this.eventoEditar) {
        // Si se abre el modal y no estamos editando, limpiar el formulario
        this.limpiarFormulario();
      }
    },
  },
  methods: {
    cerrarModal() {
      this.$emit("cerrar");
    },
    obtenerColorCategoria(categoriaValor) {
      const categoria = this.categorias.find((cat) => cat.valor === categoriaValor);
      return categoria ? categoria.color : "#999999";
    },
    guardarEvento() {
      let evento;

      if (this.eventoEditar) {
        // Actualizar evento existente
        evento = {
          ...this.eventoEditar,
          titulo: this.nuevoEvento.titulo,
          categoria: this.nuevoEvento.categoria,
          descripcion: this.nuevoEvento.descripcion,
          hora: this.nuevoEvento.hora,
          color: this.obtenerColorCategoria(this.nuevoEvento.categoria),
        };
      } else {
        // Crear nuevo evento
        evento = {
          ...this.nuevoEvento,
          fecha: new Date(this.fechaSeleccionada),
          id: Date.now() + Math.random().toString(36).substring(2, 9), // ID único más seguro
          color: this.obtenerColorCategoria(this.nuevoEvento.categoria),
        };
      }

      this.$emit("guardar-evento", evento);
    },
    limpiarFormulario() {
      this.nuevoEvento = {
        titulo: "",
        categoria: "",
        descripcion: "",
        hora: "",
      };
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
