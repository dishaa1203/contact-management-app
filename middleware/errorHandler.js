const { constants } = require("../constants");

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;

  switch (statusCode) {
    case constants.VALIDATION_ERROR:
      res.status(statusCode).json({
        success: false,
        title: "Validation Error",
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;

    case constants.UNAUTHORIZED:
      res.status(statusCode).json({
        success: false,
        title: "Unauthorized",
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;

    case constants.FORBIDDEN:
      res.status(statusCode).json({
        success: false,
        title: "Forbidden",
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;

    case constants.NOT_FOUND:
      res.status(statusCode).json({
        success: false,
        title: "Not Found",
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;

    case constants.SERVER_ERROR:
    default:
      res.status(500).json({
        success: false,
        title: "Server Error",
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
      });
      break;
  }
};

module.exports = errorHandler;
