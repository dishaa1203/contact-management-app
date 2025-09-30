const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  let token;
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "User is not authorized, invalid token" });
      }

      req.user = decoded.user; // attach user info from token
      next();
    });
  } else {
    return res.status(401).json({ message: "User is not authorized or token is missing" });
  }
};

module.exports = validateToken;
