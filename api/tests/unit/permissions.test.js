/** Verifica que el catálogo de permisos y el middleware de autorización permanezcan alineados. */
const authorize = require('../../src/shared/middlewares/authorize');
const { PERMISSIONS, ROLE_PERMISSIONS } = require('../../src/shared/constants/permissions');

describe('catálogo RBAC', () => {
  test('define exactamente 29 permisos únicos', () => {
    const values = Object.values(PERMISSIONS);
    expect(values).toHaveLength(29);
    expect(new Set(values).size).toBe(29);
  });

  test.each(Object.entries(ROLE_PERMISSIONS))('%s permite y deniega según su asignación', (role, assigned) => {
    const observed = [];
    for (const permission of Object.values(PERMISSIONS)) {
      const next = jest.fn();
      authorize(permission)({ actor: { rol: role } }, {}, next);
      const value = next.mock.calls[0][0];
      observed.push(value === undefined ? permission : `${value.code}:${value.status}`);
    }
    const expected = Object.values(PERMISSIONS).map((permission) => assigned.includes(permission) ? permission : 'FORBIDDEN:403');
    expect(observed).toEqual(expected);
  });
});
