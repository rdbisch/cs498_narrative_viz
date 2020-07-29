opsChart2_setup = false;

/* Encapsulate logic to draw CPI vs Salary chart */
function opsChart2() {
    console.log("opsChart2 blah blah");
    margin = {top: 20, bottom: 20, left: 20, right: 20};
    width = 800;
    height = 500;

    var svg = d3.select("#opschart2")
        .selectAll("g.main")
        .data([0])
        .enter()
        .append("g")
        .attr("class", "main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    extent = [null, null];
    function restateData(X) {
        var temp = [];
        for (const [key, value] of Object.entries(X)) {
            var t = value.ops_plus_ab / value.salary;
            if (!extent[0]) { extent = [t, t]; }
            if ( t < extent[0] ) extent[0] = t;
            if ( t > extent[1] ) extent[1] = t;
            temp.push(
                {
                    year: key,
                    name: value.name, 
                    initials: initials(value.name),
                    ops_plus_ab: value.ops_plus_ab,
                    salary: value.salary,
                    ratio: value.ops_plus_ab / value.salary
                }
            );
        }
        return temp;
    }

    // helper function to get player initials
    function initials(name) {
        names = name.split(" ");
        return names[0][0] + names[1][0];
    }

    var xAxis = d3.scaleLinear()
        .domain([1985, 2020])
        .range([0, width - margin.left - margin.right]);

    var yAxis = d3.scaleLinear()
        .domain([0, 0.5])
        .range([height - margin.top - margin.bottom, 0]);

    var line = d3.line()
        .x( d => xAxis(d.year) )
        .y( d => yAxis(d.ratio));

    /* Add axis labels */
    svg.append("g")
        .attr("transform", "translate(0,"  + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom().scale(xAxis).tickFormat(d => d.toString()));
    svg.append("g")
        .call(d3.axisLeft().scale(yAxis));

    function updateData(team1, team2) {
        // Shortcut for easier code
        var t1 = restateData(agg_baseball.best[team1]);
        var t2 = restateData(agg_baseball.best[team2]);        
        var t = d3.transition()
            .duration(1500);

        d3.select("#opschart2")
          .select("g.main")
          .selectAll("text.team1")
            .data(t1)
            .join(
                enter => enter.append("text")
                    .attr("class", "team1")
            )
            .transition(t)
            .attr("x", d => xAxis(d.year))
            .attr("y", d => yAxis(d.ratio))
            .text(d => d.initials)
            .style("font-size", "12")
            .attr("stroke", "#e66100");

        d3.selectAll("#opschart2")
            .select("g.main")
            .selectAll("text.team2")
            .data(t2)
            .join(
                enter => enter.append("text")
                    .attr("class", "team2")
            )
            .transition(t)
            .attr("x", d => xAxis(d.year))
            .attr("y", d => yAxis(d.ratio))
            .text(d => d.initials)
            .style("font-size", "12")
            .attr("stroke", "#5d3a9b");

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

    d3.select("#team3").on('change', helper);
    d3.select("#team4").on('change', helper);
    helper();
    function helper() {
        updateData(
            d3.select("#team3").node().value,
            d3.select("#team4").node().value);
    }
}
