import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";
import { google } from "googleapis";

const OAuth2 = google.auth.OAuth2;
const OAuth2Client = new OAuth2(process.env.CLIENTID, process.env.CLIENTSECRET);
OAuth2Client.setCredentials({ refresh_token: process.env.CLIENTREFRESH });

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

export default { send };