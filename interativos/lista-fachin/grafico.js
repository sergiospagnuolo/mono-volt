var legend_width = 120;
var margin = {
        top: 20,
        right: 30,
        bottom: 20,
        left: 40
    },
    width = parseInt(d3.select('#chart').style('width'), 10),
    width = width - margin.left - margin.right,
    height = 500;
    //width = 960 - margin.left - margin.right + legend_width,
    //height = 450 - margin.top - margin.bottom;

var x = d3.scale.ordinal().rangeRoundBands([0, width - 220], .1);

var yAbsolute = d3.scale.linear() // for absolute scale
    .rangeRound([height, 0]);

var yRelative = d3.scale.linear() // for relative scale
    .rangeRound([height, 0]);

var color = d3.scale.ordinal().range(['#d7b5d8','#df65b0','#dd1c77','#980043']);


var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

var yAxisRelative = d3.svg.axis()
            .scale(yRelative)
            .orient("left")
            .outerTickSize("1")
            .innerTickSize("0")
            .tickFormat(d3.format(".%"));

var yAxisAbsolute = d3.svg.axis()
            .scale(yAbsolute)
            .orient("left")
            .tickFormat(d3.format(".2s"));

var svg = d3.select("#chart")
            .append("svg")
            .classed("svg-container", true)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            //.attr("preserveAspectRatio", "xMinYMin meet")
            //.attr("viewBox", "0 0 1200 550")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .classed("svg-content-responsive", true);

d3.tsv("dados.tsv", function(error, data) {
    color.domain(d3.keys(data[0]).filter(function(key) {
        return key !== "uf";
    }));
    data.forEach(function(d) {
        var estados = d.uf;
        var y0 = 0;
        d.crimes = color.domain().map(function(name) {
            return {
                estados: estados,
                name: name,
                y0: y0,
                y1: y0 += +d[name]
            };
        });
        d.total = d.crimes[d.crimes.length - 1].y1; // the last row	
        d.pct = [];
        for (var i = 0; i < d.crimes.length; i++) {
            var y_coordinate = +d.crimes[i].y1 / d.total;
            var y_height1 = (d.crimes[i].y1) / d.total;
            var y_height0 = (d.crimes[i].y0) / d.total;
            var y_pct = y_height1 - y_height0;
            d.pct.push({
                y_coordinate: y_coordinate,
                y_height1: y_height1,
                y_height0: y_height0,
                name: d.crimes[i].name,
                estados: d.uf,
                y_pct: y_pct
            });
        }
    });
    data.sort(function(a, b) {
        return b.total - a.total;
    });
    x.domain(data.map(function(d) {
        return d.uf;
    }));
    yAbsolute.domain([0, d3.max(data, function(d) {
        return d.total;
    })]); //Absolute View scale 
    
    yRelative.domain([0, 1]) // Relative View domain 
    var absoluteView = false // define a boolean variable, true is absolute view, false is relative view
    // Initial view is absolute 
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
    
    //Define the rect of Relative 		
    var stateRelative = svg.selectAll(".relative")
            .data(data)
            .enter()
            .append("g")
            .attr("class", "relative")
            .attr("transform", function(d) {
                return "translate(" + "0 " + ",0)";
            });
    
    stateRelative.selectAll("rect").data(function(d) {
        return d.pct;
    }).enter().append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) {
        return yRelative(d.y_coordinate);
    }).attr("x", function(d) {
        return x(d.estados)
    }).attr("height", function(d) {
        return yRelative(d.y_height0) - yRelative(d.y_height1); //distance 
    }).attr("fill", function(d) {
        return color(d.name)
    }).attr("stroke", "black").attr("stroke-width", 0.5)
        .attr("id", function(d) {
        return d.estados
    }).attr("class", "relative").attr("id", function(d) {
        return d.estados
    }).style("pointer-events", "all");
    
    stateRelative.selectAll("rect").on("mouseover", function(d) {
        if (!absoluteView) {
            var xPos = parseFloat(d3.select(this).attr("x"));
            var yPos = parseFloat(d3.select(this).attr("y"));
            var height = parseFloat(d3.select(this).attr("height"))
            d3.select(this).attr("stroke", "black").attr("stroke-width", 0.5);
            
            svg.append("text")
                .attr("x", xPos)
                .attr("y", yPos + height / 2)
                .attr("class", "tooltip")
                .text(Math.floor(d.y_pct.toFixed(2) * 100) + "% das acusações contra o " + d.estados);
        }
    }).on("mouseout", function() {
        svg.select(".tooltip").remove();
        d3.select(this).attr("stroke", "pink").attr("stroke-width", 0.2);
    })
    
    // End of define rect of relative		 
    // define rect for absolute 
    var stateAbsolute = svg.selectAll(".absolute")
                .data(data)
                .enter()
                .append("g")
                .attr("class", "absolute")
                .attr("transform", function(d) {
                    return "translate(" + "0" + ",0)";
                });
    
    stateAbsolute.selectAll("rect").data(function(d) {
        return d.crimes
    }).enter()
        .append("rect")
        .attr("width", x.rangeBand())
        .attr("y", function(d) {
        return yAbsolute(d.y1);
    }).attr("x", function(d) {
        return x(d.estados)
    }).attr("height", function(d) {
        return yAbsolute(d.y0) - yAbsolute(d.y1);
    }).attr("fill", function(d) {
        return color(d.name)
    }).attr("id", function(d) {
        return d.estados
    }).attr("class", "absolute")
        .style("pointer-events", "all")
        .attr("opacity", 0); // initially it is invisible, i.e. start with Absolute View 
    
    //define two different scales, but one of them will always be hidden. 	  	
    svg.append("g")
        .attr("class", "y axis absolute")
        .call(yAxisAbsolute)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("");
    
    svg.append("g")
        .attr("class", "y axis relative")
        .call(yAxisRelative)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("");
    
    svg.select(".y.axis.absolute")
               .style("opacity", 0);
    // end of define absolute
    
    // adding legend
    var legend = svg.selectAll(".legend")
        .data(color.domain().slice().reverse())
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
        return "translate(0," + i * 20 + ")";
    });
    
    legend
        .append("rect")
        .attr("x", width - 145 + legend_width)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", color);
    
    legend.append("text")
        .attr("x", width - 150 + legend_width)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {
        return d;
    });
    
    var clickButton = svg.selectAll(".clickButton")
                            .data([30, 30])
                            .enter()
                            .append("g")
                            .attr("class", "clickButton")
                            .attr("transform", "translate(0," + 180 + ")");
    
    clickButton.append("text")
        .attr("x", width + legend_width)
        .attr("y", 9)
        .attr("dy", "1em")
        .style("text-anchor", "end")
        .text("Mudar visualização")
        .style("text-decoration", "underline")
        .style("font-size", "15px")
        .style("cursor", "pointer")
        .attr("fill", "black")
        .attr("id", "clickChangeView");
    // start with relative view
    Transition2Relative();
    // Switch view on click the clickButton 
    d3.selectAll("#" + "clickChangeView").on("click", function() {
        if (absoluteView) { // absolute, otherwise relative 
            Transition2Relative();
        } else {
            Transition2Absolute();
        }
        absoluteView = !absoluteView // change the current view status 		
    });

    function Transition2Absolute() {
        //Currently it is Relative  
        stateRelative.selectAll("rect").transition().duration(2000).style("opacity", 0);
        stateAbsolute.selectAll("rect").transition().duration(2000).style("opacity", 1); //show absolute view rectangles 		
        svg.select(".y.axis.relative").transition().duration(2000).style("opacity", 0);
        svg.select(".y.axis.absolute").transition().duration(2000).style("opacity", 1); // show absolute view axis
    }

    function Transition2Relative() {
        //Currently it is absolute
        stateAbsolute.selectAll("rect").transition().duration(2000).attr("fill", function(d) {
            return color(d.name)
        })
        stateAbsolute.selectAll("rect").transition().duration(2000).style("opacity", 0); //show absolute view rectangles 		  
        stateRelative.selectAll("rect").transition().duration(2000).style("opacity", 1);
        svg.select(".y.axis.relative").transition().duration(2000).style("opacity", 1);
        svg.select(".y.axis.absolute").transition().duration(2000).style("opacity", 0); // show absolute view axis	  	
    }
});

d3.select(window).on('resize', resize);

function resize() {
    // update width
    width = parseInt(d3.select('#chart').style('width'), 10);
    width = width - margin.left - margin.right;

    // reset x range
    x.range([0, width - 200]);

    // do the actual resize...
}