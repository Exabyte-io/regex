import { JsYamlAllSchemas } from "@exabyte-io/code.js/dist/utils";
import * as fs from "fs";
import * as yaml from "js-yaml";
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

    return parsedContent;
}

const pathes = getAllFilePaths(path.join(__dirname, "..", "..", "src", "assets"));

const parsedFiles = pathes.map(parseRegexYamls);

console.log(parsedFiles);
