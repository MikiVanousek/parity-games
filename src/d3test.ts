import * as d3 from "d3";

export function d3test(container: HTMLElement) {
  var width = 928;
  var height = 500;

  var vertices = [
    { x: 80, y: 50 },
    { x: 50, y: 150 },
    { x: 250, y: 350 },
    { x: 150, y: 50 },
  ];

  var edges = [
    { source: 0, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 0 },
  ];

  var svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

  var nodes = svg
    .selectAll("circle")
    .data(vertices)
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return d.x;
    })
    .attr("cy", function (d) {
      return d.y;
    })
    .attr("r", 25)
    .attr("fill", "#69b3a2");

  let links = [];

  for (let i = 0; i < edges.length; i++) {
    links.push(
      d3.linkHorizontal()({
        source: [vertices[edges[i].source].x, vertices[edges[i].source].y],
        target: [vertices[edges[i].target].x, vertices[edges[i].target].y],
      })
    );
  }

  for (let i = 0; i < links.length; i++) {
    svg
      .append("path")
      .attr("d", links[i])
      .attr("stroke", "black")
      .attr("fill", "none");
  }

  container.append(svg.node()!);
}
