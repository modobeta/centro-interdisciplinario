/** Define estados y transiciones válidas para que toda la agenda aplique el mismo ciclo de vida. */
const APPOINTMENT_STATES = Object.freeze({ PENDING: 'pendiente', CONFIRMED: 'confirmado', COMPLETED: 'completado', CANCELLED: 'cancelado', ABSENT: 'ausente' });
const TERMINAL_STATES = Object.freeze([APPOINTMENT_STATES.COMPLETED, APPOINTMENT_STATES.CANCELLED, APPOINTMENT_STATES.ABSENT]);

module.exports = { APPOINTMENT_STATES, TERMINAL_STATES };
