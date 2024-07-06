const jwt = require('jsonwebtoken');

function auth(req, res, next) {
    const authHeader = req.header('Authorization');
    if (!authHeader) return res.status(401).send({ message: 'Access Denied. No Token Provided.' });

    const token = authHeader.replace('Bearer ', '');
    if (!token) return res.status(401).send({ message: 'Access Denied. No Token Provided.' });

    try {
        const decoded = jwt.verify(token, 'your_secret_key');
        req.user = decoded; // Attach the decoded token to the request object
        next();
    } catch (ex) {
        res.status(400).send({ message: 'Invalid Token.' });
    }
}

module.exports = auth;
