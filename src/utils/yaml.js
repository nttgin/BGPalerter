import yaml from "js-yaml";

// Like yaml.load, but returns undefined for empty/comment-only input (js-yaml >= 5 throws)
export const loadYaml = (content) => {
    const documents = yaml.loadAll(content);

    if (documents.length > 1) {
        throw new Error("expected a single document in the stream, but found more");
    }

    return documents[0];
};
