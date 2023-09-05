import { expect } from "chai";
import * as fs from "fs";
import pointer from "json-pointer";
import * as path from "path";

// @ts-ignore
import schemas from "../../src/schemas.json";

describe("use espresso regexes", () => {
    it("should get namelist blocks", () => {
        const espressoNamelistRegex = pointer.get(
            schemas,
            "/applications/espresso/5.4.1/pw.x/control/_format/namelist",
        );

        const regex = new RegExp(espressoNamelistRegex.regex, espressoNamelistRegex.flags.join(""));
        const file = fs.readFileSync(
            path.resolve("tests/fixtures/applications/espresso/5.4.1/pw.x"),
            "utf8",
        );

        const nameListBlocks = file.match(regex);

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
});
