function chart_all(container, data){
    ticker = data
                
    // Declare the chart dimensions and margins.
    const width = window.innerWidth * 6;
    const height = 600;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 60;
    const marginLeft = 40;

    // Declare the positional encodings.
    const x = d3.scaleUtc()
            .domain(d3.extent(ticker, d => d3.utcDay(d.Date)))
            .range([marginLeft, width - marginRight]);

    const y = d3.scaleLog()
        .domain([d3.min(ticker, d => d.Low), d3.max(ticker, d => d.High)])
        .rangeRound([height - marginBottom, marginTop]);

    
    // Create a div that holds two svg elements: one for the main chart and horizontal axis,
    // which moves as the user scrolls the content; the other for the vertical axis (which 
    // doesn’t scroll).
    const parent = d3.select(container).append("div");
    
    // append vertical axis
    parent.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y)
            .tickFormat(d3.format("$~f"))
            .tickValues(d3.scaleLinear().domain(y.domain()).ticks()))
        .call(g => g.selectAll(".tick line").clone()
            .attr("stroke-opacity", 0.2)
            .attr("x2", (width - marginLeft - marginRight)))
        .call(g => g.select(".domain").remove());

    
    // create scrolling div containing horizontal axis
    const body = parent.append("div")
            .style("overflow-x", "scroll")
            .style("-webkit-overflow-scrolling", "touch");
    
    // Create the SVG
    const svg = body.append("svg")
        .attr("viewBox", [0, 0, width, height]);

    // Append the horizontal axis.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
        .tickValues(d3.utcMonday
            .every(width > 720 ? 1 : 2)
            .range(+ticker.at(0).Date - 1, ticker.at(-1).Date))
        .tickFormat(d3.utcFormat("%-m/%-d/%-Y")))
        .call(g => g.select(".domain").remove())
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

    // Create a group for each day of data, and append two lines to it.
    const g = svg.append("g")
            .attr("stroke-linecap", "round")
            .attr("stroke", "black")
        .selectAll("g")
        .data(ticker)
        .join("g")
            .attr("transform", d => `translate(${x(d3.utcDay(d.Date))},0)`);

    g.append("line")
        .attr("y1", d => y(d.Low))
        .attr("y2", d => y(d.High));

    g.append("line")
        .attr("y1", d => y(d.Open))
        .attr("y2", d => y(d.Close))
        .attr("stroke-width", 5)
        .attr("stroke", d => d.Open > d.Close ? d3.schemeSet1[0]
            : d.Close > d.Open ? d3.schemeSet1[2]
            : d3.schemeSet1[8]);

    
    body.scrollBy(width, 0);

    
    // Append a title (tooltip).
    const formatDate = d3.utcFormat("%B %-d, %Y");
    const formatValue = d3.format(".2f");
    const formatChange = ((f) => (y0, y1) => f((y1 - y0) / y0))(d3.format("+.2%"));

    g.append("title")
        .text(d => `${formatDate(d.Date)}
    Open: ${formatValue(d.Open)}
    Close: ${formatValue(d.Close)} (${formatChange(d.Open, d.Close)})
    Low: ${formatValue(d.Low)}
    High: ${formatValue(d.High)}`);

    // // add annotation
    // const annotations = [
    //     {
    //         note: {
    //             label: "annotation label",
    //             title: "annotation title"
    //         },
    //         data: {
    //             Date: 
    //         }
    //     }
    // ]

}


