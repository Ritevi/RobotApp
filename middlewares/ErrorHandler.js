// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  // set locals, only providing error in development
  const error = { message: 'error', error: err.toString() };
  if (process.env.ENV === 'test') {
    error.ForYou = err;
  }
  res.status(err.status || 500);
  res.json(error);
};
