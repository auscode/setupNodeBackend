const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

const clientAuthMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: "error", message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded.id;
    req.isClient = decoded.isClient;

    if (!req.isClient) {
      return res
        .status(403)
        .json({
          status: "error",
          message: "Access denied. Not a client user.",
        });
    }

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      res
        .status(401)
        .json({
          status: "error",
          message: "Token has expired. Please log in again.",
        });
    } else {
      res.status(401).json({ status: "error", message: "Token is not valid" });
    }
  }
};

module.exports = clientAuthMiddleware;
