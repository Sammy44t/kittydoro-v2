import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");  // Extract token from header
    if (!token) {
        return res.status(401).send({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWTPRIVATEKEY); 
        req.user = decoded;  // Attach the decoded user data (such as email or user ID) to req.user
        next();  // Proceed to the next middleware or route handler
    } catch (error) {
        console.error("Invalid token:", error);
        res.status(400).send({ message: "Invalid token." });
    }
};

export default auth;
