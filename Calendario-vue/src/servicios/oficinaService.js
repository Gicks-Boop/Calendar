
const API_URL = 'http://localhost:3000/api-v1/oficinas';

export const getAllOficinas = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error('Error al obtener oficinas');
  return res.json();
};

export const getOficinaById = async (id) => {
  const res = await fetch(`${API_URL}/${id}`);
  if (!res.ok) throw new Error('Oficina no encontrada');
  return res.json();
};

export const createOficina = async (oficina) => {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(oficina),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Error al crear oficina');
  }

  return res.json();
};
