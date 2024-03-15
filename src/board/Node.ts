export enum Player {
  Odd = 1,
  Even = 0,
}

export class Node {
  priority: number;
  id: number;
  player: Player;
  label: string;
  degree: number = 0;

  constructor(
    priority: number,
    id: number,
    player: Player,
    label?: string,
  ) {
    this.priority = priority;
    this.id = id;
    this.player = player;
    this.label = label || "";
  }

  getElementDefinition() {
    return {
      data: {
        id: `${this.id}`,
        priority: this.priority,
        isEven: this.player === Player.Even ? "true" : "false",
        label: this.label,
      },
    };
  }

  setDegree(degree: number) {
    this.degree = degree;
  }

  getDegree() {
    return this.degree;
  }
}