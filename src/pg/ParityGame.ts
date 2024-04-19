import { Node, Player } from "./Node";
import { Link } from "./Link";
import { JSONObject } from "ts-json-object";
import { assert } from "../assert";
import { deepEquals } from "./deepEquals";

// A class which represents a parity game and can be easily serialized. 
// It doesn't store any information about what the diagram of the parity game looks like (node positions, edge shapes, etc).
export class ParityGame extends JSONObject {
  @JSONObject.required
  @JSONObject.array(Node)
  nodes: Node[];
  @JSONObject.required
  @JSONObject.array(Link)
  links: Link[];

  // This is not serialized
  @JSONObject.custom((pg: ParityGame, key: string, value: number) => {
    const res = new Map<Node, Set<Node>>();
    pg.nodes.forEach((n) => res.set(n, new Set<Node>()));
    pg.links.forEach((l) => {
      res
        .get(pg.find_node_by_id(l.source_id))
        .add(pg.find_node_by_id(l.target_id));
    });
    return res;
  })
  adjList: Map<Node, Set<Node>>;

  static emptyBoard(): ParityGame {
    return new ParityGame({
      nodes: [],
      links: [],
      name: "New Parity Game",
      adjList: new Map<Node, Set<Node>>(),
    });
  }

  deepCopy(): ParityGame {
    const newNodes = this.nodes.map((node) => new Node(node));
    const newLinks = this.links.map((link) => new Link(link));
    const newAdjList = new Map<Node, Set<Node>>();
    this.adjList.forEach((targets, source) => {
      console.log("Targets: " + targets);

      const newSource = newNodes.find((n) => n.id === source.id);
      const newTargets = new Set<Node>();

      targets.forEach((target) => {
        // Find the corresponding new target node based on the original target node's id
        const newTarget = newNodes.find((n) => n.id === target.id);
        if (newTarget) {
          newTargets.add(newTarget);
        }
      });

      if (newSource) {
        newAdjList.set(newSource, newTargets);
      }
    });

    return new ParityGame({
      nodes: newNodes,
      links: newLinks,
      adjList: newAdjList,
    });
  }

  isEmpty(): boolean {
    return this.nodes.length === 0;
  }

  getMaxPriority(): number {
    return Math.max(...this.nodes.map((node) => node.priority));
  }

  getNodesWithPriority(priority: number): Node[] {
    console.log("nodes with prio:" + this.nodes);
    return this.nodes.filter((node) => node.priority === priority);
  }

  attractorSet(targetNodes: Node[], player: Player): Node[] {
    const attractor = new Set<Node>(targetNodes);
    const attractorIds = Array.from(attractor).map((n) => n.id);

    let isNotEmpty = true;
    while (isNotEmpty) {
      const nodesToAdd: Node[] = [];

      this.nodes.forEach((node) => {
        const successors = this.adjList.get(node);
        if (attractorIds.includes(node.id)) {
          return;
        }
        // if the node is owned by the player and there is an edge to attractor, we can add it to the attractor
        if (
          node.player === player &&
          Array.from(successors).some((successor) =>
            attractorIds.includes(successor.id)
          )
        ) {
          console.log("Adding to attractor: " + node);
          nodesToAdd.push(node);
        }
        // if its owned by a different player but every edge is connected to the attractor, we can add it to the attractor
        if (
          node.player !== player &&
          Array.from(successors).every((successor) =>
            attractorIds.includes(successor.id)
          )
        ) {
          console.log("Adding to attractor: " + node);
          nodesToAdd.push(node);
        }
      });

      if (nodesToAdd.length === 0) {
        isNotEmpty = false;
      } else {
        nodesToAdd.forEach((node) => attractor.add(node));
        nodesToAdd.forEach((node) => attractorIds.push(node.id));
      }
    }

    return Array.from(attractor);
  }

  removeNodes(nodesToRemove: Node[]): ParityGame {
    // Convert nodesToRemove to a Set of ids for efficient lookup
    console.log(nodesToRemove);
    console.log(this.nodes);
    const idsToRemove = new Set(nodesToRemove.map((node) => node.id));

    // remove adjacency list
    idsToRemove.forEach((idToRemove) => {
      this.adjList.delete(this.find_node_by_id(idToRemove));
      this.adjList.forEach((targets, source) => {
        if (targets.has(this.find_node_by_id(idToRemove))) {
          targets.delete(this.find_node_by_id(idToRemove));
        }
      });
    });

    this.nodes = this.nodes.filter((node) => !idsToRemove.has(node.id));

    // Also, remove any links associated with the removed nodes
    this.links = this.links.filter(
      (link) =>
        !idsToRemove.has(link.source_id) && !idsToRemove.has(link.target_id)
    );

    return this; // Allow chaining
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
    const s = this.adjList.get(source_node);
    s.add(this.find_node_by_id(link.target_id));
  }

  addNodeWith(
    priority: number,
    player: Player,
    id?: number,
    label?: string
  ): number {
    if (id === undefined) {
      id = this.next_node_id();
    }
    const node = Node.new(id, priority, player, label);
    return this.addNode(node);
  }
  addNode(node: Node): number {
    assert(
      this.nodes.findIndex((e) => e.id == node.id) < 0,
      "Node already exists!"
    );
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
    return this.links
      .filter((l) => l.source_id === n.id)
      .map((l) => l.target_id)
      .map((id) => this.find_node_by_id(id));
  }

  find_node_by_id(id: number): Node {
    const res = this.nodes.find((n) => n.id === id);
    assert(res !== undefined);
    return res;
  }
  next_node_id() {
    if (this.nodes.length === 0) {
      return 0;
    }
    return Math.max(...this.nodes.map((n) => n.id)) + 1;
  }

  getNodes(): Node[] {
    return this.nodes;
  }

  // It checks if the underlying parity game is the same. Labels and order of nodes and links do not matter, but the ids of nodes do (isomorphism is not detected).
  sameAs(other: ParityGame): boolean {
    if (
      this.nodes.length !== other.nodes.length ||
      this.links.length != other.links.length
    ) {
      return false;
    }
    for (const tn of this.nodes) {
      if (other.nodes.find((on) => tn.sameAs(on)) === undefined) {
        return false;
      }
    }
    for (const tl of this.links) {
      if (other.links.find((ol) => deepEquals(tl, ol)) === undefined) {
        return false;
      }
    }
    return true;
  }
}
