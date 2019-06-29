import Report from "./report";
import nodemailer from "nodemailer";
import logger from '../logger';


export default class ReportEmail extends Report {

    constructor(channels, config, pubSub) {
        super(channels, config, pubSub);

        if (this.config.emailConfig.enabled) {
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
    }

    report = (message, content) => {

        if (this.transporter) {
            this.transporter
                .sendMail({
                    from: this.config.emailConfig.email,
                    to: this.config.notifiedEmails.join(', '),
                    subject: "BGP alert: " + message,
                    text: "Hello world?"
                })
                .catch(error => {
                    logger.log({
                        level: 'error',
                        message: error
                    });
                })
        }
    }
}