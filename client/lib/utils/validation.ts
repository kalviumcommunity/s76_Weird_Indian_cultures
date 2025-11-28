import Joi from 'joi';
import mongoose from 'mongoose';

export const objectIdValidator = Joi.string()
  .trim()
  .custom((value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      return helpers.error('any.invalid');
    }
    return value;
  }, 'ObjectId validation')
  .messages({ 'any.invalid': 'Invalid ID format' });

export const postValidationSchema = Joi.object({
  caption: Joi.string().min(1).max(2200).required(),
  location: Joi.string().max(100).allow('').optional(),
  tags: Joi.string().max(200).allow('').optional(),
  created_by: objectIdValidator.required(),
});

export const updateValidationSchema = postValidationSchema.fork(
  'created_by',
  (schema) => schema.optional()
);

export function validateObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function sanitizeId(value: any): string {
  return typeof value === 'string' ? value.trim() : value;
}
