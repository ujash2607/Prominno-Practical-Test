const jwt = require("jsonwebtoken");

const authorized = async (req, res, next) => {
     try {
          const authHeader = req.headers.authorization;
          const token = authHeader && authHeader.split(' ')[1];

          if (!token) {
               return res.status(401).send({ sucess: false, message: "Token is required" });
          }
          jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
               if (error) {
                    return res.status(401).send({ success: false, message: "Invalid or exipred token", error: error.message });
               }
               req.user = user;
               next();
          })
     } catch (error) {
          console.log(error, 'Error while authenticate!');
          return res.status(400).send({ sucess: false, message: "Error while authenticate!", error: error.message });

     }
}

const RoleMiddleWare = async (req, res, next) => {
     const allowedRoles = ['admin', 'seller'];

     if (!allowedRoles.includes(req.user.role)) {
          return res.status(403).json({
               success: false,
               message: 'You have no access.',
          });
     }
     next();
};

const adminAccessMiddleware = async (req, res, next) => {
     if (req.user.role != 'admin') {
          return res.status(403).json({
               success: false,
               message: 'Only admin have access.',
          });
     }
     next();
}

const sellerAccessMiddleware = async (req, res, next) => {
     if (req.user.role != 'seller') {
          return res.status(403).json({
               success: false,
               message: 'Only seller have access.',
          });
     }
     next();
}

module.exports = {
     authorized,
     RoleMiddleWare,
     adminAccessMiddleware,
     sellerAccessMiddleware
}
