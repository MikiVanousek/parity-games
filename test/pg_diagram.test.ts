import { PG } from '../src/pg_diagram'
import { PGParser } from '../src/pg_parser'
import * as fs from 'fs';

test('dep test', () => {
    var n = new PG.Node()
    n.index = 1
    expect(n.index).toBe(1);

    var s = new PG.TraceStep()
    s.node_labels[1] = "zmrd"
});

test('parsing test', () => {
    var filestr = fs.readFileSync('test/pg_examples/ex1.pg').toString()
    // console.log(filestr)
    let pg = PGParser.parse_pg_format(filestr)
    expect(pg.nodes.length).toBe(6)
    expect(pg.links.length).toBe(8)
    expect(pg.nodes[0].label).toBe("0")
    expect(pg.nodes[1].label).toBe("1")
    expect(pg.nodes[2].label).toBe('2 3"4')
})