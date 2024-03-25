import { JSONObject } from 'ts-json-object'

export enum Player {
  Odd = 1,
  Even = 0,
}

export class Node extends JSONObject {
  @JSONObject.required
  id: number;
  @JSONObject.required
  player: Player;
  @JSONObject.optional("")
  label: string;
  @JSONObject.optional(0)
  degree: number = 0;
  @JSONObject.optional(0)
  priority: number;

  static new(id: number, priority: number, player: Player, label: string): Node {
    return new Node({ id: id, player: player, priority: priority, label: label });
  }
  setDegree(degree: number) {
    this.degree = degree;
  }

  getDegree() {
    return this.degree;
  }
}