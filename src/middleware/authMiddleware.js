import jwt from 'jsonwebtoken'

export const verifyToken = (req, res, next) => {
    
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            error : "Authorization header missing"
        })
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            error:"Token missing after Bearer"
        })
    }

    try {
        const currentUser = jwt.verify(token, process.env.JWT_SECRET)

        req.user = currentUser
        next()

    }
    catch (err) {
        return res.status(401).json({
            success: false,
            error: "Token Invalid"
        })
    }
}