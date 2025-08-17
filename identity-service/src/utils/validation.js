import Joi from "joi";

const validateRegistration = (data) => {
 const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    firstName: Joi.string().required(),
    lastName:Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$'))
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      'string.empty': 'Password is required',
    }),
    phoneNumber: Joi.number()
    .integer()
    .min(100000000000)   // Smallest 12-digit number
    .max(999999999999)   // Largest 12-digit number
    .required()
    .messages({
      'number.base': 'Phone number must be a number',
      'number.min': 'Phone number must be exactly 12 digits',
      'number.max': 'Phone number must be exactly 12 digits',
    }),
    identity: Joi.string().required()
  });

  return schema.validate(data);
};



const validateAgentRegistration = (data) => {
 const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    firstName: Joi.string().required(),
    lastName:Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
    .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^\\w\\s]).{8,}$'))
    .required()
    .messages({
      'string.pattern.base': 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
      'string.empty': 'Password is required',
    }),
    phoneNumber: Joi.number()
    .integer()
    .min(100000000000)   // Smallest 12-digit number
    .max(999999999999)   // Largest 12-digit number
    .required()
    .messages({
      'number.base': 'Phone number must be a number',
      'number.min': 'Phone number must be exactly 12 digits',
      'number.max': 'Phone number must be exactly 12 digits',
    }),
    area: Joi.string().required(),
    district: Joi.string().required(),
    sector: Joi.string().required(),
    cell: Joi.string().required(),
    agentCategory: Joi.string().required()
  });

  return schema.validate(data);
};

const validatelogin = (data) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().min(6).required(),
  });

  return schema.validate(data);
};

export {validatelogin,validateRegistration,validateAgentRegistration}