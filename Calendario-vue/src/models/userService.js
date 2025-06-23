import * as Static from "../middleware/static";

class User {
  #endpoint = "usuarios/";

  constructor() {
    this.#endpoint = Static.BM_SITE.API_ENDPOINT + this.#endpoint;
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
}

export default User;
