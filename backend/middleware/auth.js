const { auth } = require('express-oauth2-jwt-bearer');

// Auth0 JWT verification middleware
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE || 'https://skinx-api',
  issuerBaseURL:
    process.env.AUTH0_ISSUER_BASE_URL ||
    'https://skinx-development.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});

// Optional: Extract user info from token
const extractUser = (req, res, next) => {
  if (req.auth) {
    req.userId = req.auth.sub; // Auth0 user ID
    req.userEmail = req.auth.email;
    req.userName = req.auth.name;
  }
  next();
};

module.exports = {
  checkJwt,
  extractUser
};
