import ReportHTTP from "./reportHTTP";
export default class ReportDiscord extends ReportHTTP {
    constructor(channels, params, env) {
        const templates = {};
        const defaultColor = "#4287f5";
        const colors = params.colors || {};
        // Discord expects embed colors as decimal integers
        const getColorDecimal = (color) => {
            const decimal = parseInt(color.replace("#", ""), 16);
            return isNaN(decimal) ? getColorDecimal(defaultColor) : decimal;
        };
        const getTemplateItem = (color) => {
            return JSON.stringify({
                embeds: [
                    {
                        title: "${channel}",
                        description: "${summary}${markDownUrl}",
                        color: getColorDecimal(color)
                    }
                ]
            });
        };
        for (let channel of channels) {
            templates[channel] = getTemplateItem(colors[channel] || defaultColor);
        }
        templates["default"] = getTemplateItem(defaultColor);
        const discordParams = {
            headers: {},
            isTemplateJSON: true,
            showPaths: params.showPaths,
            hooks: params.hooks,
            name: "reportDiscord",
            templates
        };
        super(channels, discordParams, env);
    }
}