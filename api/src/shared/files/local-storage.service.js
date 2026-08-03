/** Implementa almacenamiento local detrás de una interfaz reemplazable por un proveedor productivo. */
const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const env = require('../../config/env');
const { detectImage } = require('./image-validation');

const allowedBuckets = new Set(['usuarios', 'servicios']);
const bucketPath = (bucket) => {
  if (!allowedBuckets.has(bucket)) throw new Error('Bucket de archivos inválido.');
  return path.join(env.upload.root, bucket);
};
const publicPath = (bucket, filename) => `/uploads/${bucket}/${filename}`;
const physicalPath = (url) => {
  if (!url?.startsWith('/uploads/')) return null;
  const target = path.resolve(env.upload.root, url.slice('/uploads/'.length));
  if (!target.startsWith(`${env.upload.root}${path.sep}`)) throw new Error('Ruta de archivo inválida.');
  return target;
};

const saveImage = async (bucket, buffer) => {
  const image = detectImage(buffer);
  const directory = bucketPath(bucket);
  await fs.mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.${image.extension}`;
  await fs.writeFile(path.join(directory, filename), buffer, { flag: 'wx' });
  return publicPath(bucket, filename);
};

const remove = async (url) => {
  const target = physicalPath(url);
  if (!target) return;
  try { await fs.unlink(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
};

module.exports = { saveImage, remove, physicalPath };
