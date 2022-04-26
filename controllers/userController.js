import userModel from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import transporter from "../config/emailConfig.js";
// import res from "express/lib/response";

class userController {
  // user registration process
  static userRegistration = async (req, res) => {
    const { name, email, password, confirmPassword, tc } = req.body;
    // console.log("email", email, password);
    const user = await userModel.findOne({ email });
    if (user) {
      res.status(201).send({ status: "faild", message: "user already exists" });
    } else {
      if (name && email && password && confirmPassword && tc) {
        if (password === confirmPassword) {
          try {
            const salt = await bcrypt.genSalt(12);
            const hashingPassword = await bcrypt.hash(password, salt);
            const registrationData = new userModel({
              name,
              email,
              password: hashingPassword,
              confirmPassword: hashingPassword,
              tc,
            });
            await registrationData.save();
            const currentRegisterUser = await userModel.findOne({ email });

            // generating jwt token
            const token = jwt.sign(
              { userId: currentRegisterUser._id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            res.send({
              status: "success",
              message: "data inserted successfully",
              token,
            });
          } catch (err) {
            res.status(201).send({
              status: "faild",
              message: "unable to register try again",
            });
          }
        } else {
          res.status(300).send({
            status: "faild",
            message: "password and confirm password must be same",
          });
        }
      } else {
        res
          .status(201)
          .send({ status: "faild", message: "required all field" });
      }
    }
  };

  static userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
      const userData = await userModel.findOne({ email });

      if (userData != null) {
        //comparing the password store in our db and received front end password
        const isAuth = await bcrypt.compare(password, userData.password);
        if (userData.email === email && isAuth) {
          // generating jwt token
          const token = jwt.sign(
            { userId: userData._id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: "5d" }
          );
          res.send({ status: "success", message: "login successful !", token });
        } else {
          res.status(201).send({
            status: "faild",
            message: "you email and password are not matching",
          });
        }
      } else {
        res
          .status(201)
          .send({ status: "faild", message: "you are not register user" });
      }
    } else {
      res
        .status(201)
        .send({ status: "faild", message: "user and password required" });
    }
  };

  //changer userpassword after login
  static changeUserPassword = async (req, res) => {
    const { password, confirmPassword } = req.body;
    if (password && confirmPassword) {
      if (password !== confirmPassword) {
        res
          .status(201)
          .send({
            status: "faild",
            message: "password and confirm password must be same",
          });
      } else {
        const salt = await bcrypt.genSalt(12);
        const hashingPassword = await bcrypt.hash(password, salt);
        await userModel.findByIdAndUpdate(req.user._id, {
          $set: { password: hashingPassword, confirmPassword: hashingPassword },
        });
        res.send({
          status: "success",
          message: "password change successfully",
        });
      }
    } else {
      res
        .status(201)
        .send({
          status: "faild",
          message: "password and confirm password required",
        });
    }
  };

  // show user profile of logged in user
  static loggedInUser = async (req, res) => {
    res.send(req.user);
    // res.send({status: "success", message: "display user profile information"})
  };

  //send email for reset password
  static sendEmailToResetPassword = async (req, res) => {
    const {email} = req.body;
    if (email) {
      const user = await userModel.findOne({email});
      if (user) {
        const secretKey = user._id + process.env.JWT_SECRET_KEY;
        const token = jwt.sign({ userId: user._id }, secretKey, {
          expiresIn: "58m",
        });

        //front end link
        const link = `http://localhost:3000/api/user/reset/${user._id}/${token}`;
        console.log("link is ", link);
        
        try {
          let info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: "reset password link",
            html: `<a href=${link}>click here to reset password</a>`
          })
          res.send({
            status: "success",
            message:
              "password reset link sent to your email please check your email",
              infos: info
          });
        } catch (error) {
          res.status(400)
          .send({ status: "faild", message: "email is not sent", reason:error });
        }
       
      } else {
        res
          .status(400)
          .send({ status: "faild", message: "email is not registered" });
      }
    } else {
      res.status(404).send({ status: "faild", message: "email required" });
    }
  };

  // reset user password
  static resetPassword = async (req, res)=>{
    const {password, confirmPassword} = req.body;
    const {id, token} = req.params
    const user = await userModel.findById({_id:id})
    const newSecretKey  = user._id + process.env.JWT_SECRET_KEY
    try {
        jwt.verify(token, newSecretKey)
        if (password && confirmPassword) {
          if (password === confirmPassword) {
            const salt = await bcrypt.genSalt(12);
            const hashingPassword = await bcrypt.hash(password, salt);
            await userModel.findByIdAndUpdate(user._id, {
              $set: { password: hashingPassword, confirmPassword: hashingPassword },
            });
            res.send({status:"success", message:"password updated successfully !"})
          } else {
          res.status(403).send({status:"faild", message:" password and confirm password must be same"})
            
          }
        } else {
          res.status(403).send({status:"faild", message:" password and confirm password both required"})
        }
    } catch (error) {
      console.log(error);
      res.status(403).send({status:"faild", message:"invalid token"})
    }

  }
}

export default userController;
