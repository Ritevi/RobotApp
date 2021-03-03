const joi = require('joi');

const loginSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().required(),
  fingerprint: joi.string().required(),
  ua: joi.string().required(),
});

module.exports = async (req, res, next) => {
  try {
    await loginSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};
