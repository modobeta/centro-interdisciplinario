const Joi = require('joi');
const { normalizeDni } = require('../../shared/utils/sanitize');

module.exports = {
  login: {
    body: Joi.object({
      email: Joi.string().trim().lowercase().email().max(254).required(),
      dni: Joi.string().custom((value) => normalizeDni(value)).pattern(/^\d{7,20}$/).required()
    })
  }
};
