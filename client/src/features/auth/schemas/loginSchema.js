import Joi from 'joi'

export const loginSchema = Joi.object({
  email: Joi.string().email({ tlds: { allow: false } }).max(254).required().messages({ 'string.empty': 'Ingresá tu correo.', 'string.email': 'Ingresá un correo válido.' }),
  dni: Joi.string().pattern(/^\d{7,20}$/).required().messages({ 'string.empty': 'Ingresá tu DNI.', 'string.pattern.base': 'Ingresá entre 7 y 20 dígitos.' }),
})
