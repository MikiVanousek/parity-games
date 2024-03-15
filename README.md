# Parity Games

Try it! https://mikivanousek.github.io/parity-games/

### Development

Install all dependencies with:

```
npm ci
```

Compile and bundle:

```
npm run build
```

Then, refresh `dist/index.html`.

When developing use the command:

```
npm run watch
```

### Keyboard Shortcuts

Here's a list of all the keyboard shortcuts and their corresponding actions:

1. **e**: Adds a new node at the mouse position with the property `isEven` set to `true`.
2. **o**: Adds a new node at the mouse position with the property `isEven` set to `false`.
3. **q**: Toggles the `isEven` property of the selected nodes between `true` and `false`.
4. **Backspace/Delete**: Removes the selected elements (nodes or edges) from the graph.
5. **+**: Increments the `priority` data of the selected nodes by 1.
6. **-**: Decrements the `priority` data of the selected nodes by 1, ensuring it does not go below 0.
7. **p**: Logs the data of all elements in the graph to the console.
8. **Ctrl+C or Cmd+C**: Copies the selected elements.
9. **Ctrl+V or Cmd+V**: Pastes the copied elements with a slight offset to their position.
10. **Ctrl+Z or Cmd+Z**: Undoes the last action.
11. **Ctrl+Y or Cmd+Y**: Redoes the last undone action.
