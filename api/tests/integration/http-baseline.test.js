/** Verifica el contrato HTTP transversal: seguridad, autenticación, errores y disponibilidad. */
const request = require('supertest');
const app = require('../../src/app');

describe('baseline HTTP sin base de datos', () => {
  test('health no consulta PostgreSQL', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
    expect(response.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/);
  });

  test('una ruta inexistente usa el envelope de error', async () => {
    const response = await request(app).get('/api/v1/no-existe');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
    expect(response.body.error).not.toHaveProperty('stack');
  });

  test('un JSON malformado se rechaza sin convertirlo en error interno', async () => {
    const response = await request(app).post('/api/v1/auth/login').set('Origin', 'http://localhost:5173').set('Content-Type', 'application/json').send('{');
    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  test('un archivo público inexistente responde 404', async () => {
    const response = await request(app).get('/uploads/usuarios/no-existe.webp');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
