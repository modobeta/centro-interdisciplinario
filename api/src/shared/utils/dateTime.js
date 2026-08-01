const { DateTime } = require('luxon');
const env = require('../../config/env');

const parseCivilDate = (value) => DateTime.fromISO(value, { zone: env.timeZone });
const parseLocalDateTime = (date, time) => DateTime.fromISO(`${date}T${time}`, { zone: env.timeZone });
const toUtcIso = (dateTime) => dateTime.toUTC().toISO();
const buildAppointmentInterval = ({ fecha, horaInicio, duracionMinutos }) => {
  const start = parseLocalDateTime(fecha, horaInicio);
  return { start, end: start.plus({ minutes: duracionMinutos }) };
};

module.exports = { parseCivilDate, parseLocalDateTime, toUtcIso, buildAppointmentInterval };
