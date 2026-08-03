/** Cubre el formato y las defensas criptográficas de tokens sin depender de PostgreSQL. */
const auth = require('../../src/modules/auth/auth.service');

describe('refresh tokens', () => {
  test('rechaza formatos incompletos o con segmentos extra', () => {
    expect(auth.parseRefresh('invalido')).toBeNull();
    expect(auth.parseRefresh('d2719f49-7705-4d8d-9e5b-0d61f53bb825.a.b')).toBeNull();
  });
});
