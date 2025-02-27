const jwt = require('jsonwebtoken');
//const secret = 'your_jwt_secret'; // Replace with your secret
const secret = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign({ id: user._id, isClient: user.isClient, isAdmin: user.isAdmin }, secret, { expiresIn: '365d' });
};


module.exports = { generateToken };
