import { greeter } from '../src/dependency';

test('dep test', () => {
    expect(greeter("Kryštof")).toBe("Hello, Kryštof");
});