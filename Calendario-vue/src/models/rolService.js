import * as Static from "../middleware/static";

class Role {
  #endpoint = "roles/";

  constructor() {
    this.#endpoint = Static.BM_SITE.API_ENDPOINT + this.#endpoint;
  }

  async getAllRoles() {
    const request = await Static.apiServerRequest(this.#endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!request.ok) {
      throw new Error("Error al obtener roles");
    }

    return request.json();
  }

  async getRolById(id) {
    const request = await Static.apiServerRequest(`${this.#endpoint}${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!request.ok) {
      throw new Error("Rol no encontrado");
    }

    return request.json();
  }

  async createRol(data) {
    const request = await Static.apiServerRequest(this.#endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!request.ok) {
      const error = await request.json();
      throw new Error(error.message || "Error al crear rol");
    }

    return request.json();
  }
}

export default Role;
