const API_URL = 'http://localhost:3000/api-v1/roles';

export const getAllRoles = async () => {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Error al obtener roles');
    return res.json();
}

export const getRolById = async (id) => {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error('Rol no encontrado');
    return res.json();
};

export const createRol = async (rol) => {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(rol),
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al crear rol');
    }

    return res.json();
};