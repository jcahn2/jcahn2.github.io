function chart_all(container, data){
    ticker = data
                
    // Declare the chart dimensions and margins.
    const width = 1000;
    const height = 420;
    const marginTop = 20;
    const marginRight = 20;
    const marginBottom = 60;
    const marginLeft = 30;

    const x = d3.scaleUtc()
            .domain(d3.extent(ticker, d => d3.utcDay(d.Date)))
            .range([marginLeft, width - marginRight]);

    const y = d3.scaleLog()
        .domain([d3.min(ticker, d => d.Low), d3.max(ticker, d => d.High)])
        .rangeRound([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.select(container).append("svg")
        .attr("viewBox", [0, 0, width, height]);

    // Append the axes.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
        .tickValues(d3.utcMonday
            .every(8)
            .range(+ticker.at(0).Date - 1, ticker.at(-1).Date))
        .tickFormat(d3.utcFormat("%-m/%-d/%-Y")))
        .call(g => g.select(".domain").remove())
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y)
            .tickFormat(d3.format("$~f"))
            .tickValues(d3.scaleLinear().domain(y.domain()).ticks()))
        .call(g => g.selectAll(".tick line").clone()
            .attr("stroke-opacity", 0.2)
            .attr("x2", (width - marginLeft - marginRight)))
        .call(g => g.select(".domain").remove());

    // Append a title (tooltip).
    const formatDate = d3.utcFormat("%B %-d, %Y");
    const formatValue = d3.format(".2f");
    const formatChange = ((f) => (y0, y1) => f((y1 - y0) / y0))(d3.format("+.2%"));

    // tooltip definition
    var Tooltip = d3.select("#tooltip")
                        .style("opacity", 0)
                        .style("position", "absolute")
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "3px")
                        .style("padding", "5px");
    
    // Create a group for each day of data
    const g = svg.append("g")
        .selectAll("g")
        .data(ticker)
        .append("path")
        .attr("d", d3.line()
            .x(d => x(d3.utcDay(d.Date)))
            .y(d => d.Open)
        )
            .attr("stroke", d3.schemeSet2[0])
            .style("stroke-width",4)
            .style("fill", "none")
        .on("mouseover", function(d){
            Tooltip.style("opacity",1)
        })
        .on("mousemove", function(d){
            Tooltip.html(`${formatDate(d.Date)}
            Open: ${formatValue(d.Open)}`
            );
            
            Tooltip
            .style("position", "absolute")
            .style("left", (d3.event.pageX + 50) + "px")
            .style("top", (d3.event.pageY) + "px")
        })
        .on("mouseleave", function(d){
            Tooltip.style("opacity",0)
        });


}



