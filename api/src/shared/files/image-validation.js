/** Valida el contenido real de una imagen porque el MIME enviado por el cliente no es confiable. */
const AppError = require('../errors/AppError');

const detectImage = (buffer) => {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { extension: 'jpg', mime: 'image/jpeg' };
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { extension: 'png', mime: 'image/png' };
  if (buffer.length >= 12 && buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP') return { extension: 'webp', mime: 'image/webp' };
  throw new AppError({ code: 'IMAGEN_TIPO_INVALIDO', message: 'El archivo no es una imagen JPEG, PNG o WebP válida.', status: 422 });
};

module.exports = { detectImage };
