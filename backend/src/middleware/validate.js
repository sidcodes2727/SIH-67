import Joi from 'joi';

// Updated schema to accept a single record with all metal concentrations
// Required: latitude, longitude, timestamp
// Optional (default 0): pb, cd, as_metal, hg, cr
const schema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  timestamp: Joi.date().required(),
  pb: Joi.number().min(0).optional().default(0),
  cd: Joi.number().min(0).optional().default(0),
  as_metal: Joi.number().min(0).optional().default(0),
  hg: Joi.number().min(0).optional().default(0),
  cr: Joi.number().min(0).optional().default(0),
});

export const validateRecord = (req, res, next) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.message });
  req.body = value; // use normalized values with defaults
  return next();
};
