
var margin = {
        top: 20,
        right: 20,
        bottom: 30,
        left: 40
    },
    width = 960 - margin.right - margin.left,
    height = 500 - margin.bottom - margin.top,
    radius = Math.min(height, width) / 2,

    svg = d3.select("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")")
    .attr("class", "firstg")
    .on("click", function(d) {
        changeDiagram(false);
    }),

    xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.1),

    yScale = d3.scaleLinear()
    .range([height, 0]),

    bandwidthObject = {
        "height": {
            "min": 1,
            "max": 15
        },

        "weight": {
            "min": 1,
            "max": 105
        },

        "avg": {
            "min": 0.010023750000000001,
            "max": 0.328
        }
    }

    INITIAL_BANDWIDTH = 1,
    INITIAL_ATTRIBUTE = 'height',
    fileName = "baseball_data.csv",

    color = d3.scaleOrdinal()
    .range(["#BBDEFB", "#90CAF9", "#64B5F6", "#42A5F5", "#2196F3", "#1E88E5", "#1976D2"]),

    arc = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(0),

    largeArc = d3.arc()
    .outerRadius(radius + 20)
    .innerRadius(0),

    labelArc = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40),

    pie = d3.pie()
    .sort(null)
    .value(function(d) {
        return d.y;
    }),

    xMax = 960,
    xMin = 1,

    bandwidth = null,
    attribute = null,
    csvData = null,
    isBar = true,
    data = null;


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

function changeDiagram(val) {
    isBar = val;
    updateData();
}

function setUp() {
    d3.csv(fileName, function(error, data) {
        if (error)
            console.log("The file can't be loaded!");
        else {
            csvData = data;
            bandwidth = INITIAL_BANDWIDTH;
            attribute = INITIAL_ATTRIBUTE;

            progressBar.text("" + Math.round((bandwidth / bandwidthObject[attribute].max) * 100) + " %" + " of max bin size")
            progressBar.style("width", "" + (bandwidth / bandwidthObject[attribute].max) * 100 + "%")

            updateData();
        }
    })
}

function mouseOverFunction(d) {
    d3.selectAll(".a" + d.x.replaceAll(" ", "_").replaceAll(".", "_"))
        .style("display", "block");
    d3.selectAll(".b" + d.x.replaceAll(" ", "_").replaceAll(".", "_"))

        .attr("x", function(d) {
            return xScale(d.x) - 3;
        })
        .attr("y", function(d) {
            return yScale(d.y) - 5;
        })
        .attr("width", xScale.bandwidth() + 6)
        .attr("height", function(d) {
            return height - yScale(d.y) + 5;
        })

}


function mouseOutFunction(d) {
    d3.selectAll(".a" + d.x.replaceAll(" ", "_").replaceAll(".", "_"))
        .style("display", "none")
    d3.selectAll(".b" + d.x.replaceAll(" ", "_").replaceAll(".", "_"))
        .attr("width", xScale.bandwidth())
        .attr("x", function(d) {
            return xScale(d.x);
        })
        .attr("height", function(d) {
            return height - yScale(d.y);
        })
        .attr("y", function(d) {
            return yScale(d.y);
        })
}

function pieMouseOverFunction(d) {
    d3.selectAll(".c" + d.data.x.replaceAll(" ", "_").replaceAll(".", "_"))
        .attr("d", largeArc);

}

function pieMouseOutFunction(d) {
    d3.selectAll(".c" + d.data.x.replaceAll(" ", "_").replaceAll(".", "_"))
        .attr("d", arc);
}

function updateData() {

    var max = Math.max.apply(Math, csvData.map(function(d) {
            return d[attribute];
        })),
        min = Math.min.apply(Math, csvData.map(function(d) {
            return d[attribute];
        })),
        numBuckets = Math.ceil((max - min) / bandwidth),

        map = {},
        arr = new Array(numBuckets);

    var tempMin = min;
    for(var i = 0; i < arr.length; i++){
        tempMin = Math.round(tempMin * 100) / 100;

        arr[i] = {
            min: Math.round(tempMin * 100) / 100,
            max: Math.round((tempMin + bandwidth) * 100) / 100,
            val: 0
        };

        tempMin += bandwidth;
        

    }
    


    csvData.forEach(function(d) {
        var val = d[attribute];
        val = +val;
        for(var i = 0; i < arr.length; i++){
            if(val >= arr[i].min && val <= arr[i].max)
                arr[i].val++;
        }
    })

    for (var i = 0; i < arr.length; i++) {
        map["" + arr[i].min + " - " + arr[i].max] = arr[i].val;
    }
    data = map;

    if (isBar)
        renderBarGraph();
    else
        renderPieDiagram();


}

function set_bandwidth(newBandwidth) {
    bandwidth = newBandwidth;
    updateData();
}

function set_attribute(newAttribute) {
    attribute = newAttribute;
    if (attribute === "height")
        bandwidth = 2;
    else if (attribute === "weight")
        bandwidth = 6;
    else if (attribute === "avg"){
        bandwidth = 0.01;
    }
        

    updateData();
}

var divElement = d3.select("body")
    .append("div")
    .style("background-color", "#adc3d6")
    .style("height", "25px")
    .style("width", "960px")
    .style("margin-left", "auto")
    .style("margin-right", "auto")
    .style("margin-bottom", "auto")
    .style("margin-top", "25px")
    .style("text-align", "center")
    .style("vertical-align", "middle")
    .text("Move the mouse over this region")

    .on("mousemove", function(d, i) {
        var coordinates = d3.mouse(this);
        bandwidth = (coordinates[0] / xMax) * (bandwidthObject[attribute].max - bandwidthObject[attribute].min) + bandwidthObject[attribute].min;
        if(attribute !== "avg")
            bandwidth = Math.round(bandwidth)
        updateData();
        progressBar.text("" + Math.round((bandwidth / bandwidthObject[attribute].max) * 100) + "%" + " of max bin size")
        progressBar.style("width", "" + (bandwidth / bandwidthObject[attribute].max) * 100 + "%")
    })

var divElement = d3.select("body")
    .append("div")
    .style("height", "15px")
    .style("width", "960px")
    .style("margin", "auto")

var progressBar = divElement.append("div")
    .attr("id", "aravind")
    .attr("class", "progress-bar")
    .attr("role", "progressbar")
    .attr("aria-valuenow", "60")
    .attr("aria-valuemin", "0")
    .attr("aria-valuemax", "100")
    .style("width", "60%")
    .style("margin", "auto")
    

    


function tweenPie(b) {
    b.innerRadius = 0;
    var i = d3.interpolate({
        startAngle: 0,
        endAngle: 0
    }, b);
    return function(t) {
        return arc(i(t));
    };
}

function renderPieDiagram() {

    var arr = []

    for (var i in data) {
        arr.push({
            x: i,
            y: data[i]
        })
    }

    data = arr;
    svg.remove();

    svg = d3.select("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .on("click", function(d) {
            changeDiagram(true);
        })

    var g = svg.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    g.append("path")
        .attr("d", arc)
        .on("mouseover", function(d) {
            pieMouseOverFunction(d)
        })
        .on("mouseout", function(d) {
            pieMouseOutFunction(d)
        })
        .style("fill", function(d) {
            return color(d.data.x);
        })
        .attr("class", function(d) {
            return "c" + d.data.x.replaceAll(" ", "_")
                .replaceAll(".", "_");
        })
        .transition()
        .ease(d3.easeLinear)
        .duration(2000)
        .attrTween("d", tweenPie);


    g.append("text")
        .transition()
        .ease(d3.easeLinear)
        .duration(2000)
        .attr("transform", function(d) {
            return "translate(" + labelArc.centroid(d) + ")";
        })
        .attr("dy", ".35em")
        .text(function(d) {
            return d.data.x;
        });
}

function renderBarGraph() {
    var arr = []
    for (var i in data) {
        arr.push({
            x: i,
            y: data[i]
        })
    }
    data = arr;

    xScale.domain(data.map(function(d) {
        return d.x;
    }));

    yScale.domain([0, d3.max(data, function(d) {
        return d.y;
    })]);

    svg.remove();

    svg = d3.select("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")
        .attr("class", "firstg")
        .on("click", function(d) {
            changeDiagram(false);
        })

    svg.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .on("mouseover", function(d) {
            mouseOverFunction(d)
        })
        .on("mouseout", function(d) {
            mouseOutFunction(d)
        })
        .attr("height", 0)
        .attr("y", height)
        .transition().duration(3000)
        .delay(function(d, i) {
            return i * 200;
        })
        .attr("x", function(d) {
            return xScale(d.x);
        })
        .attr("y", function(d) {
            return yScale(d.y);
        })
        .attr("width", xScale.bandwidth())
        .attr("height", function(d) {
            return height - yScale(d.y)
        })
        .attr("fill", function(d, i) {
            return 'rgb(20, 20, ' + ((i * 30) + 100) + ')'
        })
        .attr("class", function(d) {
            return "b" + d.x.replaceAll(" ", "_")
                .replaceAll(".", "_");
        })

    svg.selectAll('text')
        .data(data)
        .enter()
        .append('text')
        .text(function(d) {
            return d.y
        })
        .attr("fill", "blue")
        .attr("font-size", 15)
        .attr('x', function(d) {
            return xScale(d.x) + 10;
        })
        .attr('y', function(d) {
            return yScale(d.y) - 5
        })
        
        .style("display", "none")
        .attr("class", function(d) {
            return "a" + d.x.replaceAll(" ", "_")
                .replaceAll(".", "_");
        })

    var xAxisText = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "x axis")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("font-size", "10px")

    if(attribute === "avg" && bandwidth < 0.02426643619791667){
        xAxisText.attr("transform", "rotate(-60)")
            .style("font-size", "7px")
            .attr("dy", "0.25em")
            .attr("dx", "-0.8em")
            .style("text-anchor", "end")
    }

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale))

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "top")
        .text("Frequency");

    svg.append("text")
        .attr("transform",
            "translate(" + (width / 2) + " ," +
            (height + margin.top + 3) + ")")
        .style("text-anchor", "middle")
        .text(function(){
            if(attribute === "height")
                return "Height";
            else if(attribute === "weight")
                return "Weight";
            else
                return "Average";
        });

}

function setHeight(){
    set_attribute("height")
    d3.select("#selectorButton")
        .text("Height")
}

function setWeight(){
    set_attribute("weight")
    d3.select("#selectorButton")
        .text("Weight")
}

function setAverage(){
    set_attribute("avg")
    d3.select("#selectorButton")
        .text("Average")
}
setUp();