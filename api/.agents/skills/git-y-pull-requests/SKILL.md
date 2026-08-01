---
name: git-y-pull-requests
description: Revisa y prepara cambios de esta API para commit, push o pull request cuando el usuario lo solicita explícitamente. Usar para status, diff, staging, commits y PR verificables. No usar implícitamente ni publicar cambios sin autorización directa.
---

# Git y pull requests

## Objetivo

Preparar una entrega pequeña, revisable y respaldada por evidencia, preservando
trabajo ajeno y separando acciones locales de publicación remota.

## Fuentes obligatorias

1. Leer api/AGENTS.md y las instrucciones del repositorio.
2. Inspeccionar git status, rama, diff y log reciente.
3. Identificar archivos preexistentes o cambios no relacionados.
4. Leer las verificaciones reportadas por la tarea implementada.

## Entradas mínimas

- acción autorizada: revisar, stage, commit, push o crear PR;
- alcance exacto de archivos;
- rama y remoto objetivo cuando corresponda;
- resultados de validación;
- convención observable de commits del repositorio.

## Procedimiento

1. Empezar con status y diff de solo lectura.
2. Separar cambios de la tarea de cambios ajenos o previos.
3. Ejecutar o confirmar las verificaciones relevantes antes de preparar entrega.
4. Proponer una unidad de commit coherente y un mensaje alineado con el historial.
5. Agregar al staging únicamente rutas verificadas.
6. Revisar el diff staged antes de confirmar.
7. Crear commit solo si fue solicitado.
8. Hacer push o abrir PR solo si cada acción fue autorizada y el destino está
   confirmado.
9. Redactar el PR con resumen, pruebas, riesgos y limitaciones reales.

## Guardrails

- No usar reset --hard, checkout destructivo, clean o force push.
- No descartar, sobrescribir ni incluir cambios ajenos.
- No mezclar refactors o formato no relacionado.
- No incluir secretos, .env, uploads, caches o artefactos.
- No inventar una convención de commits que el historial no muestra.
- No afirmar CI verde si no se consultó.
- No crear commit, push o PR como consecuencia implícita de implementar código.

## Verificación y salida esperada

- Confirmar diff staged limitado al alcance.
- Confirmar status posterior a cada acción.
- Informar hash y mensaje si hubo commit.
- Informar rama y remoto si hubo push.
- Entregar enlace y estado si se creó PR.
- Declarar con precisión cualquier acción no ejecutada.

## Coordinación

Recibir el resultado verificado de orquestacion-de-cambios-api. Usar tooling de
GitHub solo cuando el usuario pida interacción remota y exista acceso disponible.
