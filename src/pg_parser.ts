var assert = require('assert');

import { PG } from './pg_diagram'

export module PGParser {
    // Broken if vertex label includes space
    export function import_pg_format(file: string): PG.ParityGame {
        // create a list of lines
        var lines = file.split("\n")

        let pg = new PG.ParityGame()
        let arc_id_pairs: [number, number][] = []
        for (let l of lines.slice(1)) {
            if (l.length == 0) {
                // Empty line at the end of the file? If not, the assert on number of vertices will fail.
                continue
            }
            assert(l.slice(l.length - 2, l.length) == '";')
            let i = l.indexOf('"')
            let j = l.length - 2// It is the same as l.indexOf('"')
            var node_label = l.slice(i + 1, j)

            var components = l.slice(0, i - 1).split(" ") // i-1 to also remove the spacebefore 
            assert(components.length === 4)
            var id = parseInt(components[0])
            var priority = parseInt(components[1])

            var player_str = components[2]
            assert(player_str == "1" || player_str == "0")
            var player = player_str === "1" ? PG.Player.Odd : PG.Player.Even

            var arcs_str = components[3]
            var targets = arcs_str.split(",").map((i) => parseInt(i))
            for (let t of targets) {
                arc_id_pairs.push([id, t])
            }


            let n: PG.Node = { priority: priority, index: id, player: player, label: node_label }
            pg.nodes.push(n)
        }
        for (let [s, t] of arc_id_pairs) {
            pg.links.push({ source: pg.nodes[s], target: pg.nodes[t] })
        }
        assert(lines[0] === `parity ${pg.nodes.length};`)
        return pg
    }

    export function export_pg_format(pg: PG.ParityGame): string {
        var res = `parity ${pg.nodes.length};\n`
        for (let n of pg.nodes) {
            let arc_str = pg.target_neighbors(n).map((x) => x.index).join(",")
            res += `${n.index} ${n.priority} ${n.player} ${arc_str} "${n.label}";\n`
        }
        return res
    }
}