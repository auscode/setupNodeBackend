const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ status: "error", message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    
    req.user = {id:decoded.id, isAdmin: decoded.isAdmin};

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

module.exports = authMiddleware;
