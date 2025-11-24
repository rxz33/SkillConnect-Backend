const jwt = require("jsonwebtoken");

module.exports = function (user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,   
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
