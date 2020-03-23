
// Main code that creates and runs the visualization

// Margin & Dimensions
let margin = { left: 0, right: 0, top: 0, bottom: 0 } // we keep this just in case we want to add margins later
let width = 1000 - margin.left - margin.right;
let height = 700 - margin.top - margin.bottom;

// Set radius of circles (nodes)
const radius = 20;
const textFontSize = 20;
const textYAdjucement = textFontSize*0.35;

// Append SVG and svg Group
let svg = d3.select("#main-canvas").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("class","border border-top-0 border-secondary")

// Generate some nodes and links
let nodes = [];
let links = [];
for(let i = 0; i < 12;i++) {
    nodes.push(new Node(i))
}

links.push(new Edge(0,5), new Edge(0,4), new Edge(0,3))

// Create force simulation and add the different forces
let simulation = d3.forceSimulation(nodes)
    // for setting the center of gravity of the system
    .force("center", d3.forceCenter(width/2,height/2))
    // for making elements attract or repel one another
    .force("charge", d3.forceManyBody().strength(-30))
    // for preventing elements overlapping
    .force("collide",d3.forceCollide(radius).strength(0.7))
    // for creating a fixed distance between connected elements
    .force("link",d3.forceLink(links)
        .id(d => d.id)
        .distance(radius*4)
        )

// Add svg group to hold everything
let g = svg.append("g")
    .attr("width", width)
    .attr("height", height)

// Create zoom behavior
let zoom = d3.zoom().on("zoom", zoomed)

// Add zooming and panning event listener to svg
svg.call(zoom)
$(document).on("keyup",keyupListener)

// ------------ SET UP ---------------//

// Add lines for every link in the dataset
let link_svg = g.append("g")
    .attr("class","links")
    .selectAll("line")
    .data(links)
    .enter().append("line")

// Add circles for every node in the dataset    
let node_svg = g.append("g")
    .attr("class","nodes")
    .selectAll("cirlce")
    .data(nodes, d => d.id)
    .enter().append("circle")
    .attr("r",d => radius)
    .attr("fill",d => d.id === 5 ? "blue" : "red")
    .call(dragBehaviourSetup(simulation))

// Add labels to each circle, showing its id    
let label_svg = g.append("g")
    .attr("class","node-labels")
    .selectAll(null)
    .data(nodes, d => d.id)
    .enter()
    .append("text")
    .attr("font-size", textFontSize+"px")
    .attr("text-anchor", "middle")
    .text(d => d.id)
    .call(dragBehaviourSetup(simulation))

// Add the tick event callback function
simulation.on("tick",update)

// ------------ FUNCTIONS ------------//

// Update the positions of the links and node
// OBS! Links most come before node because of the order they are drawn
function update() {
    link_svg
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y)

    node_svg
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)

    label_svg
        .attr("x",d => d.x)
        .attr("y",d => d.y + textYAdjucement)
}

function dragBehaviourSetup(simulation) {
    // Change the value of alpha, so things move around when we drag a node
    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.7).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    // Fix the position of the node that we are looking at
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    // Let the node do what it wants again once we've looked at it
    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

    return d3.drag() 
    .on("start",dragstarted)
    .on("drag", dragged)
    .on("end", dragended)
}

// Called when zooming, transforms the svg group by translation and scale
function zoomed() {
    g.attr("transform", d3.event.transform)
}

// Handles key presses
function keyupListener(event) {
    switch(event.key) {
        case "r": {
            svg.call(zoom.transform, d3.zoomIdentity)
        }
        break;
    }
}


// ------------ CLASSES ------------ //

function Node(id) {
    this.id = id;
}

function Edge(sourceId, targetId) {
    this.source = sourceId;
    this.target = targetId;
}