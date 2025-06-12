const API_URL = 'http://localhost:3000/api-v1/auth';

export async function loginUsuario(email, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error en el inicio de sesión');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message || 'Fallo en la conexión al servidor');
  }
}
