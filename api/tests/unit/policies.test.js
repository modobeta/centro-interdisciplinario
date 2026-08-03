/** Cubre decisiones de acceso por recurso, donde conocer el rol por sí solo no es suficiente. */
const turnPolicy = require('../../src/modules/turnos/turno.policy');
const reportPolicy = require('../../src/modules/informes/informe.policy');

describe('policies de dominio', () => {
  const ownTurn = { prestadorId: 'provider-1' };

  test('un profesional solo accede a su turno', () => {
    expect(turnPolicy.canAccess({ id: 'provider-1', rol: 'profesional' }, ownTurn)).toBe(true);
    expect(turnPolicy.canAccess({ id: 'provider-2', rol: 'profesional' }, ownTurn)).toBe(false);
  });

  test('administración lee informes pero no puede crearlos', () => {
    expect(reportPolicy.canReadAll({ rol: 'administrador' })).toBe(true);
    expect(reportPolicy.canCreateAny({ rol: 'administrador' })).toBe(false);
  });
});
