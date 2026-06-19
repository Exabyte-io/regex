import { expect } from "chai";
import * as fs from "fs";
import pointer from "json-pointer";
import * as path from "path";

const schemas = JSON.parse(fs.readFileSync(path.resolve("data/schemas.json"), "utf8"));

/**
 * Helper function to find a specific namelist block by its name using matchAll.
 * @param fileContent The string content of the file.
 * @param regex The regex schema to execute.
 * @param blockName The name of the block to extract (e.g., "CONTROL").
 * @param nameGroupIndex The regex capture group index containing the block name (defaults to 2 for fortran_namelist).
 */
function getBlockByName(
    fileContent: string,
    regex: RegExp,
    blockName: string,
    nameGroupIndex: number = 2
): string | undefined {
    const matches = Array.from(fileContent.matchAll(regex));
    const match = matches.find((m) => m[nameGroupIndex]?.toUpperCase() === blockName.toUpperCase());
    return match ? match[0] : undefined;
}

describe("use espresso regexes", () => {
    const espressoNamelistRegex = pointer.get(
        schemas,
        "/applications/espresso/5.2.1/pw.x/control/_format/namelist",
    );

    const file = fs.readFileSync(
        path.resolve("tests/fixtures/applications/espresso/pw.in"),
        "utf8",
    );

    it("should get control block", () => {
        const controlBlockRegex = new RegExp(
            espressoNamelistRegex.regex,
            espressoNamelistRegex.flags.join(""),
        );

        // Fetch the block by its explicit name
        const controlBlock = getBlockByName(file, controlBlockRegex, "CONTROL");

        expect(controlBlock).to.not.be.undefined;
        expect(controlBlock).to.be.eql(`&CONTROL
    calculation = 'scf'
    title = ''
    verbosity = 'low'
    restart_mode = 'from_scratch'
    wf_collect = .true.
    tstress = .true.
    tprnfor = .true.
    outdir = '{{ JOB_WORK_DIR }}/outdir'
    wfcdir = '{{ JOB_WORK_DIR }}/outdir'
    prefix = '__prefix__'
    pseudo_dir = '{{ JOB_WORK_DIR }}/pseudo'
/`);
    });

    it("should get electrons block", () => {
        const electornsBlockRegex = new RegExp(
            espressoNamelistRegex.regex,
            espressoNamelistRegex.flags.join(""),
        );

        // Fetch the block by its explicit name
        const electronsBlock = getBlockByName(file, electornsBlockRegex, "ELECTRONS");

        expect(electronsBlock).to.not.be.undefined;
        expect(electronsBlock).to.be.eql(`&ELECTRONS
    diagonalization = 'david'
    diago_david_ndim = 4
    diago_full_acc = .true.
    mixing_beta = 0.3
    startingwfc = 'atomic+random'
/`);
    });

    it("should parse values from CONTROL block", () => {
        const controlBlockRegex = new RegExp(
            espressoNamelistRegex.regex,
            espressoNamelistRegex.flags.join(""),
        );

        // Fetch the block by its explicit name
        const controlBlock = getBlockByName(file, controlBlockRegex, "CONTROL");

        if (!controlBlock) return;

        const regexObject = pointer.get(
            schemas,
            "/applications/espresso/5.2.1/pw.x/control/calculation",
        );

        const regexCalculation = new RegExp(
            regexObject.regex,
            regexObject.flags.join(""),
        );

        const calculation = controlBlock.matchAll(regexCalculation);
        const [calcluationLine, calculationValue] = Array.from(calculation)[0];

        expect(calcluationLine).to.be.eql("calculation = 'scf'");
        expect(calculationValue).to.be.eql("scf");
    });
});
