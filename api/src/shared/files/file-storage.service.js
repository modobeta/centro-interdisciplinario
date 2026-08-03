/** Coordina persistencia y compensación de imágenes para no dejar archivos huérfanos si falla la base. */
const logger = require('../../config/logger');
const local = require('./local-storage.service');

/**
 * Reemplaza una imagen sin dejar el archivo nuevo si falla la escritura en PostgreSQL.
 * @param {object} options Incluye destino, contenido, URL anterior y callback que persiste la URL nueva.
 * @returns {Promise<string>} URL pública de la imagen confirmada.
 */
const replaceImage = async ({ bucket, buffer, previousUrl, persist }) => {
  const nextUrl = await local.saveImage(bucket, buffer);
  try { await persist(nextUrl); }
  catch (error) { await local.remove(nextUrl); throw error; }
  if (previousUrl) local.remove(previousUrl).catch((error) => logger.warn({ err: error }, 'No se pudo limpiar una imagen anterior'));
  return nextUrl;
};

/**
 * Quita primero la referencia persistida y luego intenta limpiar el archivo físico.
 * @param {object} options Incluye la URL actual y el callback que confirma el cambio en PostgreSQL.
 * @returns {Promise<void>}
 */
const deleteImage = async ({ currentUrl, persist }) => {
  await persist(null);
  if (currentUrl) local.remove(currentUrl).catch((error) => logger.warn({ err: error }, 'No se pudo limpiar una imagen eliminada'));
};

module.exports = { replaceImage, deleteImage };
