/* Encapsulate logic to draw CPI vs Salary chart */
function opsChart(team1, team2) {
    margin = {top: 20, bottom: 20, left: 20, right: 20};
    width = 1000;
    height = 500;
    plotArea = [width - margin.left - margin.right, height - margin.top - margin.bottom ];

    // Shortcut for easier code
    var t1 = agg_baseball.OPS_PLUS[team1];
    var t2 = agg_baseball.OPS_PLUS[team2];

    console.log("This is t1.");
    console.log(t1);
    console.log("====");

    var svg = d3.select("#opschart");
   
    var xAxis = d3.scaleLinear()
        .domain([1985, 2020])
        .range([margin.left, plotArea[0]]);

    var yAxis = d3.scaleLinear()
        .domain(agg_baseball.OPS_PLUS_extent)
        .range([plotArea[1], margin.bottom]);

    var line = d3.line()
        .x( d => xAxis(d.year) )
        .y( d => yAxis(d.value));

    var t = d3.transition()
        .duration(1500);

    svg.selectAll("path.team1")
        .data([0])
        .join(
            enter => enter.append("path")
                .attr("class", "team1")
        )
        .datum(t1)
        .transition(t)     
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#e66100")
        .attr("stroke-width", 3);

    svg.selectAll("path.team2")
        .data([0])        
        .join(
            enter => enter.append("path")
                .attr("class", "team2")
        )
        .datum(t2) 
        .transition(t)      
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#5d3a9b")
        .attr("stroke-width", 3);

    /* Add team logos at the end of the chart */
    svg.selectAll("image")
        .data([0, 1])
        .join(
            enter => enter.append("svg:image")
        )
        .transition(t)      
        .attr("xlink:href", d => {
            if (d == 0) return agg_baseball.team_dict[team1].icon;
            else return agg_baseball.team_dict[team2].icon;
        })
        .attr("x", xAxis(2017))
        .attr("y", function(d) {
            if (d == 0) return yAxis(t1[31].value);
            else return yAxis(t2[31].value);
        })
        .attr("width", 40)
        .attr("height", 40);

    /* Add axis labels */
    svg.append("g")
        .attr("transform", "translate(0," + (plotArea[1]) + ")")
        .call(d3.axisBottom().scale(xAxis).tickFormat(d => d.toString()));
    svg.append("g")
        .call(d3.axisLeft().scale(yAxis));

    return svg;
}