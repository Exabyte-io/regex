import { expect } from "chai";
import * as path from "path";

import { getAllFilePaths } from "../../src/js";

const assetsPaths = [
    "file/applications/espresso/5.4.1/pw.x/stdin.yml",
    "file/applications/espresso/5.4.1/pw.x/stdout.yml",
    "file/applications/espresso/7.2/pw.x/stdin.yml",
    "file/applications/espresso/7.2/pw.x/stdout.yml",
    "file/applications/vasp/5.4.1/pw.x/stdin.yml",
    "file/applications/vasp/5.4.1/pw.x/stdout.yml",
    "file/applications/vasp/7.2/pw.x/stdin.yml",
    "file/applications/vasp/7.2/pw.x/stdout.yml",
    "file/fortran_namelist.yml",
];
describe("parse tests", () => {
    it("should get all file paths", () => {
        const filePaths = [];
        const allPaths = getAllFilePaths(path.join(__dirname, "..", "assets"), filePaths);
        expect(allPaths.length).to.be.eql(9);

        allPaths.forEach((assetPath, index) => expect(assetPath).to.contain(assetsPaths[index]));
    });
});
