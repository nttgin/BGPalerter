import Report from "./report";
import nodemailer from "nodemailer";

export default class ReportEmail extends Report {

    constructor(channels, params, env) {
        super(channels, params, env);
    }

    report = (message, content) => {

        this.logger.log({
            level: 'verbose',
            message: content.message
        });
    }
}