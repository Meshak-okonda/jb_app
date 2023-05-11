const nodemailer = require("nodemailer");

const { SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD } = process.env;

// async..await is not allowed in global scope, must use a wrapper
const sendEMail = async (subject, message, email) =>
  new Promise((resolved, ejt) => {
    {
      // create reusable transporter object using the default SMTP transport
      const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: false,
        // true for 465, false for other ports
        auth: {
          user: SMTP_EMAIL, // generated ethereal user
          pass: SMTP_PASSWORD, // generated ethereal password
        },
      });
      console.log(SMTP_HOST, SMTP_PORT, SMTP_EMAIL, SMTP_PASSWORD);

      // send mail with defined transport object
      const mailOptions = {
        from: "Replied <" + SMTP_EMAIL + ">", // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        html: message, // plain text body
        // html: "<b>Hello world?</b>", // html body
      };

      //const info = await transporter.sendMail(message);

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) ejt(error);
        console.log(info);
        resolved("Email sent: ");
      });

      // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  });

module.exports = sendEMail;
