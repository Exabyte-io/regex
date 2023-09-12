import { expect } from "chai";
import * as fs from "fs";
import pointer from "json-pointer";
import * as path from "path";

// @ts-ignore
import schemas from "../../data/schemas.json";

describe("use espresso regexes", () => {
    const espressoNamelistRegex = pointer.get(
        schemas,
        "/applications/espresso/5.2.1/pw.x/control/_format/namelist",
    );

    const nameListBlocksRegex = new RegExp(
        espressoNamelistRegex.regex,
        espressoNamelistRegex.flags.join(""),
    );
    const file = fs.readFileSync(
        path.resolve("tests/fixtures/applications/espresso/5.2.1/pw.x"),
        "utf8",
    );

    it("should get namelist blocks", () => {
        const nameListBlocks = file.match(nameListBlocksRegex);

        expect(nameListBlocks.length).to.be.eql(5);
        expect(nameListBlocks[0]).to.be.eql(`&CONTROL
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
        expect(nameListBlocks[1]).to.be.eql(`&SYSTEM
    ibrav = 0
    nat = 2
    ntyp = 1
    ecutwfc = 40
    ecutrho = 200
    occupations = 'smearing'
    degauss = 0.005
/`);
        expect(nameListBlocks[2]).to.be.eql(`&ELECTRONS
    diagonalization = 'david'
    diago_david_ndim = 4
    diago_full_acc = .true.
    mixing_beta = 0.3
    startingwfc = 'atomic+random'
/`);
        expect(nameListBlocks[3]).to.be.eql(`&IONS
/`);
        expect(nameListBlocks[4]).to.be.eql(`&CELL
/`);
    });

    it("should parse values from CONTROL block", () => {
        const nameListBlocks = file.match(nameListBlocksRegex);
        const controlBlock = nameListBlocks[0];
        const regexObject = pointer.get(
            schemas,
            "/applications/espresso/5.2.1/pw.x/control/calculation",
        );
        const regexCalculation = new RegExp(
            "calculation\\s*=\\s*'([^']+)'",
            regexObject.flags.join(""),
        );

        const calculation = controlBlock.matchAll(regexCalculation);
        const [calcluationLine, calculationValue] = Array.from(calculation)[0];

        expect(calcluationLine).to.be.eql("calculation = 'scf'");
        expect(calculationValue).to.be.eql("scf");
    });
});
