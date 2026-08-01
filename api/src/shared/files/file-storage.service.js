const logger = require('../../config/logger');
const local = require('./local-storage.service');

const replaceImage = async ({ bucket, buffer, previousUrl, persist }) => {
  const nextUrl = await local.saveImage(bucket, buffer);
  try { await persist(nextUrl); }
  catch (error) { await local.remove(nextUrl); throw error; }
  if (previousUrl) local.remove(previousUrl).catch((error) => logger.warn({ err: error }, 'No se pudo limpiar una imagen anterior'));
  return nextUrl;
};

const deleteImage = async ({ currentUrl, persist }) => {
  await persist(null);
  if (currentUrl) local.remove(currentUrl).catch((error) => logger.warn({ err: error }, 'No se pudo limpiar una imagen eliminada'));
};

module.exports = { replaceImage, deleteImage };
