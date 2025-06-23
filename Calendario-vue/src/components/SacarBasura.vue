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
        class="bg-white rounded-lg shadow-xl w-full max-w-2xl transform overflow-y-auto max-h-[90vh]"
        :class="{ 'animate-modal-appear': mostrarModal }"
      >
        <!-- Cabecera del modal -->
        <div
          class="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 sm:px-6 py-4 flex justify-between items-center rounded-t-lg sticky top-0 z-10"
        >
          <h3 class="text-base sm:text-lg font-bold">Asignación automática de tareas de basura</h3>
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
              Esta herramienta asignará automáticamente la tarea de sacar la basura entre las
              personas que agregues, de lunes a viernes. Selecciona el mes para el que deseas
              generar la asignación.
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

          <!-- Listado de personas y formulario para agregar -->
          <div class="mb-6">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium text-gray-700">Personas disponibles:</h4>

              <!-- Botón para limpiar todo -->
              <button
                v-if="personas.length > 0 || asignaciones.length > 0"
                @click="mostrarConfirmacionLimpiarTodo"
                class="text-sm text-red-500 hover:text-red-700 flex items-center"
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
                Limpiar todo
              </button>
            </div>

            <!-- Lista de personas -->
            <div v-if="personas.length > 0" class="mb-4 space-y-2">
              <div
                v-for="(persona, index) in personas"
                :key="index"
                class="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <span class="font-medium truncate max-w-[80%]">{{ persona.nombre }}</span>
                <button
                  @click="eliminarPersona(index)"
                  class="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div
              v-else
              class="mb-4 p-4 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300"
            >
              No hay personas agregadas aún
            </div>

            <!-- Formulario para agregar persona -->
            <div
              class="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-2 sm:space-y-0"
            >
              <input
                v-model="nuevaPersona"
                type="text"
                placeholder="Nombre de la persona"
                class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                @keyup.enter="agregarPersona"
              />
              <button
                @click="agregarPersona"
                class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 sm:flex-shrink-0"
                :disabled="!nuevaPersona.trim()"
              >
                Agregar
              </button>
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
                      <th
                        class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Fecha
                      </th>
                      <th
                        class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Día
                      </th>
                      <th
                        class="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Persona asignada
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr
                      v-for="(asignacion, index) in asignaciones"
                      :key="index"
                      class="hover:bg-gray-50"
                    >
                      <td
                        class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700"
                      >
                        {{ formatearFecha(asignacion.fecha) }}
                      </td>
                      <td
                        class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700"
                      >
                        {{ obtenerDiaSemana(asignacion.fecha) }}
                      </td>
                      <td class="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div class="relative">
                          <!-- Select para cambiar la persona asignada -->
                          <select
                            v-model="asignaciones[index].persona"
                            class="appearance-none w-full text-xs sm:text-sm font-medium px-2 py-1 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500"
                            :style="{
                              backgroundColor: colorPorNombre(asignacion.persona),
                              color: 'white',
                            }"
                          >
                            <option
                              v-for="persona in personas"
                              :key="persona.nombre"
                              :value="persona.nombre"
                              :style="{ backgroundColor: colores[persona.colorIndex] }"
                            >
                              {{ persona.nombre }}
                            </option>
                          </select>
                          <!-- Icono de selector -->
                          <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2"
                          >
                            <svg
                              class="h-4 w-4 text-white opacity-75"
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
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                :disabled="personas.length === 0"
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
                class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  <span class="hidden xs:inline">Guardar en calendario</span>
                  <span class="xs:hidden">Guardar</span>
                </span>
              </button>
            </div>

            <button
              @click="exportarPDF"
              class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
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
          ¿Estás seguro de que deseas eliminar todas las personas y asignaciones? Esta acción no se
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

    <!-- Contenedor oculto para generación de PDF -->
    <div id="pdf-container" ref="pdfContainer" class="hidden"></div>
  </div>
</template>

<script>
// Importar html2pdf
import html2pdf from "html2pdf.js";

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
      personas: [],
      nuevaPersona: "",
      asignaciones: [],
      mostrarModalConfirmacion: false,
      mesSeleccionado: new Date().getMonth(),
      anioSeleccionado: new Date().getFullYear(),
      meses: [
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
      colores: [
        "#4299E1", // azul
        "#48BB78", // verde
        "#ED8936", // naranja
        "#9F7AEA", // morado
        "#F56565", // rojo
        "#38B2AC", // teal
        "#ED64A6", // rosa
        "#667EEA", // indigo
        "#F6AD55", // naranja claro
        "#FC8181", // rojo claro
      ],
    };
  },
  computed: {
    aniosDisponibles() {
      const currentYear = new Date().getFullYear();
      // Generar un array con años desde el actual hasta 3 años en el futuro
      return Array.from({ length: 4 }, (_, i) => currentYear + i);
    },
  },
  methods: {
    cerrarModal() {
      // Aplicar animación de salida
      const modalElement = this.$el.querySelector(".bg-white");
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
        }, 200); // Duración de la animación en ms
      } else {
        // Si por alguna razón no se encuentra el elemento, cerrar inmediatamente
        this.$emit("cerrar");
      }
    },

  

    mostrarConfirmacionLimpiarTodo() {
      this.mostrarModalConfirmacion = true;
    },

    cerrarModalConfirmacion() {
      this.mostrarModalConfirmacion = false;
    },

    limpiarTodo() {
      this.personas = [];
      this.asignaciones = [];
      this.mostrarModalConfirmacion = false;
    },

    limpiarAsignaciones() {
      this.asignaciones = [];
    },

    agregarPersona() {
      if (this.nuevaPersona.trim()) {
        this.personas.push({
          nombre: this.nuevaPersona.trim(),
          colorIndex: this.personas.length % this.colores.length,
        });
        this.nuevaPersona = "";
      }
    },

    eliminarPersona(index) {
      this.personas.splice(index, 1);
      // Actualizar índices de colores
      this.personas.forEach((persona, i) => {
        persona.colorIndex = i % this.colores.length;
      });
    },

    generarAsignaciones() {
      if (this.personas.length === 0) return;

      // Obtener días de lunes a viernes del mes seleccionado
      const asignaciones = [];
      const anio = this.anioSeleccionado;
      const mes = this.mesSeleccionado;
      const ultimoDia = new Date(anio, mes + 1, 0);

      for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        const fecha = new Date(anio, mes, dia);
        const diaSemana = fecha.getDay(); // 0 es domingo, 1 es lunes, ..., 6 es sábado

        // Solo incluir de lunes a viernes (1-5)
        if (diaSemana >= 1 && diaSemana <= 5) {
          asignaciones.push({
            fecha: fecha,
            persona: null,
          });
        }
      }

      // Asignar personas aleatoriamente pero de forma equilibrada
      const nombrePersonas = this.personas.map((p) => p.nombre);
      let personasPorAsignar = [...nombrePersonas];

      for (let i = 0; i < asignaciones.length; i++) {
        // Si se acabaron las personas, reiniciar el array
        if (personasPorAsignar.length === 0) {
          personasPorAsignar = [...nombrePersonas];
        }

        // Seleccionar persona aleatoria del grupo disponible
        const indiceAleatorio = Math.floor(Math.random() * personasPorAsignar.length);
        asignaciones[i].persona = personasPorAsignar[indiceAleatorio];

        // Quitar esa persona de la lista temporal
        personasPorAsignar.splice(indiceAleatorio, 1);
      }

      this.asignaciones = asignaciones;
    },

    guardarAsignaciones() {
      if (this.asignaciones.length === 0) return;

      // Crear eventos para cada asignación
      const eventos = this.asignaciones.map((asignacion) => {
        return {
          titulo: `Sacar basura: ${asignacion.persona}`,
          fecha: new Date(asignacion.fecha), // Asegurarnos de que es un objeto Date
          categoria: "basura",
          descripcion: `Tarea asignada automáticamente a ${asignacion.persona}`,
          hora: "18:00",
          id: Date.now() + Math.random().toString(36).substring(2, 9), // ID único
          color: "#8a4e03", // Color gris fijo para las tareas de basura
        };
      });

      console.log("SacarBasura: Emitiendo guardar-asignaciones con", eventos.length, "eventos");

      // Emitir evento para guardar en el calendario principal
      this.$emit("guardar-asignaciones", eventos);
      this.cerrarModal();
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

        // Preparar datos del mes y año
        const anio = this.anioSeleccionado;
        const mes = this.mesSeleccionado;
        const nombreMes = this.meses[mes];

        // Crear mapa de asignaciones por día
        const asignacionesPorDia = {};
        this.asignaciones.forEach((asignacion) => {
          const dia = asignacion.fecha.getDate();
          asignacionesPorDia[dia] = asignacion.persona;
        });

        // Días de la semana en formato corto
        const diasSemanaCortos = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

        // Añadir título
        element.innerHTML = `
      <div style="text-align: center; margin-bottom: 15px;">
        <h1 style="font-size: 22px; margin: 0; color: #1a56db;">${nombreMes.toUpperCase()} ${anio}</h1>
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

        // Determinar el primer día del mes (0 = Domingo, 1 = Lunes, etc.)
        const primerDia = new Date(anio, mes, 1);
        const ultimoDia = new Date(anio, mes + 1, 0);
        const diasEnMes = ultimoDia.getDate();
        const diaSemanaPrimerDia = primerDia.getDay(); // 0 es domingo

        // Variables para construir el calendario
        let diaActual = 1;

        // Generar filas del calendario
        for (let i = 0; i < 6; i++) {
          // Máximo 6 semanas por mes
          let filaHTML = '<tr style="height: 90px;">';

          for (let j = 0; j < 7; j++) {
            // Determinar si es una celda con fecha del mes actual
            if ((i === 0 && j < diaSemanaPrimerDia) || diaActual > diasEnMes) {
              // Celda vacía (del mes anterior o siguiente)
              filaHTML += `<td style="border: 1px solid #ddd; background-color: #f5f5f5;"></td>`;
            } else {
              // Determinar si es el día actual
              const esDiaActual =
                diaActual === new Date().getDate() &&
                mes === new Date().getMonth() &&
                anio === new Date().getFullYear();

              // Determinar el día de la semana
              const fechaActual = new Date(anio, mes, diaActual);
              const diaSemana = fechaActual.getDay();
              const esLunesAViernes = diaSemana >= 1 && diaSemana <= 5;

              // Determinar el color de fondo según si es día actual o día normal
              let fondoCelda = esDiaActual ? "#ffffff" : "white";
              let colorNumero = esDiaActual ? "white" : "#333";

              // Obtener persona asignada para este día
              const personaAsignada = asignacionesPorDia[diaActual];

              // Contenido de la celda
              let personaHTML = "";
              if (personaAsignada && esLunesAViernes) {
                const colorPersona = this.colorPorNombre(personaAsignada);
                personaHTML = `
                  <div  style="
                    position: absolute;
                    bottom: 5px;
                    left: 0;
                    right: 0;
                    text-align: center;
                    padding: 2px 0;
                    background-color: ${colorPersona}20; /* Color con transparencia */
                    border-top: 1px solid ${colorPersona};
                  ">
                    <span style="
                      font-size: 10px;
                      color: ${colorPersona};
                      font-weight: 600;
                      padding: 2px 5px;
                      border-radius: 3px;
                      display: inline-block;
                      max-width: 90%;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    ">
                      ${personaAsignada}
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

          // Salir si ya hemos mostrado todos los días del mes
          if (diaActual > diasEnMes) break;
        }

        tablaHTML += `
        </tbody>
      </table>
    `;

        element.innerHTML += tablaHTML;

        // Añadir leyenda con las personas
        let leyendaHTML = `
      <div style="margin-top: 20px;">
        <h3 style="font-size: 16px; color: #4169E1; margin-bottom: 8px;">Personas asignadas para sacar la basura:</h3>
        <div style="display: flex; flex-wrap: wrap; gap: 15px;">
    `;

        // Añadir cada persona con su color
        this.personas.forEach((persona) => {
          const color = this.colores[persona.colorIndex];
          leyendaHTML += `
        <div style="display: flex; align-items: center;">
          <span style="display: inline-block; width: 12px; height: 12px; border-radius: 50%;
                background-color: ${color}; margin-right: 5px;"></span>
          <span style="font-size: 13px;">${persona.nombre}</span>
        </div>
      `;
        });

        leyendaHTML += `
        </div>
      </div>

      <div style="margin-top: 15px; text-align: center; font-size: 11px; color: #666;">
        Generado el ${new Date().toLocaleDateString("es-ES")}
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
            logging: true,
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

    nombreMesActual() {
      return this.meses[this.mesSeleccionado];
    },

    colorPorNombre(nombre) {
      // Encontrar persona por nombre
      const persona = this.personas.find((p) => p.nombre === nombre);
      if (!persona) return this.colores[0];

      return this.colores[persona.colorIndex];
    },
    intercambiarAsignacion(indice1, indice2) {
      if (
        indice1 >= 0 &&
        indice1 < this.asignaciones.length &&
        indice2 >= 0 &&
        indice2 < this.asignaciones.length
      ) {
        // Guardar las personas originales
        const persona1 = this.asignaciones[indice1].persona;
        const persona2 = this.asignaciones[indice2].persona;

        // Intercambiar
        this.asignaciones[indice1].persona = persona2;
        this.asignaciones[indice2].persona = persona1;
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
