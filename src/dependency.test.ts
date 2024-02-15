import { greeter } from './dependency';

test('dep test', () => {
    expect(greeter("Kryštof")).toBe("Hello, Kryštof");
});