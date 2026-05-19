import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER/EMAIL_PASS is missing. Configure SMTP credentials in .env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  await transporter.sendMail({
    from: emailUser,
    to,
    subject,
    text,
  });
};
