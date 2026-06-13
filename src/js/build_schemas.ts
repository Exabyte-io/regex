import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

import {
    buildRegexSchema,
    getAllFilePaths,
    loadRegexYAMLs,
    writeSchemasToTarget,
    interpolatePrimitives,
    interpolateSchemaParams,
} from "./functions";

declare const __dirname: string;
let regexApplicationSchemas = {};

const paths = getAllFilePaths();

paths
    .map(loadRegexYAMLs)
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .forEach((parsed: any) =>
        buildRegexSchema({ ...parsed, _regexApplicationSchemas: regexApplicationSchemas }),
    );

const primitivesPath = path.join(__dirname, "..", "assets", "file", "primitives.yml");
const primitivesContent = yaml.load(fs.readFileSync(primitivesPath, "utf8")) as Record<string, string>;

regexApplicationSchemas = interpolateSchemaParams(
    interpolatePrimitives(regexApplicationSchemas, primitivesContent),
);

writeSchemasToTarget({
    schema: regexApplicationSchemas,
    filePath: path.resolve(__dirname, "..", "..", "data", "schemas.json"),
});

fs.writeFileSync(
    "./src/py/mat3ra/regex/data/schemas.py",
    [
        "import json",
        `SCHEMAS = json.loads(r'''${JSON.stringify(regexApplicationSchemas)}''')`,
        "",
    ].join("\n"),
    "utf8",
);
