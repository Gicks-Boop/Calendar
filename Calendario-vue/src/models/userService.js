import * as Static from "../middleware/static";

class User {
  #endpoint = "usuarios/";

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

  async getAllUsers() {
    const request = await Static.apiServerRequest(this.#endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!request.ok) {
      throw new Error("Error al obtener usuarios");
    }

    return request.json();
  }

  async getUserById(id) {
    const request = await Static.apiServerRequest(`${this.#endpoint}${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!request.ok) {
      throw new Error("Usuario no encontrado");
    }

    return request.json();
  }

  async createUser(data) {
    const request = await Static.apiServerRequest(this.#endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!request.ok) {
      const errorData = await request.json();
      throw new Error(errorData.message || "Error al crear usuario");
    }

    return request.json();
  }

  async updateUser(id, data) {
    const request = await Static.apiServerRequest(`${this.#endpoint}${id}`, {
      method: "PUT",
      headers: this.#getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return this.#handleResponse(request);
  }

  async deleteUser(id) {
    const request = await Static.apiServerRequest(`${this.#endpoint}${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!request.ok) {
      throw new Error("Error al eliminar usuario");
    }

    return true; // o puedes retornar algún mensaje del servidor si lo deseas
  }

    async getUsersFromSameOffice(usuarioId) {
  if (!usuarioId || usuarioId <= 0) {
    throw new Error("ID de usuario inválido");
  }

  const request = await Static.apiServerRequest(`${this.#endpoint}${usuarioId}/oficina/usuarios`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!request.ok) {
    const errorData = await request.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al obtener usuarios de la oficina");
  }

  return request.json();
}  

 async getMyOfficeUsers() {
  const currentUser = Static.BM_GET_USER_DATA();
  
  if (!currentUser || !currentUser.id) {
    throw new Error("No hay usuario logueado o falta información del usuario");
  }

  return this.getUsersFromSameOffice(currentUser.id);
} 
}

export default User;
