import { Trace, TraceStep, NodeSet, LinkSet } from "../src/board/Trace";
import { example_pg, trace_example as example_trace, trace_example } from "../src/board/ExamplePG";
import * as fs from 'fs';
import { ParityGame } from "../src/board/ParityGame";

const dir = 'test/'

test('read write parity', () => {
    const file_name = dir + 'parity.json'

    const write_string = JSON.stringify(example_pg);
    fs.writeFileSync(file_name, write_string, 'utf8')
    const read_string = fs.readFileSync(file_name, 'utf8')
    const o = JSON.parse(read_string)
    const res = new ParityGame(o)
    expect(res).toEqual(example_pg)
});

test('trace read write', () => {
    const file_name = dir + 'example.trace.json'

    const write_string = JSON.stringify(example_trace);
    fs.writeFileSync(file_name, write_string, 'utf8')
    const read_string = fs.readFileSync(file_name, 'utf8')
    expect(read_string).toEqual(write_string)

    const o = JSON.parse(read_string)
    const res = new Trace(o)
    expect(res).toEqual(example_trace)
})

test('trace validaton test', () => {
    expect(example_trace.validate()).toBe(true)
    example_trace.steps.push(
        new TraceStep({
            node_sets: [
                new NodeSet({
                    name: "current",
                    // Node 10 is not in the parity game
                    node_ids: [10, 5]
                }),

                new NodeSet({
                    name: "other",
                    node_ids: [6]
                })
            ],
            link_sets: [
                new LinkSet({
                    name: "pretty",
                    link_source_target_ids: [[3, 2], [4, 7]]
                }),
                new LinkSet({
                    name: "wierd",
                    link_source_target_ids: [[8, 4]]
                })
            ],
            node_labels: {}
        })
    );
    expect(example_trace.validate()).toBe(false)
    example_trace.steps.pop()
    expect(example_trace.validate()).toBe(true)
    example_trace.steps.push(
        new TraceStep({
            node_sets: [
                new NodeSet({
                    name: "current",
                    node_ids: [10, 5]
                }),

                new NodeSet({
                    name: "other",
                    node_ids: [6]
                })
            ],
            link_sets: [
                new LinkSet({
                    name: "pretty",
                    link_source_target_ids: [[9, 0], [4, 7]]
                }),
                new LinkSet({
                    name: "wierd",
                    link_source_target_ids: [[6, 4]]
                })
            ],
            node_labels: {}
        })
    )
    example_trace.steps.push(
        new TraceStep({
            node_sets: [
                new NodeSet({
                    name: "current",
                    node_ids: [10, 5]
                }),

                new NodeSet({
                    name: "other",
                    node_ids: [6]
                })
            ],
            link_sets: [
                new LinkSet({
                    name: "pretty",
                    link_source_target_ids: [[3, 2], [4, 7]]
                }),
                new LinkSet({
                    name: "wierd",
                    link_source_target_ids: [[8, 4]]
                })
            ],
            node_labels: {}
        })
    )
    expect(example_trace.validate()).toBe(false)
});




