import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;
const OAuth2Client = new OAuth2(process.env.CLIENTID, process.env.CLIENTSECRET);
OAuth2Client.setCredentials({ refresh_token: process.env.CLIENTREFRESH });


/**
 * Sends an email with a password reset code. WIP
 * @param {String} toEmail Email address to send to.
 * @param {Number} resetToken Token to reset by.
 */
const passwordReset = async (toEmail, resetToken) => {
    return await send(toEmail, 'Password Reset for NotherBase', 
        `<h1>Your One-Time Password Reset Code:<h1>
        <h2>${resetToken}<h2>
        <p>Visit <a href="https://www.notherbase.com/the-front/keeper">notherbase.com/the-front/keeper</a> to finish changing your password.</p>`);
};

/**
 * Sends an email. WIP
 * @param {String} toEmail Email Address to send to.
 * @param {String} subject Subject of the email.   
 * @param {String} html Body of the email.
 * @returns 
 */
const send = async (toEmail, subject, html, name = "NotherBase") => {
    let accessToken = OAuth2Client.getAccessToken();

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.NOREPLY,
            clientId: process.env.CLIENTID,
            clientSecret: process.env.CLIENTSECRET,
            refreshToken: process.env.CLIENTREFRESH,
            accessToken: accessToken
        }
    });

    let mailOptions = {
        from: name + " <" + process.env.NOREPLY +">",
        to: toEmail,
        subject: subject,
        html: html
    };
    
    let sent = await transporter.sendMail(mailOptions, function(error, info){
        if (error) console.log(error);
    });

    return sent;
}

export default { passwordReset, send };