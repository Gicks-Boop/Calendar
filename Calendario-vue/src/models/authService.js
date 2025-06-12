import * as Static from "../middleware/static";

class Auth{
  #endpoint = "auth/";
  constructor() {
    this.#endpoint = Static.BM_SITE.API_ENDPOINT + this.#endpoint;
  }

  async loginUsuario(email, password) {
    const request = await Static.apiServerRequest(this.#endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let response = null;
    if (request.status === 200) {
      response = await request.json();
    }
    return response;
  }
}
export default Auth;
