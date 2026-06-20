// eslint-disable-next-line import/no-extraneous-dependencies
import { JsYamlAllSchemas } from "@mat3ra/code/dist/js/utils";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as pointer from "json-pointer";
import * as path from "path";

declare const __dirname: string;

export function getAllFilePaths(
    directoryPath: string = path.join(__dirname, "..", "assets"),
    filePaths: string[] = [],
) {
    const filesPaths = fs.readdirSync(directoryPath);

    // eslint-disable-next-line no-restricted-syntax
    for (const filePath of filesPaths) {
        const fullPath = path.join(directoryPath, filePath);
        const stats = fs.statSync(fullPath);

        if (stats.isFile()) {
            filePaths.push(fullPath);
        } else if (stats.isDirectory()) {
            getAllFilePaths(fullPath, filePaths);
        }
    }

    return filePaths;
}

export function loadRegexYAMLs(filePath: string) {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const parsedContent = yaml.load(fileContent, { schema: JsYamlAllSchemas });
    return { filePath, parsedContent };
}

export function buildRegexSchema({
    filePath,
    parsedContent,
    _regexApplicationSchemas = {},
}: {
    filePath: string;
    parsedContent: unknown;
    _regexApplicationSchemas: object;
}) {
    const yamlFileRegexp = /\/file\/[a-zA-Z]*\/.*\.yml/g;

    if (filePath.match(yamlFileRegexp)) {
        const categoryRegex = /\/file\/([^/]+)/;
        const categoryMatch = filePath.match(categoryRegex);

        if (categoryMatch === null || !categoryMatch.length) return _regexApplicationSchemas;
        console.log(`filePath ${filePath} matched ${categoryMatch[1]} FileRegexp`);

        const directoryPath = path.dirname(filePath);
        const fileName = path.basename(filePath, ".yml");

        const [, applicationSubPath] = directoryPath.split("/file");
        const fullPointerPath = `${applicationSubPath}/${fileName}`;

        pointer.set(_regexApplicationSchemas, fullPointerPath, parsedContent);
    }

    return _regexApplicationSchemas;
}

export function writeSchemasToTarget({ filePath, schema }: { filePath: string; schema: object }) {
    fs.writeFileSync(path.resolve(filePath), JSON.stringify(schema) + "\n", "utf8");
}

export function interpolatePrimitives(schema: any, primitives: Record<string, string>): any {
    if (typeof schema === "string") {
        let replaced = schema;
        for (const [key, value] of Object.entries(primitives)) {
            const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
            replaced = replaced.replace(regex, value);
        }
        return replaced;
    }
    if (Array.isArray(schema)) {
        return schema.map((item) => interpolatePrimitives(item, primitives));
    }
    if (typeof schema === "object" && schema !== null) {
        const result: any = {};
        for (const [key, value] of Object.entries(schema)) {
            result[key] = interpolatePrimitives(value, primitives);
        }
        return result;
    }
    return schema;
}

export function interpolateSchemaParams(schema: any): any {
    if (Array.isArray(schema)) {
        return schema.map((item) => interpolateSchemaParams(item));
    }
    if (typeof schema === "object" && schema !== null) {
        const result: any = {};
        for (const [key, value] of Object.entries(schema)) {
            result[key] = interpolateSchemaParams(value);
        }

        if (result.regex && typeof result.regex === "string" && result.params) {
            for (const [paramKey, paramValues] of Object.entries(result.params)) {
                if (Array.isArray(paramValues)) {
                    const replaceRegex = new RegExp(`\\{\\{${paramKey}\\}\\}`, "g");
                    result.regex = result.regex.replace(replaceRegex, `(${paramValues.join("|")})`);
                }
            }
        }
        return result;
    }
    return schema;
}
