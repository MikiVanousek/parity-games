import { ParityGame } from "../pg/ParityGame";
import { JSONObject } from "ts-json-object";

type TraceStepFlexible =
  | [TraceStep]
  | [NodeSet[]]
  | [LinkSet[]]
  | [{ [key: number]: string }]
  | [NodeSet[], LinkSet[]]
  | [NodeSet[], { [key: number]: string }]
  | [LinkSet[], { [key: number]: string }]
  | [NodeSet[], LinkSet[], { [key: number]: string }];

export class Trace extends JSONObject {
  @JSONObject.required
  parity_game: ParityGame;
  @JSONObject.required
  algorithm_name: string;
  @JSONObject.required
  steps: TraceStep[];

  addStep(...args: TraceStepFlexible): void {
    let step: TraceStep | undefined;
    let nodeSets: NodeSet[] | undefined;
    let linkSets: LinkSet[] | undefined;
    let nodeLabels: { [key: number]: string } | undefined;

    // Identify arguments by their types
    args.forEach((arg) => {
      if (arg instanceof TraceStep) step = arg;
      else if (Array.isArray(arg) && arg.length > 0) {
        if (arg[0] instanceof NodeSet) nodeSets = arg;
        else if (arg[0] instanceof LinkSet) linkSets = arg;
      } else if (
        typeof arg === "object" &&
        !(arg instanceof Array) &&
        !(arg instanceof TraceStep)
      )
        nodeLabels = arg;
    });

    // Handle based on identified arguments
    if (step) {
      this.steps.push(step);
    } else {
      nodeLabels = nodeLabels || {};
      const newStep = new TraceStep({
        node_sets: nodeSets || [],
        link_sets: linkSets || [],
        node_labels: nodeLabels,
      });
      this.steps.push(newStep);
    }
  }

  // Check if the trace is valid, i.e. all nodes and links are in the parity game
  validate(): boolean {
    const valid_node_ids = new Set(
      this.parity_game.nodes.map((node) => node.id)
    );
    const valid_links = this.parity_game.links.map((link) => [
      link.source_id,
      link.target_id,
    ]);

    for (const step of this.steps) {
      for (const node_set of step.node_sets) {
        for (const node_id of node_set.node_ids) {
          if (!valid_node_ids.has(node_id)) {
            console.log(`Node ${node_id} not in parity game!`);
            return false;
          }
        }
      }

      for (const link_set of step.link_sets) {
        for (const trace_link of link_set.link_source_target_ids) {
          if (
            !valid_links.find(
              (valid_link) =>
                valid_link[0] === trace_link[0] &&
                valid_link[1] === trace_link[1]
            )
          ) {
            console.log(`Link ${trace_link} not in parity game!`);
            return false;
          }
        }
      }
    }
    return true;
  }

  uniqueSetNames(): string[] {
    const names = new Set<string>();
    this.steps.forEach((step) => {
      step.node_sets.forEach((ns) => names.add(ns.name));
      step.link_sets.forEach((ls) => names.add(ls.name));
    });
    return Array.from(names);
  }
}

export class TraceStep extends JSONObject {
  @JSONObject.required
  node_sets: NodeSet[];
  @JSONObject.required
  link_sets: LinkSet[];
  @JSONObject.required
  node_labels: { [key: number]: string };

  hasSet(name: string): boolean {
    return (
      this.node_sets.some((ns) => ns.name === name) ||
      this.link_sets.some((ls) => ls.name === name)
    );
  }
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
