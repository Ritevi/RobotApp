const joi = require('joi');

const loginSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().required(),
  fingerprint: joi.string().required(),
});

module.exports = async (req, res, next) => {
  try {
    await loginSchema.validateAsync(req.body);
    await joi.assert(req.headers['user-agent'], joi.string().required().messages({
      'any.required': 'user-agent is required',
      'string.base': 'user-agent nust be string',
    }));
    next();
  } catch (err) {
    next(err);
  }
};
