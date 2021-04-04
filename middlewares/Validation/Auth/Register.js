const joi = require('joi');

const RegisterSchema = joi.object({
  username: joi.string().required(),
  password: joi.string().required(),
  email: joi.string().email().required(),
});

module.exports = async (req, res, next) => {
  try {
    await RegisterSchema.validateAsync(req.body);
    next();
  } catch (err) {
    next(err);
  }
};
