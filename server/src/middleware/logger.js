
const logger = (req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const duration = Number(process.hrtime.bigint() - startTime) / 1e6;

    console.log(
      JSON.stringify({
        method: req.method,
        path: req.originalUrl,
        status: res.statusCode,
        duration: `${duration.toFixed(2)} ms`,
        timestamp: new Date().toISOString(),
      })
    );
  });

  next();
};

module.exports = logger;
