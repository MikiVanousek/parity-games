import { JSONObject } from 'ts-json-object'
import { Node } from './Node'

export class Link extends JSONObject {
  @JSONObject.required
  source_id: number;
  @JSONObject.required
  target_id: number;

  static new(source_id: number, target_id: number): Link {
    return new Link({ source_id: source_id, target_id: target_id })
  }
  getElementDefinition() {
    return {
      group: "edges",
      data: { source: `${this.source_id}`, target: `${this.target_id}` },
    };
  }
}