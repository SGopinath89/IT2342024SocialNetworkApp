const jwt = require("jsonwebtoken");
const secretKey = "project@vau.lk";

// Verify the token
function verifyToken(req, res, next) {
    try {
        const token = req.headers.authorization;
        if (!token) {
            console.log("Token not available");
            return res.status(403).send("Token not available");
        }
        const actualToken = token.split(" ")[1];
        jwt.verify(actualToken, secretKey, (err, decoded) => {
            if (err) {
                console.log("Invalid token");
                return res.status(401).json({ error_message: "Invalid token" });
            }
           console.log("Token:", actualToken);
            console.log("Decoded Token:", decoded);

           
            req.user = { id: decoded.userId || decoded.id };
            //req.user =decoded
            console.log("User ID:", req.user.id);

            next();
        });
    } catch (error) {
        console.log("Error:", error.message);
        return res.status(500).json({ error_message: error.message });
    }
}



module.exports = { verifyToken };


 
