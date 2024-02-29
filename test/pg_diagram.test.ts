import { PG } from '../src/pg_diagram'

test('dep test', () => {
    var n = new PG.Node()
    n.id = 1
    expect(n.id).toBe(1);

    var s = new PG.TraceStep()
    s.node_labels[1] = "zmrd"
});