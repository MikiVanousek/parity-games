export class NodeComponent {
  id: string;
  priority: number;
  isEven: boolean;

  constructor(id: string, priority: number, isEven: boolean) {
    this.id = id;
    this.priority = priority;
    this.isEven = isEven;
  }

  getElementDefinition() {
    return {
      data: { id: this.id, priority: this.priority, isEven: String(this.isEven) },
    };
  }
}
