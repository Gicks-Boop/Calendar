import * as Static from "../middleware/static";

class EventoService {
  #endpoint = "eventos/";
  
  constructor() {
    this.#endpoint = Static.BM_SITE.API_ENDPOINT + this.#endpoint;
  }

  // Obtiene headers con autenticación si está disponible
  #getAuthHeaders() {
    const headers = {
      "Content-Type": "application/json",
    };
    
    const userData = Static.BM_GET_USER_DATA();
    if (userData?.token) {
      headers.Authorization = `Bearer ${userData.token}`;
    }
    
    return headers;
  }

  // Manejo centralizado de errores
  async #handleResponse(request) {
    if (!request.ok) {
      let errorMessage = "Error en la solicitud";
      try {
        const errorData = await request.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear el JSON, usar mensaje por defecto
      }
      throw new Error(errorMessage);
    }
    
    // Para respuestas 204 (No Content), no intentar parsear JSON
    if (request.status === 204) {
      return true;
    }
    
    return request.json();
  }

  /**
   * Obtener todos los eventos con filtros opcionales
   * @param {Object} filters - Filtros opcionales
   * @param {string} filters.categoria - Filtrar por categoría
   * @param {number} filters.usuarioId - Filtrar por usuario
   */
  async getAllEventos(filters = {}) {
    const searchParams = new URLSearchParams();
    
    if (filters.categoria) {
      searchParams.append('categoria', filters.categoria);
    }
    if (filters.usuarioId) {
      searchParams.append('usuarioId', filters.usuarioId);
    }
    
    const url = searchParams.toString() 
      ? `${this.#endpoint}?${searchParams.toString()}`
      : this.#endpoint;

    const request = await Static.apiServerRequest(url, {
      method: "GET",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Obtener eventos ordenados por categoría
   */
  async getEventosOrderedByCategory() {
    const request = await Static.apiServerRequest(`${this.#endpoint}ordenados-por-categoria`, {
      method: "GET",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Obtener eventos por rango de fechas
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   */
  async getEventosByDateRange(fechaInicio, fechaFin) {
    const searchParams = new URLSearchParams({
      fechaInicio,
      fechaFin
    });
    
    const request = await Static.apiServerRequest(
      `${this.#endpoint}rango?${searchParams.toString()}`, 
      {
        method: "GET",
        headers: this.#getAuthHeaders(),
      }
    );
    
    return this.#handleResponse(request);
  }

  /**
   * Obtener eventos de un usuario específico
   * @param {number} usuarioId - ID del usuario
   */
  async getEventosByUsuario(usuarioId) {
    const request = await Static.apiServerRequest(`${this.#endpoint}usuario/${usuarioId}`, {
      method: "GET",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Obtener un evento por ID
   * @param {number} id - ID del evento
   */
  async getEventoById(id) {
    const request = await Static.apiServerRequest(`${this.#endpoint}${id}`, {
      method: "GET",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Crear un nuevo evento
   * @param {Object} data - Datos del evento
   */
  async createEvento(data) {
    const request = await Static.apiServerRequest(this.#endpoint, {
      method: "POST",
      headers: this.#getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Actualizar un evento
   * @param {number} id - ID del evento
   * @param {Object} data - Datos a actualizar
   */
  async updateEvento(id, data) {
    const request = await Static.apiServerRequest(`${this.#endpoint}${id}`, {
      method: "PUT",
      headers: this.#getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Eliminar un evento
   * @param {number} id - ID del evento
   */
  async deleteEvento(id) {
    const request = await Static.apiServerRequest(`${this.#endpoint}${id}`, {
      method: "DELETE",
      headers: this.#getAuthHeaders(),
    });
    
    return this.#handleResponse(request);
  }

  /**
   * Asignar un usuario principal al evento
   * @param {number} eventoId - ID del evento
   * @param {number} usuarioId - ID del usuario
   */
  async asignarUsuario(eventoId, usuarioId) {
    const request = await Static.apiServerRequest(
      `${this.#endpoint}${eventoId}/asignar-usuario/${usuarioId}`,
      {
        method: "POST",
        headers: this.#getAuthHeaders(),
      }
    );
    
    return this.#handleResponse(request);
  }

  /**
   * Remover usuario asignado (convertir en evento global)
   * @param {number} eventoId - ID del evento
   */
  async removerUsuarioAsignado(eventoId) {
    const request = await Static.apiServerRequest(
      `${this.#endpoint}${eventoId}/usuario-asignado`,
      {
        method: "DELETE",
        headers: this.#getAuthHeaders(),
      }
    );
    
    return this.#handleResponse(request);
  }

  /**
   * Agregar participantes al evento
   * @param {number} eventoId - ID del evento
   * @param {number[]} usuarioIds - Array de IDs de usuarios
   */
  async agregarParticipantes(eventoId, usuarioIds) {
    const request = await Static.apiServerRequest(
      `${this.#endpoint}${eventoId}/participantes`,
      {
        method: "POST",
        headers: this.#getAuthHeaders(),
        body: JSON.stringify({ usuarioIds }),
      }
    );
    
    return this.#handleResponse(request);
  }

  /**
   * Remover un participante del evento
   * @param {number} eventoId - ID del evento
   * @param {number} usuarioId - ID del usuario
   */
  async removerParticipante(eventoId, usuarioId) {
    const request = await Static.apiServerRequest(
      `${this.#endpoint}${eventoId}/participantes/${usuarioId}`,
      {
        method: "DELETE",
        headers: this.#getAuthHeaders(),
      }
    );
    
    return this.#handleResponse(request);
  }

  /**
   * Asignar evento a todos los usuarios de una oficina
   * @param {number} eventoId - ID del evento
   * @param {number} oficinaId - ID de la oficina
   */
  async asignarAOficina(eventoId, oficinaId) {
    const request = await Static.apiServerRequest(
      `${this.#endpoint}${eventoId}/asignar-oficina/${oficinaId}`,
      {
        method: "POST",
        headers: this.#getAuthHeaders(),
      }
    );
    
    return this.#handleResponse(request);
  }

  // Métodos de conveniencia para el frontend

  /**
   * Obtener eventos del usuario actual
   */
  async getEventosCurrentUser() {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }
    return this.getEventosByUsuario(userData.id);
  }

  /**
   * Obtener eventos de la oficina del usuario actual
   */
  async getEventosCurrentUserOffice() {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.oficina?.id) {
      throw new Error("Usuario sin oficina asignada");
    }
    // Esto requeriría un endpoint adicional en el backend, por ahora usamos filtro por usuario
    return this.getAllEventos({ usuarioId: userData.id });
  }

  /**
   * Crear evento rápido con datos del usuario actual
   * @param {Object} eventoData - Datos básicos del evento
   */
  async createEventoForCurrentUser(eventoData) {
    const userData = Static.BM_GET_USER_DATA();
    const dataWithUser = {
      ...eventoData,
      usuarioAsignadoId: userData?.id || undefined
    };
    return this.createEvento(dataWithUser);
  }
}

export default EventoService;