// utils/sendVerificationEmail.js
import transporter from "../config/email.js";

export const sendVerificationEmail = async (userEmail, token) => {
  const verificationLink = `http://localhost:5173/verify/${token}`; // ✅ Your frontend route

  const mailOptions = {
    from: `"MistressChef 🍽️" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: "Verify your email - MistressChef 🍽️",
    html: `
      <div style="
        font-family: Arial, sans-serif;
        background-color: #f9fafb;
        padding: 30px;
        text-align: center;
      ">
        <div style="
          max-width: 500px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          padding: 30px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        ">
          <img 
            src="https://res.cloudinary.com/dlnylsx6r/image/upload/v1728370000/mistresschef_logo.png" 
            alt="MistressChef Logo" 
            style="width: 100px; margin-bottom: 20px;"
            onerror="this.style.display='none'"
          />
          <h2 style="color: #333;">Welcome to <span style="color: #ff4500;">MistressChef</span>! 🎉</h2>
          <p style="font-size: 16px; color: #555; margin-bottom: 30px;">
            Thanks for signing up! Please verify your email address to activate your account.
          </p>
          <a href="${verificationLink}" target="_blank"
            style="
              display: inline-block;
              background-color: #ff4500;
              color: white;
              padding: 12px 25px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: bold;
              font-size: 16px;
            ">
            ✅ Verify Email
          </a>
          <p style="margin-top: 25px; color: #777; font-size: 14px;">
            If you didn’t create an account, you can safely ignore this email.
          </p>
          <hr style="margin: 25px 0; border: 0; border-top: 1px solid #eee;" />
          <p style="color: #999; font-size: 12px;">
            © ${new Date().getFullYear()} MistressChef. All rights reserved.
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error("❌ Email sending error:", error);
  }
};
