import { JSONObject } from 'ts-json-object'
import { Node } from './Node'

export class Link extends JSONObject {
  @JSONObject.required
  source: Node;
  @JSONObject.required
  target: Node;

  getElementDefinition() {
    return {
      group: "edges",
      data: { source: `${this.source.id}`, target: `${this.target.id}` },
    };
  }
}