/** Traduce errores conocidos al contrato HTTP y oculta detalles internos en fallos inesperados. */
const multer = require('multer');
const AppError = require('../errors/AppError');
const auditFailure = require('./auditFailure');

module.exports = (logger) => async (error, req, res, _next) => {
  let normalized = error;
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    normalized = new AppError({ code: 'IMAGEN_DEMASIADO_GRANDE', message: 'La imagen supera el tamaño permitido.', status: 413 });
  } else if (error.type === 'entity.parse.failed') {
    normalized = new AppError({ code: 'VALIDATION_ERROR', message: 'El JSON enviado no es válido.', status: 400 });
  } else if (error.type === 'entity.too.large') {
    normalized = new AppError({ code: 'VALIDATION_ERROR', message: 'El cuerpo de la solicitud supera el límite permitido.', status: 413 });
  } else if (error.status === 404) {
    normalized = new AppError({ code: 'NOT_FOUND', message: 'Recurso no encontrado.', status: 404 });
  } else if (!(error instanceof AppError)) {
    normalized = new AppError({ code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.', status: 500, cause: error });
  }

  const logPayload = { correlationId: req.correlationId, code: normalized.code, method: req.method, route: req.route?.path || req.path, status: normalized.status };
  if (normalized.status >= 500) logger.error({ ...logPayload, err: error }, 'Request failed');
  else logger.warn(logPayload, 'Request rejected');

  await auditFailure(req, normalized.code);

  res.status(normalized.status).json({
    error: {
      code: normalized.code,
      message: normalized.message,
      details: normalized.details,
      correlationId: req.correlationId
    }
  });
};
