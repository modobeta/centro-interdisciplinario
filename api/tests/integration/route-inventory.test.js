const fs = require('node:fs');
const path = require('node:path');
const request = require('supertest');
const app = require('../../src/app');

const contract = fs.readFileSync(path.resolve(__dirname, '../../docs/contrato-api.md'), 'utf8');
const inventory = contract.slice(contract.indexOf('## 4.'), contract.indexOf('# 5.'));
const endpoints = [...inventory.matchAll(/\|\s*`(GET|POST|PUT|PATCH|DELETE)`\s*\|\s*`(\/[^`]+)`/g)].map((match) => ({ method: match[1].toLowerCase(), path: match[2] }));
const publicPaths = new Set(['/auth/login', '/auth/refresh', '/public/equipo', '/public/servicios', '/health', '/ready']);
const uuid = 'd2719f49-7705-4d8d-9e5b-0d61f53bb825';

describe('inventario contractual', () => {
  test('contiene 76 combinaciones únicas', () => {
    expect(endpoints).toHaveLength(76);
    expect(new Set(endpoints.map(({ method, path: route }) => `${method} ${route}`)).size).toBe(76);
  });

  test('las 70 rutas privadas existen y autentican antes del handler', async () => {
    const privateEndpoints = endpoints.filter(({ path: route }) => !publicPaths.has(route));
    expect(privateEndpoints).toHaveLength(70);
    for (const endpoint of privateEndpoints) {
      const route = `/api/v1${endpoint.path.replace(/:[A-Za-z]+/g, uuid)}`;
      const response = await request(app)[endpoint.method](route);
      expect(response.status).toBe(401);
      expect(response.body.error.code).toBe('AUTHENTICATION_REQUIRED');
    }
  });
});
