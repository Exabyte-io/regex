import { JsYamlAllSchemas } from "@exabyte-io/code.js/dist/utils";
// @ts-ignore
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as pointer from "json-pointer";
// @ts-ignore
import * as path from "path";

declare const __dirname: string;

export function greet(name: string): string {
    return `Hello ${name}!`;
}

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

export function parseRegexYamls(filePath: string) {
    const fileContent = fs.readFileSync(filePath, "utf8");

    const parsedContent = yaml.load(fileContent, { schema: JsYamlAllSchemas });

    return { filePath, parsedContent };
}

const assetsPath = path.join(__dirname, "..", "assets");

export function buildRegexSchema({
    filePath,
    parsedContent,
    _regexApplicationSchemas = {},
}: {
    filePath: string;
    parsedContent: string;
    _regexApplicationSchemas: object;
}) {
    const applicationFileRegexp = new RegExp(`${assetsPath}/file/applications/.*\\.yml`, "g");
    if (filePath.match(applicationFileRegexp)) {
        const directoryPath = path.dirname(filePath);
        const [, applicationSubPath] = directoryPath.split("applications");

        pointer.set(_regexApplicationSchemas, applicationSubPath, parsedContent);
    }
}

export function writeSchemasToTarget({ filePath, schema }: { filePath: string; schema: object }) {
    fs.writeFileSync(path.resolve(filePath), JSON.stringify(schema));
}
