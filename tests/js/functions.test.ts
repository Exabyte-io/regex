import { expect } from "chai";
import * as path from "path";

import {
    buildRegexSchema,
    getAllFilePaths,
    loadRegexYAMLs,
    interpolatePrimitives,
    interpolateSchemaParams,
} from "../../src/js/functions";

const REFERENCE_PATH_TO_PWIN_YML = path.join(
    __dirname,
    "..",
    "assets",
    "file/applications/espresso/pwin.yml",
);

const REFERENCE_ASSETS_PATHS = [
    "file/applications/espresso/pwin.yml",
    "file/espresso_regex_dict.yml",
    "file/fortran_namelist.yml",
    "file/primitives.yml",
];

const REFERENCE_YAML_CONTENT = {
    _fingerprints: [
        { regex: "^&control", flags: ["g", "i"], isRequired: true },
        { regex: "^&electrons", flags: ["g", "i"], isRequired: true },
    ],
    _regex_dict: {
        atomic_positions_card: {
            flags: ["i"],
            params: {
                UNIT: ["alat", "bohr", "angstrom", "crystal", "crystal_sg"],
            },
            regex: "ATOMIC_POSITIONS\\s*[{(]?\\s*(alat|bohr|angstrom|crystal|crystal_sg)?\\s*[)}]?\\s*\\n((?:[ \\t]*\\w+(?:[ \\t]+[-+]?(?:\\d+\\.\\d*|\\.\\d+|\\d+)(?:[eEdD][-+]?\\d+)?){3}(?:(?:[ \\t]+[01]){3})?[ \\t]*\\n?)+)",
        },
        cell_parameters_card: {
            flags: ["i"],
            params: { UNIT: ["alat", "bohr", "angstrom"] },
            regex: "CELL_PARAMETERS\\s*[{(]?\\s*(alat|bohr|angstrom)?\\s*[)}]?\\s*\\n((?:[ \\t]*[-+]?(?:\\d+\\.\\d*|\\.\\d+|\\d+)(?:[eEdD][-+]?\\d+)?[ \\t]+[-+]?(?:\\d+\\.\\d*|\\.\\d+|\\d+)(?:[eEdD][-+]?\\d+)?[ \\t]+[-+]?(?:\\d+\\.\\d*|\\.\\d+|\\d+)(?:[eEdD][-+]?\\d+)?[ \\t]*\\n?){3})",
        },
        kv_pair: {
            flags: ["g", "i", "m"],
            regex: "(\\w+)\\s*=\\s*([^,\\n/=]+)",
        },
        kv_pair_with_index: {
            flags: ["g", "i", "m"],
            regex: "(\\w+)\\s*\\(\\s*(\\d+)\\s*\\)\\s*=\\s*([^,\\n/]+)",
        },
        namelist_block: {
            regex: "&(CONTROL|SYSTEM|ELECTRONS|IONS|CELL|FCP|RISM)\\s*([\\s\\S]*?)\\/",
            flags: ["i", "m"],
            params: {
                BLOCK_NAME: ["CONTROL", "SYSTEM", "ELECTRONS", "IONS", "CELL", "FCP", "RISM"],
            },
        },
    },
    control: {
        _format: {
            namelist: {
                regex: "(\\$|&)(CONTROL|ELECTRONS|IONS|CELL|SYSTEM)\\n(?:\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+)(?:\\n\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+))*)?\\s*\\/",
                flags: ["g", "m"],
                params: {
                    BLOCK_NAME: ["CONTROL", "ELECTRONS", "IONS", "CELL", "SYSTEM"],
                },
            },
        },
        calculation: { regex: "calculation\\s*=\\s*'([^']+)'", flags: ["g", "m", "i"] },
        title: { regex: "title\\s*=\\s*'([^']+)'", flags: ["g", "m", "i"] },
        restart_mode: { regex: "restart_mode\\s*=\\s*'([^']+)'", flags: ["g", "m", "i"] },
    },
};

const REFERENCE_SCHEMA_CONTENT_INTERMEDIATE = {
    _fingerprints: [
        { regex: "^&control", flags: ["g", "i"], isRequired: true },
        { regex: "^&electrons", flags: ["g", "i"], isRequired: true },
    ],
    control: {
        _format: {
            namelist: {
                regex: "($|&){{BLOCK_NAME}}\\n(?:\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+)(?:\\n\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+))*)?\\s*\\/",
                flags: ["g", "m", "i"],
                params: {
                    BLOCK_NAME: ["CONTROL", "SYSTEM", "ELECTRONS", "IONS", "CELL"],
                },
            },
        },
        calculation: { regex: "calculation\\s*=\\s*'([^']+)'", flags: ["g", "m", "i"] },
    },
};

const REFERENCE_SCHEMA_CONTENT_FINAL = {
    applications: {
        espresso: REFERENCE_SCHEMA_CONTENT_INTERMEDIATE,
    },
};
describe("build schema from assets tests", () => {
    it("should get all file paths", () => {
        const filePaths: string[] | undefined = [];
        const allPaths = getAllFilePaths(path.join(__dirname, "..", "assets"), filePaths);
        expect(allPaths.length).to.be.eql(4);

        allPaths.forEach((assetPath, index) =>
            expect(assetPath).to.contain(REFERENCE_ASSETS_PATHS[index]),
        );
    });

    it("should load Regex YAML and interpolate primitives and params", () => {
        const regexObject = loadRegexYAMLs(REFERENCE_PATH_TO_PWIN_YML);

        const primitivesPath = path.join(
            __dirname,
            "..",
            "..",
            "src",
            "assets",
            "file",
            "primitives.yml",
        );
        const primitivesObject = loadRegexYAMLs(primitivesPath);

        let interpolatedContent = interpolatePrimitives(
            regexObject.parsedContent,
            primitivesObject.parsedContent as Record<string, string>,
        );
        interpolatedContent = interpolateSchemaParams(interpolatedContent);

        expect(regexObject.filePath).to.be.eql(REFERENCE_PATH_TO_PWIN_YML);
        expect(interpolatedContent).to.be.eql(REFERENCE_YAML_CONTENT);
    });

    it("should build Regex Schema", () => {
        const _regexApplicationSchemas = {};
        const updatedSchemas = buildRegexSchema({
            filePath: REFERENCE_PATH_TO_PWIN_YML,
            parsedContent: REFERENCE_SCHEMA_CONTENT_INTERMEDIATE,
            _regexApplicationSchemas,
        });
        expect(updatedSchemas).to.be.eql(REFERENCE_SCHEMA_CONTENT_FINAL);
    });
});
