export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);//validate data without throwing an error
  if (!result.success) {
    return res.status(400).json({//bad request
      error: {
        message: "Validation failed",
        details: result.error.errors,
      },
    });
  }
  req.body = result.data;
  next();
};
