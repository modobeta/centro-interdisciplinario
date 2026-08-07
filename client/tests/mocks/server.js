import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
export const server = setupServer(
  http.post('http://localhost:3000/auth/refresh', () => HttpResponse.json({ code: 'AUTH_REQUIRED', message: 'Sin sesión' }, { status: 401 })),
  http.get('http://localhost:3000/public/servicios', () => HttpResponse.json({ data: [] })),
  http.get('http://localhost:3000/public/equipo', () => HttpResponse.json({ data: [] })),
)
