/******************variable declarations for d3 scatter plot***************/

var margin = { top: 50, right: 300, bottom: 50, left: 50 },
    outerWidth = 1100,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();

var xCat = "x",
    yCat = "y",
    brandCat = "brand";

var brandList = [];
var x_coords = [], y_coords = [];
var dataset_coords_info = [];

d3.csv("/app/src/merged_fb_data_coords.csv", function(data){ 
    data.forEach(function(d) {
        x_coords.push(parseFloat(d[xCat]));
        y_coords.push(parseFloat(d[yCat]));
        brandList.push(d[brandCat]);
        dataset_coords_info.push([d[brandCat],parseFloat(d[xCat]),parseFloat(d[yCat])]);
    });

    var xMax = x_coords.sort(function(a,b) {return a-b})[x_coords.length-1],
        xMin = x_coords.sort(function(a,b) {return a-b})[0],
        yMax = y_coords.sort(function(a,b) {return a-b})[y_coords.length-1],
        yMin = y_coords.sort(function(a,b) {return a-b})[0];

    // console.log("xMax: ", xMax);
    // console.log("xMin: ", xMin);
    // console.log("yMax: ", yMax);
    // console.log("yMin: ", yMin);
    
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
            return d[brandCat] + "<br>" + "(" + d[xCat] + ", " + d[yCat] + ")";     //remove the coordinates
    });
    
    var zoomBeh = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([0, 500])
        .on("zoom", zoom);
    
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("id", "main_svg")
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

    svg.append("g")
        .classed("y axis", true)
        .call(yAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", ".71em")

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
        .attr("r", 4)
        .attr("r", function(d) {
            if(d["likes"] <= 30000)
                return 3;
            else if(d["likes"] > 30000 && d["likes"] <= 477000)
                return 5;
            else    
                return 7;
        })
        .attr("transform", transform)
        .style("fill", function(d) { return color(d[brandCat]); })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .classed("legend", true)
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("circle")
        .attr("cx", width + 20)
        .attr("fill", color);   

    function zoomIntoBrand(selectedBrand, x_measure, y_measure){
        xCat = "x";
        yCat = "y";
        zoomBeh.x(x.domain([x_measure-5, x_measure+5])).y(y.domain([y_measure-3, y_measure+3]));
                
        var svg = d3.select("#scatter").transition();
        svg.select(".x.axis").duration(1000).call(xAxis).select(".label").text(xCat);
        svg.select(".y.axis").duration(1000).call(yAxis).select(".label").text(yCat);
        objects.selectAll(".dot")
            .transition().duration(1000).attr("transform", transform)
            //.filter(function(d) { return d["brand"] == selectedBrand; })
            //   .transition().duration(1000).call(tip.show);//attr('class', 'd3-tip animate').call(tip.show);
            //.transition().duration(10000).style("pointer-events", "all");
        
    }
    /*
    function change() {
        xCat = "x";
        yCat = "y";
        xMax = d3.max(data, function(d) { return d[xCat]; });
        xMin = d3.min(data, function(d) { return d[xCat]; });
        yMax = d3.max(data, function(d) { return d[yCat]; });
        yMin = d3.min(data, function(d) { return d[yCat]; });
        zoomBeh.y(y.domain([yMin, yMax])).x(x.domain([xMin, xMax]));
                
        var svg = d3.select("#scatter").transition();
        svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);
        svg.select(".y.axis").duration(750).call(yAxis).select(".label").text(yCat);
        objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
    }*/

    function zoom() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        svg.selectAll(".dot")
            .attr("transform", transform);
    }

    function transform(d) {
        return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
    }

/********render of search feature and call of function*************/

    var options_autocomplete = {
        data: brandList,
        list: {
            match: {
                enabled: true
            }
        },
        theme: "blue-light"
    };
    
    $("#searchOptions").easyAutocomplete(options_autocomplete);
    
    $('#searchOptions').keyup(function (e) {
        if (e.keyCode == 13) {
            console.log('pressed enter');
            searchBrand();
        }
    });

    d3.select("button").on("click", searchBrand);

    /*********search and modify scatter plot accordingly***************/

    function searchBrand() {
    
        var selectedBrand = $('#searchOptions').val();
        var index = -1;
        for (var i=0; i<dataset_coords_info.length; i++) {
            if(dataset_coords_info[i][0] == selectedBrand){
                index = i;
            }
        }
        if(index != -1) {
            zoomIntoBrand(selectedBrand, dataset_coords_info[index][1], dataset_coords_info[index][2]);
        }
        else {
            alert("Sorry! Brand "+ selectedBrand + " not found.");
        }
    }
});



