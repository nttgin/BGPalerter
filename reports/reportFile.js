import Report from "./report";
import nodemailer from "nodemailer";

export default class ReportEmail extends Report {

    constructor(channels, env) {
        super(channels, env);
    }

    report = (message, content) => {

        this.logger.log({
            level: 'verbose',
            message: content.message
        });
    }
}