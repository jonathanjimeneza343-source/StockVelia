import API from './api';

export const login = async (correo, password) => {
    const response = await API.post('/auth/login', { correo, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
    }
    return response.data;
};

export const register = async (datosEmpresaYUsuario) => {
    const response = await API.post('/auth/register', datosEmpresaYUsuario);
    return response.data;
};

export const logout = async () => {
    await API.post('/auth/logout');
    localStorage.removeItem('token');
};

export const solicitarRecuperacion = async (correo) => {
    const response = await API.post('/auth/forgot-password', { correo });
    return response.data;
};

export const restablecerPassword = async (datos) => {
    const response = await API.post('/auth/reset-password', datos);
    return response.data;
};
