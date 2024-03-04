import {PG} from './pg_diagram'
import * as cytoscape from 'cytoscape';
//d3test(document.querySelector<HTMLElement>("#d3-test")!);

let pg = new PG.ParityGame();
let id = 0;
let cy = cytoscape({
    container: document.getElementById('cy'),
    elements: []
  });
let mouseX: number = 0;
let mouseY: number = 0;

document.addEventListener('mousemove', (event: MouseEvent) => {
  mouseX = event.clientX;
  mouseY = event.clientY;
});

document.addEventListener('keydown', (event: KeyboardEvent) => {
  const position = cy.container().getBoundingClientRect();
  const relativeX = mouseX - position.left + window.scrollX; // Adjusting for scrolling
  const relativeY = mouseY - position.top + window.scrollY; // Adjusting for scrolling

  switch(event.key) {
    case 'e': {
      console.log('dfdsfds')
      addNodeAtPosition(relativeX, relativeY, true)
      break;
    }
    case('o'): {
      addNodeAtPosition(relativeX, relativeY, false)
      break;
    }
  } 
});

function addNodeAtPosition(x: number, y: number, isEven: boolean) {
  id = pg.addNode(0, isEven ? PG.Player.Even : PG.Player.Odd)
  cy.add({
    group: 'nodes',
    data: { id: String(id)},
    position: { x: x, y: y }
  });
}


