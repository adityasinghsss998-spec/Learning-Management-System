const jwt = require('jsonwebtoken');
const dotenv=require('dotenv');
dotenv.config()
const authMiddleware=(req,res,next)=>{
     const header=req.headers['authorization'];
     if (!header) return res.status(401).json({ message: "No token provided"})
    
    const token=header.split(' ')[1];
     if (!token) return res.status(401).json({ message: "Malformed token" });

     try{
       const decoded=jwt.verify(token,process.env.ACCESS_SECRET);
       console.log("Decoded token:", decoded);
       req.headers['x-user-id'] = decoded.id;
        req.headers['x-user-role'] = decoded.role;
        req.headers['x-user-name'] = decoded.name;
        req.headers['x-user-email'] = decoded.email;
        next();
     }catch(e){
      res.status(401).json({ message: "Invalid or expired token" });
     }  
}

const optionalAuthMiddleware = (req, res, next) => {
    const header = req.headers['authorization'];
    
    if (!header) return next();  // no token → just continue, no headers injected
    
    const token = header.split(' ')[1];
    if (!token) return next();   // malformed → just continue

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
        req.headers['x-user-id'] = decoded.id;
        req.headers['x-user-role'] = decoded.role;
        req.headers['x-user-name'] = decoded.name;
        req.headers['x-user-email'] = decoded.email;
    } catch (e) {
        // invalid/expired token → just continue without injecting, don't reject
    }
    
    next();
};

module.exports={
  authMiddleware,
  optionalAuthMiddleware,
}