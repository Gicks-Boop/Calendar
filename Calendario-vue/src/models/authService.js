import * as Static from "../middleware/static";

class Auth{
  #endpoint = "auth/login";
  constructor() {
    this.#endpoint = Static.BM_SITE.API_ENDPOINT + this.#endpoint;
  }

  async loginUsuario(email, password) {
    const request = await Static.apiServerRequest(this.#endpoint, {
      method: "POST",
      body: JSON.stringify({ email, password }),
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
export default Auth;

  