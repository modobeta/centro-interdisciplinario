import Joi from 'joi'
const id=Joi.string().guid({version:['uuidv4','uuidv5']}).required()
export const appointmentSchema=Joi.object({pacienteId:id,prestadorId:id,servicioId:id,consultorioId:id,fecha:Joi.date().iso().min('now').required(),horaInicio:Joi.string().pattern(/^([01]\d|20):[0-5]\d$/).required(),duracionMinutos:Joi.number().valid(30,45,60,90,120).required(),observacionAdministrativa:Joi.string().allow('',null).max(1000),notasInternas:Joi.string().allow('',null).max(2000)})
