const { DateTime } = require('luxon');
const { interval } = require('../../src/modules/turnos/turno.service');

describe('intervalos de turnos', () => {
  test('convierte un horario local válido a UTC', () => {
    const tomorrow = DateTime.now().setZone('America/Argentina/Cordoba').plus({ days: 1 });
    const weekday = tomorrow.weekday === 7 ? tomorrow.plus({ days: 1 }) : tomorrow;
    const result = interval({ fecha: weekday.toISODate(), horaInicio: '10:30', duracionMinutos: 60 });
    expect(result.finAt.getTime() - result.inicioAt.getTime()).toBe(3600000);
  });

  test('rechaza comienzos fuera de la grilla de 15 minutos', () => {
    const tomorrow = DateTime.now().setZone('America/Argentina/Cordoba').plus({ days: 2 });
    const weekday = tomorrow.weekday === 7 ? tomorrow.plus({ days: 1 }) : tomorrow;
    expect(() => interval({ fecha: weekday.toISODate(), horaInicio: '10:10', duracionMinutos: 60 })).toThrow(expect.objectContaining({ code: 'TURNO_HORARIO_INVALIDO' }));
  });
});
