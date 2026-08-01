const validate = require('../../src/shared/middlewares/validate');
const authValidation = require('../../src/modules/auth/auth.validation');
const messagingValidation = require('../../src/modules/mensajeria/mensajeria.validation');

const run = (schema, request) => new Promise((resolve) => validate(schema)(request, {}, resolve));

describe('validación y sanitización', () => {
  test('normaliza email y DNI de login', async () => {
    const req = { body: { email: '  PERSONA@EXAMPLE.COM ', dni: '12.345.678' }, params: {}, query: {} };
    await expect(run(authValidation.login, req)).resolves.toBeUndefined();
    expect(req.body).toEqual({ email: 'persona@example.com', dni: '12345678' });
  });

  test('rechaza campos no contractuales', async () => {
    const req = { body: { email: 'persona@example.com', dni: '12345678', admin: true }, params: {}, query: {} };
    const error = await run(authValidation.login, req);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.status).toBe(400);
  });

  test('exige cursor compuesto en mensajes', async () => {
    const req = { params: { id: 'd2719f49-7705-4d8d-9e5b-0d61f53bb825' }, query: { beforeId: 'f2719f49-7705-4d8d-9e5b-0d61f53bb825' }, body: {} };
    const error = await run(messagingValidation.messages, req);
    expect(error.code).toBe('VALIDATION_ERROR');
  });
});
