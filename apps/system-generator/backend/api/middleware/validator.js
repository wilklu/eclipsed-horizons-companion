import { validateEntity } from "../../data/validators/jsonValidator.js";

export function validateBody(entityType) {
  return function validatorMiddleware(req, res, next) {
    const validation = validateEntity(req.body, entityType);

    if (!validation.valid) {
      return res.status(400).json({
        error: "Validation failed",
        entityType,
        details: validation.errorMessages,
      });
    }

    return next();
  };
}
