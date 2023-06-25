const sgMail = require('@sendgrid/mail');
const { error } = require('console');
require('dotenv').config();

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async (data) => {
    const email = { ...data, from: "ukrainischesmaedel@yahoo.de" };
    await sgMail.send(email);
    return true;
}

module.exports = sendEmail;

// const { error } = require('console');
// const nodemailer = require('nodemailer');
// require('dotenv').config();

// const { META_PASSWORD } = process.env;

// const nodemailerConfig = {
//     host: "smtp.meta.ua",
//     port: 465,
//     secure: true,
//     auth: {
//         user: "whatever1304@meta.ua",
//         pass: META_PASSWORD,
//     }
// }

// const transport = nodemailer.createTransport(nodemailerConfig);

// const email = {
//     to: "",
//     from: "whatever1304@meta.ua",
//     subject: "Email test",
//     html: "<p><strong> Email test </strong> from localhost:3000</p>"
// }

// transport.sendMail(email)
//     .then(() => console.log("Email sent successfully"))
//     .catch(error => console.log(error.message))