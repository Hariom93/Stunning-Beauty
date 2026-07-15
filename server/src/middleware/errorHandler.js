// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    // In production you might hide stack trace
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
