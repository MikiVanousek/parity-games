import { assert } from "../src/assert";
import { examplePg } from "../src/board/ExamplePG";
import { ParityGame } from "../src/board/ParityGame";

test('Check parsing of PG', () => {
  const pg = examplePg;
  const pg2 = new ParityGame(JSON.parse(JSON.stringify(pg)))

  expect(pg2.nodes[0].sameAs(pg2.nodes[0])).toBe(true);
  expect(pg2.nodes[0].sameAs(pg2.nodes[1])).toBe(false);
});
test('Check implementation of ParityGame.equals', () => {
  let pg1 = ParityGame.emptyBoard();
  pg1.addNodeWith(0, 0);
  pg1.addNodeWith(1, 1);
  pg1.addNodeWith(2, 0);
  pg1.addLinkFromNodes(pg1.find_node_by_id(0), pg1.find_node_by_id(1));
  pg1.addLinkFromNodes(pg1.find_node_by_id(1), pg1.find_node_by_id(2));

  let pg2 = ParityGame.emptyBoard();
  pg2.addNodeWith(0, 0);
  pg2.addNodeWith(2, 0, 2);
  pg2.addNodeWith(1, 1, 1);
  pg2.addLinkFromNodes(pg2.find_node_by_id(1), pg2.find_node_by_id(2));
  pg2.addLinkFromNodes(pg2.find_node_by_id(0), pg2.find_node_by_id(1));

  expect(pg1.sameAs(pg2)).toBe(true);
  pg1.find_node_by_id(0).label = "zmrd";
  expect(pg1.sameAs(pg2)).toBe(true);
});