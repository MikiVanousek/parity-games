export class EdgeComponent {
  id: string;
  source: string;
  target: string;

  constructor(id: string, source: string, target: string) {
    this.id = id;
    this.source = source;
    this.target = target;
  }

  getElementDefinition() {
    return {
      data: { id: this.id, source: this.source, target: this.target },
    };
  }
}
