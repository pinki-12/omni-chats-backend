import jwt from "jsonwebtoken";
export const protect = async (req, res, next) => {
  try {
    // Prefer the Authorization header (works on every browser, including
    // mobile browsers that block cross-site cookies). Fall back to the
    // cookie for same-origin/local-dev setups.
    const authHeader = req.headers.authorization;
    const headerToken = authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    const token = headerToken || req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "UnAuthorized",
      });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

