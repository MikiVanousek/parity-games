import { PG } from './PGBoard'
import { JSONObject } from 'ts-json-object'

export class Trace extends JSONObject {
    parity_game: PG.ParityGame;
    algorithm_name: string;
    steps: TraceStep[]
}

export class TraceStep extends JSONObject {
    node_sets: NodeSet[] = [];
    link_sets: LinkSet[] = [];
    node_labels: { [key: number]: string } = {};
}

export class NodeSet extends JSONObject {
    name: string;
    node_ids: number[];
}

export class LinkSet extends JSONObject {
    name: string;
    link_source_target_ids: [number, number][];

}