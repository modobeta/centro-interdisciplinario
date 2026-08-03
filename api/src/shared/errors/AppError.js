/** Representa fallos esperados del negocio sin exponer errores internos de infraestructura. */
class AppError extends Error {
  constructor({ code, message, status = 500, details = [], cause } = {}) {
    super(message || 'Ocurrió un error inesperado.', { cause });
    this.name = 'AppError';
    this.code = code || 'INTERNAL_ERROR';
    this.status = status;
    this.details = Array.isArray(details) ? details : [];
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }
}

module.exports = AppError;
