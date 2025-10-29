// // config/email.js
// export default transporter;
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "hafizadegbite@gmail.com", // temporarily hardcode
    pass: "qxxvkdwpssradxvg",
  },
});

export default transporter;

