import { Node } from './Node'

export class Link {
  source: Node;
  target: Node;

  constructor(source: Node, target: Node) {
    this.source = source;
    this.target = target;
  }

  getElementDefinition() {
    return {
      group: "edges",
      data: { source: `${this.source.id}`, target: `${this.target.id}` },
    };
  }
}