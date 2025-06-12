import * as Static from "../middleware/static";

class Office {
  #endpoint = "oficinas/";
  constructor() {
    this.#endpoint = Static.BM_SITE.API_ENDPOINT + this.#endpoint;
  }

  async getAllOficinas() {
    const request = await Static.apiServerRequest(this.#endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let response = null;
    if (request.ok) {
      response = await request.json();
    }
    return response;
  }

  async getOficinaById() {
    const request = await Static.apiServerRequest(`${this.#endpoint}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let response = null;
    if (request.ok) {
      response = await request.json();
    }
    return response;
  }

  async createOficina(data) {
    const request = await Static.apiServerRequest(`${this.#endpoint}/${id}`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    let response = null;
    if (request.ok) {
      response = await request.json();
    }
    return response;
  }
}
export default Office;
