import { ParityGame } from "../board/ParityGame";
import { Node } from "../board/Node";
import { Player } from "../board/Node";

export class PGListener {
  pg: ParityGame;
  cy: any;
  constructor(pg, cy) {
    this.pg = pg;
    this.cy = cy;
    cy.on("remove", "node", (event) => {
      console.log("Removing node ", event.target.id());
      pg.removeNode(parseInt(event.target.id()));
    });
    cy.on("remove", "link", (event) => {
      console.log("Removing node ", event.target.id());
      pg.removeLink(parseInt(event.target.source().id()), parseInt(event.target.target().id()));
    });

    cy.on("add", "node", (e) => {
      console.log("Adding node ", e.target.id());
      const n = Node.new(parseInt(e.target.id()), parseInt(e.target.priority), e.target.isEven ? Player.Even : Player.Odd, e.target.label);
      pg.addNode(n);
    });
    cy.on("add", "link", (event) => {
      pg.addLinkFromNodes(pg.find_node_by_id(parseInt(event.target.source().id())), pg.find_node_by_id(parseInt(event.target.target().id())));
    });
    cy.on("afterDo", (event, names) => {
      if (names == "editPriority") {
        for (const n of event.target.selectedNodes) {
          pg.find_node_by_id(parseInt(n.id())).priority = event.target.priority;
        }
      }
    });
  }

}