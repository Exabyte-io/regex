// @ts-ignore
import * as path from "path";

import { buildRegexSchema, getAllFilePaths, parseRegexYamls, writeSchemasToTarget } from "./index";

declare const __dirname: string;
const regexApplicationSchemas = {};

const pathes = getAllFilePaths();

pathes
    .map(parseRegexYamls)
    .forEach((parsed) =>
        buildRegexSchema({ ...parsed, _regexApplicationSchemas: regexApplicationSchemas }),
    );

writeSchemasToTarget({
    schema: regexApplicationSchemas,
    filePath: path.resolve(__dirname, "..", "..", "data", "schemas.json"),
});
