export const errorHandler = (err, req, res, next) => {
  console.error(`[Express Error] ${err.stack || err.message}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || 'Internal System Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};
