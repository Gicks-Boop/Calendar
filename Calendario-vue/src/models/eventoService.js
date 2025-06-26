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

  // ===== MÉTODOS PRINCIPALES =====

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
   * @param {number} usuarioId - ID del usuario (opcional, para filtrar)
   */
  async getEventosByDateRange(fechaInicio, fechaFin, usuarioId = null) {
    const searchParams = new URLSearchParams({
      fechaInicio,
      fechaFin
    });
    
    // Agregar usuarioId si se proporciona
    if (usuarioId) {
      searchParams.append('usuarioId', usuarioId.toString());
    }
    
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
   * Obtener eventos por rango de fechas para el usuario actual
   * @param {string} fechaInicio - Fecha de inicio (YYYY-MM-DD)
   * @param {string} fechaFin - Fecha de fin (YYYY-MM-DD)
   */
  async getEventosByDateRangeForCurrentUser(fechaInicio, fechaFin) {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }
    
    return this.getEventosByDateRange(fechaInicio, fechaFin, userData.id);
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
   * Obtener eventos de la oficina del usuario
   * @param {number} usuarioId - ID del usuario
   */
  async getEventosDeOficinaByUsuario(usuarioId) {
    const request = await Static.apiServerRequest(`${this.#endpoint}oficina/usuario/${usuarioId}`, {
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

  // ===== MÉTODOS DE ASIGNACIÓN DE USUARIOS =====

  /**
   * Asignar usuarios al evento (reemplaza asignación anterior)
   * @param {number} eventoId - ID del evento
   * @param {number[]} usuariosIds - Array de IDs de usuarios
   */
  async asignarUsuarios(eventoId, usuariosIds) {
    const request = await Static.apiServerRequest(
      `${this.#endpoint}${eventoId}/usuarios`,
      {
        method: "PUT",
        headers: this.#getAuthHeaders(),
        body: JSON.stringify({ usuariosIds }),
      }
    );
    
    return this.#handleResponse(request);
  }

  /**
   * Agregar usuarios adicionales al evento (sin reemplazar)
   * @param {number} eventoId - ID del evento
   * @param {number[]} usuariosIds - Array de IDs de usuarios
   */
  async agregarUsuarios(eventoId, usuariosIds) {
    const request = await Static.apiServerRequest(
      `${this.#endpoint}${eventoId}/usuarios`,
      {
        method: "POST",
        headers: this.#getAuthHeaders(),
        body: JSON.stringify({ usuariosIds }),
      }
    );
    
    return this.#handleResponse(request);
  }

  /**
   * Remover un usuario específico del evento
   * @param {number} eventoId - ID del evento
   * @param {number} usuarioId - ID del usuario
   */
  async removerUsuario(eventoId, usuarioId) {
    const request = await Static.apiServerRequest(
      `${this.#endpoint}${eventoId}/usuarios/${usuarioId}`,
      {
        method: "DELETE",
        headers: this.#getAuthHeaders(),
      }
    );
    
    return this.#handleResponse(request);
  }

  /**
   * Asignar evento a todos los usuarios de la oficina del evento
   * @param {number} eventoId - ID del evento
   */
  async asignarATodaLaOficina(eventoId) {
    const request = await Static.apiServerRequest(
      `${this.#endpoint}${eventoId}/asignar-toda-oficina`,
      {
        method: "POST",
        headers: this.#getAuthHeaders(),
      }
    );
    
    return this.#handleResponse(request);
  }

  // ===== MÉTODOS LEGACY (mantenidos para compatibilidad) =====

  /**
   * @deprecated Usar asignarUsuarios() en su lugar
   * Asignar un usuario principal al evento
   * @param {number} eventoId - ID del evento
   * @param {number} usuarioId - ID del usuario
   */
  async asignarUsuario(eventoId, usuarioId) {
    return this.asignarUsuarios(eventoId, [usuarioId]);
  }

  /**
   * @deprecated Usar asignarUsuarios([]) en su lugar
   * Remover usuario asignado (convertir en evento global)
   * @param {number} eventoId - ID del evento
   */
  async removerUsuarioAsignado(eventoId) {
    return this.asignarUsuarios(eventoId, []);
  }

  /**
   * @deprecated Usar agregarUsuarios() en su lugar
   * Agregar participantes al evento
   * @param {number} eventoId - ID del evento
   * @param {number[]} usuarioIds - Array de IDs de usuarios
   */
  async agregarParticipantes(eventoId, usuarioIds) {
    return this.agregarUsuarios(eventoId, usuarioIds);
  }

  /**
   * @deprecated Usar removerUsuario() en su lugar
   * Remover un participante del evento
   * @param {number} eventoId - ID del evento
   * @param {number} usuarioId - ID del usuario
   */
  async removerParticipante(eventoId, usuarioId) {
    return this.removerUsuario(eventoId, usuarioId);
  }

  /**
   * @deprecated Usar asignarATodaLaOficina() en su lugar
   * Asignar evento a todos los usuarios de una oficina
   * @param {number} eventoId - ID del evento
   * @param {number} oficinaId - ID de la oficina (ya no se usa)
   */
  async asignarAOficina(eventoId, oficinaId) {
    return this.asignarATodaLaOficina(eventoId);
  }

  // ===== MÉTODOS DE CONVENIENCIA PARA EL FRONTEND =====

  /**
   * Obtener eventos completos del usuario actual (asignados + globales de oficina)
   */
  async getEventosCurrentUserWithGlobals() {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }
    
    return this.getAllEventos({ usuarioId: userData.id });
  }

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
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }
    return this.getEventosDeOficinaByUsuario(userData.id);
  }

  /**
   * Obtener eventos de la oficina del usuario actual
   */
  async getEventosDeOficinaActual() {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }
    return this.getEventosDeOficinaByUsuario(userData.id);
  }

  /**
   * Crear evento para el usuario actual
   * @param {Object} eventoData - Datos del evento
   */
  async createEventoForCurrentUser(eventoData) {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }
    
    // Validar que el usuario tenga oficina
    const oficinaNombre = userData.oficina;
    if (!oficinaNombre) {
      throw new Error("Usuario sin oficina asignada");
    }
    
    const dataWithUser = {
      ...eventoData,
      creadorId: userData.id,
      oficinaNombre: oficinaNombre,
    };
    
    console.log("Datos del evento a crear:", dataWithUser);
    
    return this.createEvento(dataWithUser);
  }

  /**
   * Asignar el usuario actual a un evento
   * @param {number} eventoId - ID del evento
   */
  async asignarseAEvento(eventoId) {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }
    
    return this.agregarUsuarios(eventoId, [userData.id]);
  }

  /**
   * Remover al usuario actual de un evento
   * @param {number} eventoId - ID del evento
   */
  async removerseDeEvento(eventoId) {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }
    
    return this.removerUsuario(eventoId, userData.id);
  }
}

export default EventoService;