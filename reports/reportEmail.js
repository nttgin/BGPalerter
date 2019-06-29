import Report from "./report";
import nodemailer from "nodemailer";

export default class ReportEmail extends Report {

    constructor(channels, config, pubSub) {
        super(channels, config, pubSub);

        this.transporter = nodemailer.createTransport({
            host: this.config.emailConfig.smtp,
            port: this.config.emailConfig.port,
            secure: this.config.emailConfig.secure,
            auth: {
                user: this.config.emailConfig.user,
                pass: this.config.emailConfig.password
            }
        });
    }

    report = (message, content) => {

        this.transporter
            .sendMail({
                from: this.config.emailConfig.email,
                to: this.config.notifiedEmails.join(', '),
                subject: "BGP alert: " + message,
                text: "Hello world?"
            })
            .catch(error => {
                console.log("log the error properly!", error);
            })
    }
}