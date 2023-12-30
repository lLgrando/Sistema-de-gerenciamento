const Joi = require('joi');

let schema_signup = Joi.object({
        nome: Joi.string()
            .pattern(/^[A-Z][a-zA-Z]{2,}/)
            .min(4)
            .max(255)
            .required(),

    cnpj: Joi.string()
            .required()
            .pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),

    contato: Joi.string()
            .min(10)
            .max(20)
            .required(),

    email: Joi.string()
            .pattern(/^[\w\.]+@([\w-]+\.)+[\w-]{1,3}\b[a-z]{0}/)
            .required(),

    password: Joi.string()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#])[A-Za-z\d!@#]{8,}$/)
            .min(8)
});

module.exports = schema_signup;