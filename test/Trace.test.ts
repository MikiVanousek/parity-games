import { Trace, TraceStep, NodeSet, LinkSet } from "../src/board/Trace";
import { example_pg, trace_example as example_trace } from "../src/board/ExamplePG";
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

test('read write trace', () => {
    const file_name = dir + 'example.trace.json'

    const write_string = JSON.stringify(example_trace);
    fs.writeFileSync(file_name, write_string, 'utf8')
    const read_string = fs.readFileSync(file_name, 'utf8')
    expect(read_string).toEqual(write_string)

    const o = JSON.parse(read_string)
    const res = new Trace(o)
    expect(res).toEqual(example_trace)
})



