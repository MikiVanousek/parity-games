import { Player } from '../src/board/Node';
import { examplePg } from '../src/board/exampleParityGame'
import { exportOinkFormat, importOinkFormat } from '../src/board/parityGameParser'
import * as fs from 'fs';

const PG_DIR = 'test/pg_examples/'

test('basic .pg parsing test', () => {
    const filestr = fs.readFileSync(`${PG_DIR}ex1.pg`).toString()
    const pg = importOinkFormat(filestr)

    expect(pg.nodes.length).toBe(6)
    expect(pg.nodes[0].label).toBe("0")
    expect(pg.nodes[1].label).toBe("1")
    expect(pg.nodes[2].label).toBe('2 3"4')
    expect(pg.nodes[0].player).toBe(Player.Odd)
    expect(pg.nodes[2].player).toBe(Player.Even)
    expect(pg.nodes[0].priority).toBe(0)
    expect(pg.nodes[5].priority).toBe(3)

    const exp_str = exportOinkFormat(pg)
    // The file in question does not end in an empty line.
    expect(exp_str).toBe(filestr)
})

test('examplePg test', () => {
    const pgstr = exportOinkFormat(examplePg)
    fs.writeFileSync(`${PG_DIR}example.pg`, pgstr);

    const pg = importOinkFormat(pgstr)
    expect(pg.sameAs(examplePg)).toBe(true)
    pg.nodes[0].label = "0"
    expect(pg.sameAs(examplePg)).toBe(true)
});

test('all in test/pg_examples parsing test', () => {
    const PG_DIR = 'test/pg_examples/'
    const file_list = fs.readdirSync(PG_DIR)
    for (const file_name of file_list) {
        console.log(file_name)
        const file_string = fs.readFileSync(PG_DIR + file_name).toString()
        const pg = importOinkFormat(file_string)
        expect(exportOinkFormat(pg)).toBe(file_string)
    }
})
