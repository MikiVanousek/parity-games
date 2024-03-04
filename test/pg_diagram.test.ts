import { PG } from '../src/pg_diagram'
import { PGParser } from '../src/pg_parser'
import * as fs from 'fs';

let PG_DIR = 'test/pg_examples/'

test('basic .pg parsing test', () => {
    var filestr = fs.readFileSync(`${PG_DIR}ex1.pg`).toString()
    let pg = PGParser.import_pg_format(filestr)

    expect(pg.nodes.length).toBe(6)
    expect(pg.links.length).toBe(8)
    expect(pg.nodes[0].label).toBe("0")
    expect(pg.nodes[1].label).toBe("1")
    expect(pg.nodes[2].label).toBe('2 3"4')
    expect(pg.nodes[0].player).toBe(PG.Player.Odd)
    expect(pg.nodes[2].player).toBe(PG.Player.Even)
    expect(pg.nodes[0].priority).toBe(0)
    expect(pg.nodes[5].priority).toBe(3)

    let exp_str = PGParser.export_pg_format(pg)
    console.log(exp_str)
    // The file in question does not end in an empty line.
    expect(exp_str).toBe(filestr)
})

test.skip('elaborate .pg parsing test', () => {
    let file_list = fs.readdirSync(PG_DIR)
    for (let file_name of file_list) {
        let file_string = fs.readFileSync(PG_DIR + file_name).toString()
        let pg = PGParser.import_pg_format(file_string)
        expect(PGParser.export_pg_format(pg)).toBe(file_string)
    }
})