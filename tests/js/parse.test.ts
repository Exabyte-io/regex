import { expect } from "chai";
import * as path from "path";

import { buildRegexSchema, getAllFilePaths, parseRegexYamls } from "../../src/js";

const assetsPaths = [
    "file/applications/espresso/5.4.1/pw.x/stdin.yml",
    "file/applications/espresso/7.1/pw.x/stdin.yml",
    "file/fortran_namelist.yml",
];
describe("parse tests", () => {
    it("should get all file paths", () => {
        const filePaths = [];
        const allPaths = getAllFilePaths(path.join(__dirname, "..", "assets"), filePaths);
        expect(allPaths.length).to.be.eql(3);

        allPaths.forEach((assetPath, index) => expect(assetPath).to.contain(assetsPaths[index]));
    });

    it("should parse Regex YAML", () => {
        const filePath = path.join(
            __dirname,
            "..",
            "assets",
            "file/applications/espresso/5.4.1/pw.x/stdin.yml",
        );
        const regexObject = parseRegexYamls(filePath);

        expect(regexObject.filePath).to.be.eql(filePath);
        expect(regexObject.parsedContent).to.be.eql({
            _fingerprints: [
                { regex: "^&control", flags: ["g", "i"], isRequired: true },
                { regex: "^&electrons", flags: ["g", "i"], isRequired: true },
            ],
            control: {
                _format: {
                    namelist: {
                        regex: "($|&)[A-Z]+\\n(?:\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+)(?:\\n\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+))*)?\\s*\\/",
                        flags: ["g", "m"],
                    },
                },
                calculation: { regex: "calculation\\s*=\\s*'([^']+)'", flags: ["g", "m", "i"] },
                title: { regex: "title\\s*=\\s*'([^']+)'", flags: ["g", "m", "i"] },
                restart_mode: { regex: "restart_mode\\s*=\\s*'([^']+)'", flags: ["g", "m", "i"] },
            },
        });
    });

    it("should build Regex Schema", () => {
        const filePath = path.join(
            __dirname,
            "..",
            "assets",
            "file/applications/espresso/5.4.1/pw.x/stdin.yml",
        );

        const _regexApplicationSchemas = {};

        const updatedSchemas = buildRegexSchema({
            filePath,
            parsedContent: {
                _fingerprints: [
                    { regex: "^&control", flags: ["g", "i"], isRequired: true },
                    { regex: "^&electrons", flags: ["g", "i"], isRequired: true },
                ],
                control: {
                    _format: {
                        namelist: {
                            regex: "($|&)[A-Z]+\\n(?:\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+)(?:\\n\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+))*)?\\s*\\/",
                            flags: ["g", "m", "i"],
                        },
                    },
                    calculation: { regex: "calculation\\s*=\\s*'([^']+)'", flags: ["g", "m", "i"] },
                },
            },
            _regexApplicationSchemas,
        });

        expect(updatedSchemas).to.be.eql({
            applications: {
                espresso: {
                    "5.4.1": {
                        "pw.x": {
                            _fingerprints: [
                                {
                                    flags: ["g", "i"],
                                    isRequired: true,
                                    regex: "^&control",
                                },
                                {
                                    flags: ["g", "i"],
                                    isRequired: true,
                                    regex: "^&electrons",
                                },
                            ],
                            control: {
                                _format: {
                                    namelist: {
                                        flags: ["g", "m", "i"],
                                        regex: "($|&)[A-Z]+\\n(?:\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+)(?:\\n\\s+[A-Za-z_]+\\s*=\\s*(?:['\"].*?['\"]|[^\\/\\n]+))*)?\\s*\\/",
                                    },
                                },
                                calculation: {
                                    flags: ["g", "m", "i"],
                                    regex: "calculation\\s*=\\s*'([^']+)'",
                                },
                            },
                        },
                    },
                },
            },
        });
    });
});
