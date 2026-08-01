const multer = require('multer');
const env = require('../../config/env');
const AppError = require('../errors/AppError');

module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.upload.maxBytes, files: 1, fields: 0 },
  fileFilter: (_req, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) callback(new AppError({ code: 'IMAGEN_TIPO_INVALIDO', message: 'El tipo de imagen no está permitido.', status: 422 }));
    else callback(null, true);
  }
}).single('imagen');
