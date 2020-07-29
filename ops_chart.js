/* Encapsulate logic to draw CPI vs Salary chart */
function opsChart() {
    margin = {top: 20, bottom: 20, left: 20, right: 20};
    width = 800;
    height = 500;

    var svg = d3.select("#opschart")
        .selectAll("g.main")
        .data([0])
        .enter()
        .append("g")
        .attr("class", "main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   
    var xAxis = d3.scaleLinear()
        .domain([1985, 2020])
        .range([0, width - margin.left - margin.right]);

    var yAxis = d3.scaleLinear()
        .domain(agg_baseball.OPS_PLUS_extent)
        .range([height - margin.top - margin.bottom, 0]);

    var line = d3.line()
        .x( d => xAxis(d.year) )
        .y( d => yAxis(d.value));

            /* Add axis labels */
    svg.append("g")
        .attr("transform", "translate(0,"  + (height - margin.top - margin.bottom) + ")")
        .call(d3.axisBottom().scale(xAxis).tickFormat(d => d.toString()));
    svg.append("g")        
        .call(d3.axisLeft().scale(yAxis));
    
    function updateData(team1, team2) {
        // Shortcut for easier code
        var t1 = agg_baseball.OPS_PLUS[team1];
        var t2 = agg_baseball.OPS_PLUS[team2];

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
    }
    d3.select("#team1").on('change', helper);
    d3.select("#team2").on('change', helper);
    helper();
    function helper() {
        updateData(
            d3.select("#team1").node().value,
            d3.select("#team2").node().value);
    }

    return svg;
}