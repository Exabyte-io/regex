import * as fs from "fs";
import * as path from "path";

export function greet(name: string): string {
    return `Hello ${name}!`;
}

function getAllFilePaths(directoryPath, filePaths = []) {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);

        if (stats.isFile()) {
            filePaths.push(filePath);
        } else if (stats.isDirectory()) {
            getAllFilePaths(filePath, filePaths);
        }
    }

    return filePaths;
}

const pathes = getAllFilePaths(path.join(__dirname, "..", "..", "src", "assets"));

console.log(pathes);
