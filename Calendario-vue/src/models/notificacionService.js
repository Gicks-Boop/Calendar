import * as Static from "../middleware/static";

class NotificacionService {
  constructor() {
    this.endpoint = Static.BM_SITE.API_ENDPOINT + "notificaciones/";
  }

  // Obtiene headers con autenticación si está disponible
  getAuthHeaders() {
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
  async handleResponse(request) {
    if (!request.ok) {
      let errorMessage = "Error en la solicitud";
      
      // Manejo específico de códigos de error
      switch (request.status) {
        case 404:
          errorMessage = "Notificación no encontrada";
          break;
        case 401:
          errorMessage = "No autorizado";
          break;
        case 403:
          errorMessage = "Sin permisos";
          break;
        case 500:
          errorMessage = "Error interno del servidor";
          break;
        default:
          try {
            const contentType = request.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errorData = await request.json();
              errorMessage = errorData.message || errorMessage;
            }
          } catch {
            errorMessage = `Error ${request.status}: ${request.statusText}`;
          }
      }
      throw new Error(errorMessage);
    }
    
    // Para respuestas sin contenido (204, 200 vacío), retornar true
    if (request.status === 204) {
      return true;
    }
    
    // Verificar si hay contenido antes de parsear JSON
    const contentType = request.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        return await request.json();
      } catch (error) {
        console.warn("Respuesta exitosa pero no se pudo parsear JSON:", error);
        return true;
      }
    }
    
    return true;
  }

  /**
   * Obtener todas las notificaciones del usuario actual
   */
  async getNotificacionesUsuarioActual() {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }

    const request = await Static.apiServerRequest(`${this.endpoint}usuario/${userData.id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(request);
  }

  /**
   * Obtener notificaciones no leídas del usuario actual
   */
  async getNotificacionesNoLeidas() {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }

    const request = await Static.apiServerRequest(`${this.endpoint}usuario/${userData.id}/no-leidas`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(request);
  }

  /**
   * Marcar notificación como leída
   * @param {number} notificacionId - ID de la notificación
   */
  async marcarComoLeida(notificacionId) {
    const request = await Static.apiServerRequest(`${this.endpoint}${notificacionId}/leido`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(request);
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas() {
    const userData = Static.BM_GET_USER_DATA();
    if (!userData?.id) {
      throw new Error("Usuario no autenticado");
    }

    const request = await Static.apiServerRequest(`${this.endpoint}usuario/${userData.id}/marcar-todas-leidas`, {
      method: "PATCH",
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(request);
  }

  /**
   * Eliminar notificación
   * @param {number} notificacionId - ID de la notificación
   */
  async eliminarNotificacion(notificacionId) {
    const request = await Static.apiServerRequest(`${this.endpoint}${notificacionId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse(request);
  }

  /**
   * Crear nueva notificación
   * @param {string} mensaje - Mensaje de la notificación
   * @param {number} usuarioId - ID del usuario (opcional, usa el actual si no se especifica)
   */
  async crearNotificacion(mensaje, usuarioId = null) {
    const userData = Static.BM_GET_USER_DATA();
    const finalUsuarioId = usuarioId || userData?.id;
    
    if (!finalUsuarioId) {
      throw new Error("Usuario no autenticado");
    }

    const request = await Static.apiServerRequest(this.endpoint, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        usuarioId: finalUsuarioId,
        mensaje: mensaje
      }),
    });
    
    return this.handleResponse(request);
  }
}

export default NotificacionService;