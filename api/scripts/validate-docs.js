const fs = require('node:fs');
const path = require('node:path');

const docsDirectory = path.resolve(__dirname, '../docs');
const files = fs.readdirSync(docsDirectory).filter((name) => name.endsWith('.md'));
const failures = [];

for (const file of files) {
  const content = fs.readFileSync(path.join(docsDirectory, file), 'utf8');
  const fences = content.split('\n').filter((line) => line.startsWith('```')).length;
  if (fences % 2 !== 0) failures.push(`${file}: bloque de código sin cerrar`);
  if (!/^# /m.test(content)) failures.push(`${file}: falta encabezado principal`);
  for (const match of content.matchAll(/\[[^\]]+\]\(([^)]+\.md)(?:#[^)]+)?\)/g)) {
    if (!fs.existsSync(path.resolve(docsDirectory, match[1]))) failures.push(`${file}: enlace inexistente ${match[1]}`);
  }
}

const contract = fs.readFileSync(path.join(docsDirectory, 'contrato-api.md'), 'utf8');
const inventory = contract.slice(contract.indexOf('## 4.'), contract.indexOf('# 5.'));
const endpointMatches = [...inventory.matchAll(/\|\s*`(GET|POST|PUT|PATCH|DELETE)`\s*\|\s*`(\/[^`]+)`/g)];
const endpoints = endpointMatches.map((match) => `${match[1]} ${match[2]}`);
if (endpoints.length !== 76) failures.push(`contrato-api.md: se esperaban 76 endpoints y se encontraron ${endpoints.length}`);
if (new Set(endpoints).size !== endpoints.length) failures.push('contrato-api.md: existen endpoints duplicados');
for (const forbidden of ['profesionalId', 'participants', '"funcion"']) if (contract.includes(forbidden)) failures.push(`contrato-api.md: nombre contractual obsoleto ${forbidden}`);

const walk = (directory) => fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]);
const source = walk(path.resolve(__dirname, '../src')).filter((file) => file.endsWith('.js')).map((file) => fs.readFileSync(file, 'utf8')).join('\n');
const catalog = new Set([...contract.matchAll(/^([A-Z][A-Z0-9_]+)$/gm)].map((match) => match[1]));
const usedCodes = new Set([...source.matchAll(/code:\s*['"]([A-Z][A-Z0-9_]+)['"]/g)].map((match) => match[1]));
for (const code of usedCodes) if (!catalog.has(code)) failures.push(`código usado pero ausente del contrato: ${code}`);

if (failures.length) {
  process.stderr.write(`Documentación inválida: ${failures.join('; ')}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Documentación validada: ${files.length} archivos y ${endpoints.length} endpoints únicos.\n`);
}
