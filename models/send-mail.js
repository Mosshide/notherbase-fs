import nodemailer from "nodemailer";

const passwordReset = async (toEmail, resetToken) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.NOREPLY,
          pass: process.env.NOREPLYPW
        }
    });
      
    var mailOptions = {
        from: process.env.NOREPLY,
        to: toEmail,
        subject: 'Password Reset for NotherBase',
        html: `<h1>Your One-Time Password Reset Code: ${resetToken}<h1>`
    };
    
    transporter.sendMail(mailOptions, function(error, info){
        if (error) console.log(error);
    });
};

const send = async (toEmail, subject, html) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.NOREPLY,
          pass: process.env.NOREPLYPW
        }
    });
      
    var mailOptions = {
        from: process.env.NOREPLY,
        to: toEmail,
        subject: subject,
        html: html
    };
    
    return await transporter.sendMail(mailOptions, function(error, info){
        if (error) console.log(error);
    });
}


export default { passwordReset, send };