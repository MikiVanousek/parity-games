import { ParityGame } from './ParityGame';
import { JSONObject } from 'ts-json-object'

export class Trace extends JSONObject {
    @JSONObject.required
    parity_game: ParityGame;
    @JSONObject.required
    algorithm_name: string;
    @JSONObject.required
    steps: TraceStep[]
}

export class TraceStep extends JSONObject {
    @JSONObject.required
    node_sets: NodeSet[];
    @JSONObject.required
    link_sets: LinkSet[];
    @JSONObject.required
    node_labels: { [key: number]: string };
}

export class NodeSet extends JSONObject {
    @JSONObject.required
    name: string;
    @JSONObject.required
    node_ids: number[];
}

export class LinkSet extends JSONObject {
    @JSONObject.required
    name: string;
    @JSONObject.required
    link_source_target_ids: [number, number][];

}