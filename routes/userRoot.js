import express from "express";
import userController from "../controllers/userController.js";
import checkUserAuth from "../middlewares/authMiddleware.js";

const router = new express.Router();

// applying the middleware
router.use('/changepassword', checkUserAuth)
router.use('/profile', checkUserAuth)

//public roots
router.post('/register', userController.userRegistration);
router.post('/login', userController.userLogin);
router.post('/send-email', userController.sendEmailToResetPassword)
router.post('/reset-password/:id/:token', userController.resetPassword)


//private roots
router.post('/changepassword', userController.changeUserPassword);
router.get('/profile', userController.loggedInUser)


export default router;
