import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  //create transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  //email options
  const mailOptions = {
    from: `"Wearify" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  //send email

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
