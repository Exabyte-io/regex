import { JsYamlAllSchemas } from "@exabyte-io/code.js/dist/utils";
import * as fs from "fs";
import * as yaml from "js-yaml";
import * as pointer from "json-pointer";
import * as path from "path";

declare const __dirname: string;

export function greet(name: string): string {
    return `Hello ${name}!`;
}

function getAllFilePaths(directoryPath: string, filePaths: string[] = []) {
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

function parseRegexYamls(filePath) {
    const fileContent = fs.readFileSync(filePath, "utf8");

    const parsedContent = yaml.load(fileContent, { schema: JsYamlAllSchemas });

    return { filePath, parsedContent };
}

const regexApplicationSchemas = {};

const assetsPath = path.join(__dirname, "..", "assets");

function buildRegexSchema({ filePath, parsedContent, _regexApplicationSchemas = {} }) {
    const applicationFileRegexp = new RegExp(`${assetsPath}/file/applications/.*\\.yml`, "g");
    if (filePath.match(applicationFileRegexp)) {
        const directoryPath = path.dirname(filePath);
        const [, applicationSubPath] = directoryPath.split("applications");

        pointer.set(_regexApplicationSchemas, applicationSubPath, parsedContent);
    }
}

const pathes = getAllFilePaths(path.join(__dirname, "..", "assets"));

pathes
    .map(parseRegexYamls)
    .forEach((parsed) =>
        buildRegexSchema({ ...parsed, _regexApplicationSchemas: regexApplicationSchemas }),
    );

console.log(regexApplicationSchemas);
