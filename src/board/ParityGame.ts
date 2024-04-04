import { Node, Player } from './Node';
import { Link } from './Link';
import { JSONObject } from 'ts-json-object';
import { assert } from '../assert';

export class ParityGame extends JSONObject {
  @JSONObject.required
  nodes: Node[];
  @JSONObject.required
  links: Link[];

  // This is not serialized
  @JSONObject.custom((pg: ParityGame, key: string, value: number) => {
    let res = new Map<Node, Set<Node>>();
    pg.nodes.forEach((n) => res.set(n, new Set<Node>()));
    pg.links.forEach((l) => {
      res.get(pg.find_node_by_id(l.source_id)).add(pg.find_node_by_id(l.target_id));
    });
    return res;
  })
  adjList: Map<Node, Set<Node>>;


  static emptyBoard(): ParityGame {
    return new ParityGame({ nodes: [], links: [], name: "New Parity Game", adjList: new Map<Node, Set<Node>>() });
  }

  addLinkFromNodes(source: Node, target: Node): void {
    assert(this.nodes.findIndex((e) => e.id == source.id) >= 0);
    assert(this.nodes.findIndex((e) => e.id == target.id) >= 0);
    assert(this.nodes.findIndex((e) => e === target) >= 0);
    this.addLink(Link.new(source.id, target.id));
  }

  addLink(link: Link): void {
    this.links.push(link);
    const source_node = this.find_node_by_id(link.source_id);
    let s = this.adjList.get(source_node);
    s.add(this.find_node_by_id(link.target_id));
  }

  addNodeWith(
    priority: number,
    player: Player,
    id?: number,
    label?: string,
    degree?: number
  ): number {
    if (id === undefined) {
      id = this.next_node_id();
    }
    const node = Node.new(id, priority, player, label);
    if (degree !== undefined) {
      node.setDegree(degree);
    }
    return this.addNode(node);
  }
  addNode(node: Node): number {
    assert(this.nodes.findIndex((e) => e.id == node.id) < 0, "Node already exists!");
    this.nodes.push(node);
    this.adjList.set(node, new Set());

    return node.id;
  }

  // Method to remove a node
  removeNode(nodeId: number): void {
    // Remove the node from the nodes array
    this.nodes = this.nodes.filter((node) => node.id !== nodeId);

    // Remove any links from the adjacency list that involve the node
    this.adjList.forEach((targets, source) => {
      if (source.id === nodeId) {
        // Remove the entire entry if the source is the node to be removed
        this.adjList.delete(source);
      } else {
        // Remove the node from the set of targets if present
        targets.forEach((target) => {
          if (target.id === nodeId) {
            targets.delete(target);
          }
        });
      }
    });

    // Optionally, if you maintain a links array, remove links from there as well
    this.links = this.links.filter(
      (link) => link.source_id !== nodeId && link.target_id !== nodeId
    );
  }

  // Method to remove a link
  removeLink(sourceId: number, targetId: number): void {
    // Find the source node
    const sourceNode = this.nodes.find((node) => node.id === sourceId);
    if (!sourceNode) return; // Source node not found



    // Get the set of target nodes from the adjacency list for the source node
    const targets = this.adjList.get(sourceNode);
    if (!targets) return; // No targets for source node



    // Find and remove the target node from the set of targets
    const targetNode = [...targets].find((node) => node.id === targetId);
    if (targetNode) {
      targets.delete(targetNode);
    }

    // Optionally, if you maintain a links array, remove the link from there as well
    this.links = this.links.filter(
      (link) => !(link.source_id === sourceId && link.target_id === targetId)
    );
  }

  target_neighbors(n: Node): Node[] {
    return this.links.filter((l) => l.source_id === n.id).map((l) => l.target_id).map((id) => this.find_node_by_id(id));
  }

  find_node_by_id(id: number): Node {
    let res = this.nodes.find((n) => n.id === id);
    assert(res !== undefined);
    return res;
  }
  next_node_id() {
    if (this.nodes.length === 0) {
      return 0;
    }
    return Math.max(...this.nodes.map((n) => n.id)) + 1;
  }
}