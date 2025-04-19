const API_URL = process.env.REACT_APP_API_URL || 'https://recipe-finder-atlas-version-backend.onrender.com';
const UPLOADS_URL = `${API_URL}/uploads`;

export const config = {
    API_URL,
    UPLOADS_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    authHeaders: (token) => ({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'x-auth-token': token,
        'Authorization': `Bearer ${token}`
    }),
    fetchOptions: {
        credentials: 'include',
        mode: 'cors'
    }
}; 