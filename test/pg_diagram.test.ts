import { Player } from '../src/board/Node';
import { PGParser } from '../src/board/pg_parser'
import * as fs from 'fs';
import { Trace, TraceStep, NodeSet, LinkSet } from '../src/board/Trace'

let PG_DIR = 'test/pg_examples/'

test('basic .pg parsing test', () => {
    var filestr = fs.readFileSync(`${PG_DIR}ex1.pg`).toString()
    let pg = PGParser.import_pg_format(filestr)

    expect(pg.nodes.length).toBe(6)
    expect(pg.links.length).toBe(8)
    expect(pg.nodes[0].label).toBe("0")
    expect(pg.nodes[1].label).toBe("1")
    expect(pg.nodes[2].label).toBe('2 3"4')
    expect(pg.nodes[0].player).toBe(Player.Odd)
    expect(pg.nodes[2].player).toBe(Player.Even)
    expect(pg.nodes[0].priority).toBe(0)
    expect(pg.nodes[5].priority).toBe(3)

    let exp_str = PGParser.export_pg_format(pg)
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
test('trace test', () => {
    let t = new Trace({
        parity_game: PGParser.import_pg_format(fs.readFileSync('test/pg_examples/ex1.pg').toString()),
        algorithm_name: "Zmrd",
        steps: [
            new TraceStep({
                node_sets: [
                    new NodeSet({
                        name: "current",
                        node_ids: [0, 1]
                    }),

                    new NodeSet({
                        name: "next",
                        node_ids: [2, 3]
                    })
                ],
                link_sets: [
                    new LinkSet({
                        name: "pretty",
                        link_source_target_ids: [[1, 2], [3, 4]]
                    }),
                    new LinkSet({
                        name: "ugly",
                        link_source_target_ids: [[0, 5]]
                    })
                ],
                node_labels: {}
            })
        ]

    });
    const write_string = JSON.stringify(t);
    fs.writeFileSync('trace.json', write_string, 'utf8')
    const read_string = fs.readFileSync('trace.json', 'utf8')
    const o = JSON.parse(read_string)
    const res = new Trace(o)
})