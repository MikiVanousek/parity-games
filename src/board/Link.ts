import { JSONObject } from 'ts-json-object'
import { Node } from './Node'

export class Link extends JSONObject {
  @JSONObject.required
  source_id: number;
  @JSONObject.required
  target_id: number;
}