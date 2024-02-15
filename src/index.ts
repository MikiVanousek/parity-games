import { greeter } from './dependency';

let btn = document.getElementById('test-btn')

if (!btn) {
  throw new Error('Button not found!');
}

btn.addEventListener('click', (event) => {
  document.body.textContent = greeter('Kryštof')
})

