import Report from "./report";
import nodemailer from "nodemailer";

export default class ReportEmail extends Report {

    constructor(channels,params, env) {
        super(channels, params, env);

        this.transporter = nodemailer.createTransport({
            host: this.params.smtp,
            port: this.params.port,
            secure: this.params.secure,
            auth: {
                user: this.params.user,
                pass: this.params.password
            }
        });
    }

    getEmails = (content) => {
        const users = content.data
            .map(item => {
                if (item.matchedRule && item.matchedRule.user){
                    return item.matchedRule.user;
                } else {
                    return false;
                }
            })
            .filter(item => !!item);

        try {
            return [...new Set(users)]
                .map(user => {
                    return this.params.notifiedEmails[user];
                });
        } catch (error) {
            this.logger.log({
                level: 'error',
                message: 'Not all users have an associated email address'
            });
        }

        return [];
    };

    getEmailText = (message, content) => {
        return content.message;
    };

    report = (message, content) => {

        if (this.transporter) {
            const emailGroups = this.getEmails(content);

            for (let emails of emailGroups) {
                console.log(content.message);

                this.transporter
                    .sendMail({
                        from: this.params.email,
                        to: emails.join(', '),
                        subject: 'BGP alert: ' + message,
                        text: this.getEmailText(message, content)
                    })
                    .catch(error => {
                        this.logger.log({
                            level: 'error',
                            message: error
                        });
                    })
            }
        }
    }
}