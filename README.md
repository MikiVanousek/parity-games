# ParityGames.io

ParityGames.io is a web application, which facilitates research and understanding of parity games. You can create diagrams of parity games and easily visualize the steps different algorithms take to solve them.

[Try it!](https://mikivanousek.github.io/parity-games/)

## Development
Make sure `git` and `node` are installed on your system. Then clone this repository and install all libraries with:
```
npm ci
```

Compile and bundle:
```
npm run build
```

Then open `dist/index.html`.

When developing use the command:

```
npm run watch
```
Your changes will be automatically compiled and you can see them by refreshing the page.

## Parity Game Algorithms
You can use Zielonka algorithm out of the box. TODO How

You can use ParityGames.io to visualize the steps of any parity game algorithm. You will need an implementation of the said algorithm, which produces a **trace**: a list of steps, where each highlights some groups of nodes or links. For example, the last step in an algorithm could highlight the nodes that belong to the winning region of the odd and even player respectively.

Below, we outline two ways you can use ParityGames.io with your own algorithms: you can either implement the algorithm natively in TypeScript (JavaScript) or use a language of your choice to generate the trace file and import it into ParityGames.io.

### Native Implementation
This option will lead to the best experience, as you will be able to very easily generate a new trace for a parity game after you make changes to it. Your experience will be the same as when generating a trace with Zielonka. 

Follow the steps outlined in the [Development](#development) section to build the project and make sure everything works as you are used to from the online version. Then create a new file in `src/algo` whose structure mimics [`zielonka.ts`](TODO). Your algorithm will be a TypeScript (JavaScript) function which takes [`ParityGame`](src/board/ParityGame.ts) as input and returns a [`Trace`](src/board/Trace.ts). 

### Import Trace File
Your other option is to use any language, parse a parity game from the `.pg` file (used by [Oink](https://github.com/trolando/oink)) and create a `.pgtrace_json` file. The trace file is a JSON serialization of the [`Trace`](src/board/Trace.ts) class. you can find an example [here](test/Trace.test.ts).

This is not recommended, as you will have to export the parity game, run your program and import the trace file every time you make a change to the parity game. However, this option is useful if you have already implemented the algorithm in a different language and do not want to rewrite it in TypeScript.
