import { Player } from "./Node";
import { ParityGame } from "./ParityGame";
import { LinkSet, NodeSet, Trace, TraceStep } from "./Trace";
// Tests depend on the values of these two examples!
export let examplePg = ParityGame.emptyBoard();
examplePg.addNodeWith(1, Player.Even);
examplePg.addNodeWith(8, Player.Odd);
examplePg.addNodeWith(9, Player.Even);
examplePg.addNodeWith(10, Player.Odd);
examplePg.addNodeWith(7, Player.Even);
examplePg.addNodeWith(3, Player.Odd);
examplePg.addNodeWith(6, Player.Even);
examplePg.addNodeWith(4, Player.Odd);
examplePg.addNodeWith(0, Player.Even);
examplePg.addNodeWith(2, Player.Odd);

// Adding links between nodes
examplePg.addLinkFromNodes(examplePg.nodes[0], examplePg.nodes[8]);
examplePg.addLinkFromNodes(examplePg.nodes[1], examplePg.nodes[9]);
examplePg.addLinkFromNodes(examplePg.nodes[2], examplePg.nodes[9]);
examplePg.addLinkFromNodes(examplePg.nodes[3], examplePg.nodes[2]);
examplePg.addLinkFromNodes(examplePg.nodes[4], examplePg.nodes[7]);
examplePg.addLinkFromNodes(examplePg.nodes[5], examplePg.nodes[8]);
examplePg.addLinkFromNodes(examplePg.nodes[6], examplePg.nodes[9]);
examplePg.addLinkFromNodes(examplePg.nodes[7], examplePg.nodes[6]);
examplePg.addLinkFromNodes(examplePg.nodes[8], examplePg.nodes[2]);
examplePg.addLinkFromNodes(examplePg.nodes[9], examplePg.nodes[0]);
examplePg.addLinkFromNodes(examplePg.nodes[3], examplePg.nodes[9]);
examplePg.addLinkFromNodes(examplePg.nodes[2], examplePg.nodes[1]);
examplePg.addLinkFromNodes(examplePg.nodes[4], examplePg.nodes[0]);
examplePg.addLinkFromNodes(examplePg.nodes[8], examplePg.nodes[4]);
examplePg.addLinkFromNodes(examplePg.nodes[8], examplePg.nodes[3]);

export const exampleTrace = new Trace({
  parity_game: examplePg,
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
          link_source_target_ids: [[0, 8], [1, 9]]
        }),
        new LinkSet({
          name: "ugly",
          link_source_target_ids: [[2, 9]]
        })
      ],
      node_labels: { 0: "special", 1: "ordinary" }
    }),
    new TraceStep({
      node_sets: [
        new NodeSet({
          name: "current",
          node_ids: [4, 5]
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
      node_labels: { 2: "special", 3: "ordinary" }
    }),
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
          link_source_target_ids: [[0, 8], [1, 9]]
        }),
        new LinkSet({
          name: "ugly",
          link_source_target_ids: [[2, 9]]
        })
      ],
      node_labels: { 4: "special", 5: "ordinary" }
    }),
    new TraceStep({
      node_sets: [
        new NodeSet({
          name: "current",
          node_ids: [4, 5]
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
      node_labels: { 6: "special", 7: "ordinary" }
    })
  ]

});

