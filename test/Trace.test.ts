import { Trace, TraceStep, NodeSet, LinkSet } from "../src/board/Trace";
import { pg as parity_example } from "../src/board/ExamplePG";
import * as fs from 'fs';
import { ParityGame } from "../src/board/ParityGame";

const dir = 'test/'
const trace_example = new Trace({
    parity_game: parity_example,
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

test('read write parity', () => {
    const file_name = dir + 'parity.json'

    const write_string = JSON.stringify(parity_example);
    fs.writeFileSync(file_name, write_string, 'utf8')
    const read_string = fs.readFileSync(file_name, 'utf8')
    const o = JSON.parse(read_string)
    const res = new ParityGame(o)
    expect(res).toEqual(parity_example)
});

test('read write trace', () => {
    const file_name = dir + 'trace.json'

    const write_string = JSON.stringify(trace_example);
    fs.writeFileSync(file_name, write_string, 'utf8')
    const read_string = fs.readFileSync(file_name, 'utf8')
    expect(read_string).toEqual(write_string)

    const o = JSON.parse(read_string)
    const res = new Trace(o)
    expect(res).toEqual(trace_example)
})




