const normalizeEmail = (value) => value.trim().toLowerCase();
const normalizeDni = (value) => value.replace(/\D/g, '');
const trimNullable = (value) => {
  if (value === null || value === undefined) return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};
const normalizeSearch = (value) => value.trim().replace(/\s+/g, ' ');

module.exports = { normalizeEmail, normalizeDni, trimNullable, normalizeSearch };
