import { Player } from '../src/board/Node';
import { PGParser } from '../src/board/PGParser'
import { examplePg } from '../src/board/ExamplePG'
import { deepEquals } from '../src/io/deepEquals'
import * as fs from 'fs';

let PG_DIR = 'test/pg_examples/'

test('basic .pg parsing test', () => {
    var filestr = fs.readFileSync(`${PG_DIR}ex1.pg`).toString()
    let pg = PGParser.importOinkFormat(filestr)

    expect(pg.nodes.length).toBe(6)
    expect(pg.nodes[0].label).toBe("0")
    expect(pg.nodes[1].label).toBe("1")
    expect(pg.nodes[2].label).toBe('2 3"4')
    expect(pg.nodes[0].player).toBe(Player.Odd)
    expect(pg.nodes[2].player).toBe(Player.Even)
    expect(pg.nodes[0].priority).toBe(0)
    expect(pg.nodes[5].priority).toBe(3)

    let exp_str = PGParser.exportOinkFormat(pg)
    // The file in question does not end in an empty line.
    expect(exp_str).toBe(filestr)
})

test('examplePg test', () => {
    const pgstr = PGParser.exportOinkFormat(examplePg)
    fs.writeFileSync(`${PG_DIR}example.pg`, pgstr);

    let pg = PGParser.importOinkFormat(pgstr)
    expect(pg.nodes).toEqual(examplePg.nodes)
    expect(pg.links.length).toBe(examplePg.links.length)
    for (const l of pg.links) {
        expect(examplePg.links.find((exl) => deepEquals(l, exl))).toBeDefined()
    }
});

test.skip('elaborate .pg parsing test', () => {
    let file_list = fs.readdirSync(PG_DIR)
    for (let file_name of file_list) {
        let file_string = fs.readFileSync(PG_DIR + file_name).toString()
        let pg = PGParser.importOinkFormat(file_string)
        expect(PGParser.exportOinkFormat(pg)).toBe(file_string)
    }
})
