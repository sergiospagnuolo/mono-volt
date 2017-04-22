---
categories: mundo
intro: Taxa de comparecimento às urnas em relação à população com idade de voto nos EUA comparada às maiores democracias com voto obrigatório
title: O voto obrigatório nos EUA aumentaria comparecimento às urnas?
layout: post-no-feature
author_name: Sérgio Spagnuolo
author_url: /author/sergio
author_avatar: sergio
show_avatar: true
feature_image: taxa-votos.png
show_related_posts: true
tags:
  - 'eleição, '
  - 'voto obrigatório, '
  - EUA
---

##### Gráfico interativo

### Descrição

Taxa de comparecimento às urnas em relação à população com idade de voto nos EUA comparada às maiores democracias com voto obrigatório, em eleições gerais. Não inclui eleição presidencial americana de 2016.

<div id="scatter"> </div>

<script src="http://d3js.org/d3.v3.min.js"></script>

### Referências

* [International Institute for Democracy and Electoral Assistance, IDEA](http://www.idea.int/data-tools/question-view/524)

<style>
.axis path,
.axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}

.dot {
  stroke: #;
}

.tooltip {
  position: absolute;
  width: 200px;
  height: 40px;
  pointer-events: none;
}

#scatter{
  max-width: 800px;
  min-widh: 500px;
}
</style>


<script>
var margin = {
    top: 20,
    right: 10,
    bottom: 30,
    left: 0
  },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

var xValue = function(d) {
    return d.year;
  },
  xScale = d3.scale.linear().range([0, width]),
  xMap = function(d) {
    return xScale(xValue(d));
  },
  xAxis = d3.svg.axis().scale(xScale).orient("bottom").ticks(10,"d");


var yValue = function(d) {
    return d.vapvt;
  },
  yScale = d3.scale.linear().range([height, 0]),
  yMap = function(d) {
    return yScale(yValue(d));
  },
  yAxis = d3.svg.axis().scale(yScale).orient("left");

// cores
var cValue = function(d) {
    return d.country;
  },
  color = d3.scale.category10();

var svg = d3.select("#scatter").append("svg")
  .attr("viewBox", "0 0 600 400")
  .append("g")
  .style("font", "14px Inconsolata")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// tooltip
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

//  data
d3.csv("https://cdn.rawgit.com/voltdatalab/dados/master/politica/eua-vs-mandatory.csv", function(error, data) {

  // csv para numero
  data.forEach(function(d) {
    d.vap = +d.vap;
    d.vapvt = +d.vapvt;
    d.year = +d.year;
    //console.log(d);
  });

  xScale.domain([d3.min(data, xValue) - 1, d3.max(data, xValue) + 1]);
  yScale.domain([d3.min(data, yValue) - 1, d3.max(data, yValue) + 1]);

  // x-axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .append("text")
    .attr("class", "label")
    .attr("x", width)
    .attr("y", -6)
    .style("text-anchor", "end")
    .style("font", "1.1em Inconsolata")
    .text("");

  // y-axis
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("class", "label")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .style("font", "1em Inconsolata")
    .text("Taxa de participação nas urnas em %");

  // dots
  svg.selectAll(".dot")
    .data(data)
    .enter().append("circle")
    .attr("class", "dot")
    .attr("r", 4)
    .style("opacity", .8)
    .attr("cx", xMap)
    .attr("cy", yMap)
    .style("fill", function(d) {
      return color(cValue(d));
    })
    .on("mouseover", function(d) {
      tooltip.transition()
        .duration(50)
        .attr("min-height", "120px")
        .style("opacity", 1)
        .style("background-color", "#cbcbcb")
        .style("font", "12px Inconsolata")
        .style("padding", "10px");

      tooltip.html("Year:<strong> " + d.year + "</strong>" + "<br/>"+ "Voting age pop: "+ d.vap + "</strong> <br/>" +
          "Turnout rate: <strong> " + yValue(d) + " %</strong>")
        .style("left", (d3.event.pageX + 5) + "px")
        .style("top", (d3.event.pageY - 28) + "px")
        .style("bottom", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });

  //  legenda
  var legend = svg.selectAll(".legend")
    .data(color.domain())
    .enter().append("g")
    .attr("class", "legend")
    .style("font", "18px Inconsolata")
    .attr("transform", function(d, i) {
      return "translate(0," + i * 20 + ")";
    });

  // legenda retangular
  legend.append("rect")
    .attr("x", width / 1.24)
    .attr("y", 225)
    .attr("width", 8)
    .attr("height", 18)
    .style("fill", color);

  // texto legenda
  legend.append("text")
    .attr("x", width / 1.2)
    .attr("y", 235)
    .attr("dy", ".35em")
    .style("font", ".8em Inconsolata")
    .style("text-anchor", "right")
    .text(function(d) {
      return d;
    })
});

</script>
