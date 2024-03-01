import { PG } from '../src/pg_diagram'
import { PGParser } from '../src/pg_parser'
import * as fs from 'fs';

test('PG model test', () => {
    var n = new PG.Node()
    n.index = 1
    expect(n.index).toBe(1);

    var s = new PG.TraceStep()
    s.node_labels[1] = "zmrd"
});

test('.pg parsing test', () => {
    var filestr = fs.readFileSync('test/pg_examples/ex1.pg').toString()
    // console.log(filestr)
    let pg = PGParser.parse_pg_format(filestr)
    expect(pg.nodes.length).toBe(6)
    expect(pg.links.length).toBe(8)
    expect(pg.nodes[0].label).toBe("0")
    expect(pg.nodes[1].label).toBe("1")
    expect(pg.nodes[2].label).toBe('2 3"4')
    expect(pg.nodes[0].player).toBe(PG.Player.Odd)
    expect(pg.nodes[2].player).toBe(PG.Player.Even)
    expect(pg.nodes[0].priority).toBe(0)
    expect(pg.nodes[5].priority).toBe(3)
})