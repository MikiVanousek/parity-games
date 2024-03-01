import * as d3 from "d3";

export function d3test(container: HTMLElement) {
  var width = 928;
  var height = 500;

  var vertices = [
    { x: 80, y: 50, id: 1 },
    { x: 50, y: 150, id: 2 },
    { x: 250, y: 350, id: 3 },
    { x: 150, y: 50, id: 4 },
  ];

  var edges = [
    { source: 4, target: 1 },
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 4 },
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

  svg
    .append("svg:defs")
    .append("svg:marker")
    .attr("id", "triangle")
    .attr("refX", 6)
    .attr("refY", 6)
    .attr("markerWidth", 30)
    .attr("markerHeight", 30)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M 0 0 12 6 0 12 3 6")
    .style("fill", "black");

  for (let i = 0; i < edges.length; i++) {
    var link = calculateLinkCoordinates(
      {
        x: vertices.find((v) => v.id === edges[i].source)!.x,
        y: vertices.find((v) => v.id === edges[i].source)!.y,
      },
      {
        x: vertices.find((v) => v.id === edges[i].target)!.x,
        y: vertices.find((v) => v.id === edges[i].target)!.y,
      }
    );
    svg
      .append("line")
      .attr("x1", link.source.x)
      .attr("y1", link.source.y)
      .attr("x2", link.target.x)
      .attr("y2", link.target.y)
      .attr("stroke", "black")
      .attr("stroke-width", 1)
      .attr("marker-end", "url(#triangle)");
  }

  container.append(svg.node()!);
}

export function calculateLinkCoordinates(
  source: { x: number; y: number },
  target: { x: number; y: number }
) {
  let dx = target.x - source.x;
  let dy = target.y - source.y;
  let dr = Math.sqrt(dx * dx + dy * dy);
  let link = {
    source: {
      x: source.x + (dx / dr) * 25,
      y: source.y + (dy / dr) * 25,
    },
    target: {
      x: target.x - (dx / dr) * 25,
      y: target.y - (dy / dr) * 25,
    },
  };
  return link;
}
