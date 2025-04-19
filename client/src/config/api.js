const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const UPLOADS_URL = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads';

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
        'Authorization': `Bearer ${token}`
    }),
    fetchOptions: {
        credentials: 'include',
        mode: 'cors'
    }
}; 