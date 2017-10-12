var margin = { top: 50, right: 300, bottom: 50, left: 50 },
    outerWidth = 1050,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();

var xCat = "x",
    yCat = "y",
    //rCat = "Protein (g)",
    colorCat = "brand";

var brandList = [];
var x_coords = [], y_coords = [];

d3.csv("app/src/fb.csv", function(data) {    
    data.forEach(function(d) {
        x_coords.push(parseFloat(d[xCat]));
        y_coords.push(parseFloat(d[yCat]));
        brandList.push(d[colorCat]);
        //d["x"] = +d["x"];
        //d["y"] = +d["y"];
        /*d.Calories = +d.Calories;
        d.Carbs = +d.Carbs;
        d["Cups per Serving"] = +d["Cups per Serving"];
        d["Dietary Fiber"] = +d["Dietary Fiber"];
        d["Display Shelf"] = +d["Display Shelf"];
        d.Fat = +d.Fat;
        d.Potassium = +d.Potassium;
        d["Protein (g)"] = +d["Protein (g)"];
        d["Serving Size Weight"] = +d["Serving Size Weight"];
        d.Sodium = +d.Sodium;
        d.Sugars = +d.Sugars;
        d["Vitamins and Minerals"] = +d["Vitamins and Minerals"]; */
    });

    var xMax = x_coords.sort(function(a,b) {return a-b})[x_coords.length-1],
        xMin = x_coords.sort(function(a,b) {return a-b})[0],
        yMax = y_coords.sort(function(a,b) {return a-b})[y_coords.length-1],
        yMin = y_coords.sort(function(a,b) {return a-b})[0];
    /*var xMax = d3.max(data, function(d) { return d[xCat]; }), //* 1.05,
        xMin = d3.min(data, function(d) { return d[xCat]; }),
        xMin = xMin > 0 ? 0 : xMin,
        yMax = d3.max(data, function(d) { return d[yCat]; }), //* 1.05,
        yMin = d3.min(data, function(d) { return d[yCat]; });
        yMin = yMin > 0 ? 0 : yMin; */

    //console.log("xmax: ", xMax);
    //console.log("xmin: ", xMin);
    //console.log("ymax: ", yMax);
    //console.log("ymin: ", yMin);

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-height);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(-width);

    var color = d3.scale.category10();

    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return d[colorCat] + "<br>" + "(" + d[xCat] + ", " + d[yCat] + ")";
    });

    var zoomBeh = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([0, 500])
        .on("zoom", zoom);

    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoomBeh);

    svg.call(tip);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .classed("x axis", true)
        .call(xAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "translate(0," + height + ")")
        .attr("x", width)
        .attr("y", margin.bottom - 10)
        //.style("text-anchor", "end")
        //.text(xCat);

    svg.append("g")
        .classed("y axis", true)
        .call(yAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", ".71em")
        //.style("text-anchor", "end")
        //.text(yCat);

    var objects = svg.append("svg")
        .classed("objects", true)
        .attr("width", width)
        .attr("height", height);

    objects.append("svg:line")
        .classed("axisLine hAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("transform", "translate(0," + height + ")");

    objects.append("svg:line")
        .classed("axisLine vAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height);

    objects.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .classed("dot", true)
        //.attr("r", function (d) { return 6 * Math.sqrt(d[rCat] / Math.PI); })
        .attr("r", 4)
        .attr("transform", transform)
        .style("fill", function(d) { return color(d[colorCat]); })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .classed("legend", true)
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("circle")
        //.attr("r", 3.5)
        .attr("cx", width + 20)
        .attr("fill", color);

    /*legend.append("text")
        .attr("x", width + 26)
        .attr("dy", ".35em")
        .text(function(d) { return d; }); */

    //d3.select("input").on("click", change);

    function change() {
        xCat = "x";
        xMax = d3.max(data, function(d) { return d[xCat]; });
        xMin = d3.min(data, function(d) { return d[xCat]; });

    zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));

    var svg = d3.select("#scatter").transition();

    svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);

    objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
    }

    function zoom() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        svg.selectAll(".dot")
            .attr("transform", transform);
    }

    function transform(d) {
        return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
    }

    
    $('#searchOptions').autocomplete({
        source: brandList.sort()
    });
    
    $("#searchOptions").keyup(function (e) {
        if (e.keyCode == 13) {
            console.log('pressed enter');
            searchBrand();
        }
    });
    //var svg = d3.select("body").append("svg")
    //.attr("width", width)
    //.attr("height", height);

    d3.selectAll("button").on("click", searchBrand);

    function searchBrand() {
        //var selectedBrand = document.getElementById('searchOptions').value;
        //var svg = d3.select("#scatter").transition();
         //var svg = d3.select("#scatter").append("svg")
        //.attr("width", width)
        // .attr("height", height);
        //    svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);
        //    objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
        //var selectedBrand = $('#searchOptions').val();
        var selectedBrand = this.value;
        console.log(selectedBrand);
        var node = svg.selectAll(".dot");
        if (selectedBrand == "none") {
            node.style("stroke", "white").style("stroke-width", "1");
        } else {
            var selected = node.filter(function (d, i) {
                return d.name != selectedBrand;
            });
            selected.style("opacity", "0");
            var link = svg.selectAll(".link")
            link.style("opacity", "0");
            d3.selectAll(".node, .link").transition()
                .duration(5000)
                .style("opacity", 1);
        }
    }
    
});



