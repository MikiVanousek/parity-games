import { Player } from "./Node";
import { ParityGame } from "./ParityGame";
import { LinkSet, NodeSet, Trace, TraceStep } from "./Trace";

export let example_pg = ParityGame.emptyBoard();
example_pg.addNodeWith(1, Player.Even);
example_pg.addNodeWith(8, Player.Odd);
example_pg.addNodeWith(9, Player.Even);
example_pg.addNodeWith(5, Player.Odd);
example_pg.addNodeWith(7, Player.Even);
example_pg.addNodeWith(3, Player.Odd);
example_pg.addNodeWith(6, Player.Even);
example_pg.addNodeWith(4, Player.Odd);
example_pg.addNodeWith(0, Player.Even);
example_pg.addNodeWith(2, Player.Odd);

// Adding links between nodes
example_pg.addLinkFromNodes(example_pg.nodes[0], example_pg.nodes[8]);
example_pg.addLinkFromNodes(example_pg.nodes[1], example_pg.nodes[9]);
example_pg.addLinkFromNodes(example_pg.nodes[2], example_pg.nodes[9]);
example_pg.addLinkFromNodes(example_pg.nodes[3], example_pg.nodes[2]);
example_pg.addLinkFromNodes(example_pg.nodes[4], example_pg.nodes[7]);
example_pg.addLinkFromNodes(example_pg.nodes[5], example_pg.nodes[8]);
example_pg.addLinkFromNodes(example_pg.nodes[6], example_pg.nodes[9]);
example_pg.addLinkFromNodes(example_pg.nodes[7], example_pg.nodes[6]);
example_pg.addLinkFromNodes(example_pg.nodes[8], example_pg.nodes[2]);
example_pg.addLinkFromNodes(example_pg.nodes[9], example_pg.nodes[0]);
example_pg.addLinkFromNodes(example_pg.nodes[3], example_pg.nodes[9]);
example_pg.addLinkFromNodes(example_pg.nodes[2], example_pg.nodes[1]);
example_pg.addLinkFromNodes(example_pg.nodes[4], example_pg.nodes[0]);
example_pg.addLinkFromNodes(example_pg.nodes[8], example_pg.nodes[4]);
example_pg.addLinkFromNodes(example_pg.nodes[8], example_pg.nodes[3]);

export const trace_example = new Trace({
  parity_game: example_pg,
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
          link_source_target_ids: [[0, 5]]
        })
      ],
      node_labels: {}
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
          link_source_target_ids: [[1, 2], [3, 4]]
        }),
        new LinkSet({
          name: "wierd",
          link_source_target_ids: [[0, 5]]
        })
      ],
      node_labels: {}
    })
  ]

});

