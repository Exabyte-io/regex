import { expect } from "chai";
import * as path from "path";

import { buildRegexSchema, getAllFilePaths, loadRegexYAMLs } from "../../src/js/functions";

const REFERENCE_PATH_TO_PWIN_YML = path.join(
    __dirname,
    "..",
    "assets",
    "file/applications/espresso/pwin.yml",
);

const REFERENCE_ASSETS_PATHS = [
    "file/applications/espresso/pwin.yml",
    "file/espresso_namelist.yml",
    "file/espresso_regex_dict.yml",
    "file/primitives.yml",
];

const REFERENCE_YAML_CONTENT = {
    _fingerprints: [
        { regex: "^&control", flags: ["g", "i"], isRequired: true },
        { regex: "^&electrons", flags: ["g", "i"], isRequired: true },
    ],
    _regex_dict: {
        namelist_block: {
            regex: "&{{BLOCK_NAME}}\\s*([\\s\\S]*?)\\/",
            flags: ["i"],
        },
    },
    control: {
        _format: {
            namelist: {
                regex: "(\\$|&){{BLOCK_NAME}}\\n(?:\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+)(?:\\n\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+))*)?\\s*\\/",
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

    it("should load Regex YAML", () => {
        const regexObject = loadRegexYAMLs(REFERENCE_PATH_TO_PWIN_YML);
        expect(regexObject.filePath).to.be.eql(REFERENCE_PATH_TO_PWIN_YML);
        expect(regexObject.parsedContent).to.be.eql(REFERENCE_YAML_CONTENT);
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
