/** Comparte cálculos de paginación para que listados distintos devuelvan metadatos consistentes. */
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const getPagination = ({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = {}) => ({
  page: Number(page),
  limit: Math.min(Number(limit), MAX_LIMIT),
  offset: (Number(page) - 1) * Math.min(Number(limit), MAX_LIMIT)
});

const paginationMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: total === 0 ? 0 : Math.ceil(total / limit)
});

module.exports = { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT, getPagination, paginationMeta };
