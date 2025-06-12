// src/services/userService.js

const API_URL = 'http://localhost:3000/api-v1/usuarios';

export const getAllUsers = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
};

export const getUserById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Usuario no encontrado');
  return res.json();
};

export const createUser = async (usuario) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(usuario),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Error al crear usuario');
  }

  return res.json();
};

export const deleteUser = async (id) => {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Error al eliminar usuario');
  }
};
