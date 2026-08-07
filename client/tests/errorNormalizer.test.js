import { describe, expect, it } from 'vitest'
import { normalizeError } from '../src/services/errorNormalizer'
describe('normalizeError',()=>{it('normaliza errores de validación',()=>{const error=normalizeError({response:{status:422,data:{code:'VALIDATION_ERROR',message:'Datos inválidos',details:[{field:'email',message:'Inválido'}]}}});expect(error).toMatchObject({status:422,code:'VALIDATION_ERROR',message:'Datos inválidos',retryable:false,canceled:false})});it('reconoce cancelaciones',()=>{expect(normalizeError({code:'ERR_CANCELED'}).canceled).toBe(true)})})
