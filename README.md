# ParityGames.io: GUI for Parity Game Research and Teaching
Do you ever draw a parity game example on a whiteboard? Never again. ParityGames.io is a GUI that will meet your needs as a parity game researcher or educator. It allows you to import, create and modify parity games and their diagrams with ease. We provide quality-of-life features like undo & redo, automatic layout and locked vertex groups. For any parity game, with the press of a button, you can generate and see a trace of the steps a parity game solver took.

[Try it!](https://mikivanousek.github.io/parity-games/) You can open the manual by pressing the `?` button or the `?` key on your keyboard. It is also possible to install it as a progressive web application, the instruction differ based on your browser and operating system.

## Building ParityGames.io
If you just want to use ParityGames.io, we encourage you to use it in the browser or install it as a progressive web application. But if you want to customize it, develop integrate new parity game solvers, you will need to build it locally. Make sure `git` and `node` are installed on your system. Then clone this repository and install all libraries with:
```
npm ci
```

Compile and bundle:
```
npm run build
```

Then open `dist/index.html` with your browser. You should see the app as you would see it online.

When developing use the command:

```
npm run watch
```
Your changes will be automatically compiled and you can see them by refreshing the page.

## Customizing Keyboard Shortcuts
You can customize the keyboard shortcuts in the [`src/keymap/keymap.ts`](src/keymap/keymap.ts). An action can by triggered by any number of keys. Find the action you would like to change and add or change the key which triggers it.

## Parity Game Algorithms
You can use ParityGames.io to visualize the steps of any parity game solver. You will need an implementation of the solver, which produces a **trace**: a list of steps, where each highlights some groups of nodes or links. For example, the last step in an algorithm could highlight the nodes that belong to the winning region of the odd and even player respectively. Also, each step can can add labels to individual nodes.

You can use Zielonka algorithm out of the box just by pressing a button. Below, we outline two ways you can use ParityGames.io with your own algorithms: you can either implement the algorithm natively in TypeScript (JavaScript) or use a language of your choice to generate the trace file and import it into ParityGames.io.

### Native Implementation
This option will lead to the best experience, as you will be able to very easily generate a new trace for a parity game after you make changes to it. Your experience will be the same as when generating a trace with Zielonka. 

Follow the steps outlined in the [Development](#development) section to build the project and make sure everything works as you are used to from the online version. Then create a new file in `src/algo` whose structure mimics [`zielonka.ts`](TODO). Your algorithm will be a TypeScript (JavaScript) function which takes [`ParityGame`](src/board/ParityGame.ts) as input and returns a [`Trace`](src/board/Trace.ts). 

**Beware** that using someone else's parity game algorithm on your computer will execute any code they wrote on your computer. Make sure to carefully review the code before running it, or at least make sure you trust the person giving the algorithm to you.

### Import Trace File
Your other option is to use any language, parse a parity game from the `.pg` file (used by [Oink](https://github.com/trolando/oink)) and create a `.pgtrace_json` file. The trace file is a JSON serialization of the [`Trace`](src/board/Trace.ts) class. you can find an example [here](test/Trace.test.ts).

This is not recommended, as you will have to export the parity game, run your program and import the trace file every time you make a change to the parity game. However, this option is useful if you have already implemented the algorithm in a different language and do not want to rewrite it in TypeScript.
