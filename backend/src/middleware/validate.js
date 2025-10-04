import Joi from 'joi';

const schema = Joi.object({
  metal_type: Joi.string().valid('Pb', 'Cd', 'As', 'Hg', 'Cr').required(),
  concentration: Joi.number().min(0).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  timestamp: Joi.date().required(),
});

export const validateRecord = (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(400).json({ message: error.message });
  return next();
};
