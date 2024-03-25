import { Player } from "./Node";
import { ParityGame } from "./ParityGame";

let example_pg = ParityGame.emptyBoard();
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

export { example_pg };
