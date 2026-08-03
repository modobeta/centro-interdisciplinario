/** Normaliza fechas del centro y UTC para que la agenda no dependa de la zona horaria del servidor. */
const { DateTime } = require('luxon');
const env = require('../../config/env');

const parseCivilDate = (value) => DateTime.fromISO(value, { zone: env.timeZone });
const parseLocalDateTime = (date, time) => DateTime.fromISO(`${date}T${time}`, { zone: env.timeZone });
const toUtcIso = (dateTime) => dateTime.toUTC().toISO();
/**
 * Convierte fecha civil, hora local y duración en un intervalo de la zona del centro.
 * @param {{fecha: string, horaInicio: string, duracionMinutos: number}} input Datos de agenda validados.
 * @returns {{start: DateTime, end: DateTime}} Extremos listos para validar y convertir a UTC.
 */
const buildAppointmentInterval = ({ fecha, horaInicio, duracionMinutos }) => {
  const start = parseLocalDateTime(fecha, horaInicio);
  return { start, end: start.plus({ minutes: duracionMinutos }) };
};

module.exports = { parseCivilDate, parseLocalDateTime, toUtcIso, buildAppointmentInterval };
