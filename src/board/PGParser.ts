import { ParityGame } from './ParityGame';
import { Node, Player } from "./Node";
import { Link } from "./Link";
import { assert } from '../assert';

export module PGParser {
  export function importOinkFormat(
    file_content: string,
  ): ParityGame {
    // create a list of lines
    var lines = file_content.split("\n");
    let pg = ParityGame.emptyBoard();

    assert(lines[0].startsWith('parity '));

    let arc_id_pairs: [number, number][] = [];
    for (let l of lines.slice(1)) {
      if (l.length == 0) {
        // Empty line at the end of the file? If not, the assert on number of vertices will fail.
        continue;
      }
      var components = l.split(" "); // i-1 to also remove the spacebefore
      var node_label;
      if (components.length > 4) { // There is a label. If the label contains space, there will be more than 5 components.
        const end = l.slice(l.length - 2, l.length)
        console.log(end)
        assert(end == '";' || end == '";\n', `End of line is not '";' but '${end}'`);
        let j = l.length - 2; // It is the same as l.indexOf('"')
        let i = l.indexOf('"');
        node_label = l.slice(i + 1, j);
      } else {
        assert(components.length == 4);
        node_label = "";
      }

      var id = parseInt(components[0]);
      var priority = parseInt(components[1]);

      var player_str = components[2];
      assert(player_str == "1" || player_str == "0");
      var player = player_str === "1" ? Player.Odd : Player.Even;

      var arcs_str = components[3];
      var targets = arcs_str.split(",").map((i) => parseInt(i));
      for (let t of targets) {
        arc_id_pairs.push([id, t]);
      }

      let n = Node.new(id, priority, player, node_label);
      pg.addNode(n);
    }
    for (let [s, t] of arc_id_pairs) {
      let source_id = pg.find_node_by_id(s);
      let target_id = pg.find_node_by_id(t)
      if (source_id && target_id) {
        pg.addLink(Link.new(source_id.id, target_id.id));
      }
    }

    return pg;
  }

  export function exportOinkFormat(pg: ParityGame): string {
    // This is an evil hack, which assures you get the same output when importing and export .pg file with no labels.
    const skipLabels = pg.nodes.every((n) => n.label === "");
    var res = `parity ${pg.nodes.length};\n`;
    for (let n of pg.nodes) {
      let arc_str = pg
        .target_neighbors(n)
        .map((x) => x.id)
        .join(",");

      if (skipLabels) {
        res += `${n.id} ${n.priority} ${n.player} ${arc_str};\n`;
      } else {
        res += `${n.id} ${n.priority} ${n.player} ${arc_str} "${n.label}";\n`;
      }
    }
    return res;
  }

  function nodeToCy(node: Node): Object {
    return {
      data: {
        id: `${node.id}`,
        priority: node.priority,
        isEven: node.player === Player.Even ? "true" : "false",
        label: node.label,
      },
    };
  }

  function linkToCy(link: Link): Object {
    return {
      group: "edges",
      data: { id: `${link.source_id + "," + link.target_id}`, source: `${link.source_id}`, target: `${link.target_id}` },
    };
  }

  export function pgToCy(pg: ParityGame) {
    const nodes = pg.nodes.map((node) => nodeToCy(node));
    const links = pg.links.map((link) => linkToCy(link));
    return [...nodes, ...links];
  }

  export function cyToPg(cy) {
    const pg = ParityGame.emptyBoard();
    for (const n of cy.$("node")) {
      pg.addNode(Node.new(parseInt(n.id()), parseInt(n.data("priority")), n.data("isEven") === "true" ? Player.Even : Player.Odd, n.data("label")));
    }
    for (const l of cy.$("edge")) {
      pg.addLink(Link.new(parseInt(l.data("source")), parseInt(l.data("target"))));
    }
    return pg;
  }
}
