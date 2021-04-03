const GDPdataEndpoint =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json';

const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 50,
};

const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;
const barWidth = width / 275;

const tooltip = d3
  .select('.bar-chart')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);

let svgContainer = d3
  .select('.bar-chart')
  .append('svg')
  .attr(
    'viewBox',
    `0 0 ${width + margin.left + margin.right}  ${
      height + margin.top + margin.bottom
    }`
  )
  .attr('width', width + 100)
  .attr('height', height + 60);

const getQuarter = (month) => {
  const quarter = {
    isQ1: ['01', '02', '03'].includes(month),
    isQ2: ['04', '05', '06'].includes(month),
    isQ3: ['07', '08', '09'].includes(month),
    isQ4: ['10', '11', '12'].includes(month),
  };

  if (quarter.isQ1) {
    return 'Q1';
  } else if (quarter.isQ2) {
    return 'Q2';
  } else if (quarter.isQ3) {
    return 'Q3';
  } else if (quarter.isQ4) {
    return 'Q4';
  }
};

const addXlabel = (svgContainer, width, height) => {
  svgContainer
    .append('text')
    .attr('x', width)
    .attr('y', height + 40)
    .text('Year');
};

const addYlabel = (svgContainer) => {
  svgContainer
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -200)
    .attr('y', 80)
    .text('Gross Domestic Product');
};

const addXaxis = (svgContainer, xAxis, height) => {
  svgContainer
    .append('g')
    .call(xAxis)
    .attr('id', 'x-axis')
    .attr('transform', `translate(60, ${height})`);
};

const addYaxis = (svgContainer, yAxis) => {
  svgContainer
    .append('g')
    .call(yAxis)
    .attr('id', 'y-axis')
    .attr('transform', 'translate(60, 0)');
};

const buildTooltipContent = (years, gdpArray, index) => {
  const calendarEmoji = '&#128197';
  const dollarsEmoji = '&#128181;';

  return (
    `${calendarEmoji} ` +
    years[index] +
    '<br>' +
    `${dollarsEmoji} $` +
    gdpArray[index].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,')
  );
};

const buildBarChart = ({ data }) => {
  const years = data.map((item) => {
    let month = item[0].slice(5, 7);
    return item[0].slice(0, 4) + ' | ' + getQuarter(month);
  });

  const yearsDate = data.map((item) => new Date(item[0]));

  const yearMax = new Date(d3.max(yearsDate));
  yearMax.setMonth(yearMax.getMonth() + 3);
  const xScale = d3
    .scaleTime()
    .domain([d3.min(yearsDate), yearMax])
    .range([0, width]);

  const xAxis = d3.axisBottom().scale(xScale);
  addXaxis(svgContainer, xAxis, height);

  const gdpArray = data.map((item) => item[1]);
  let scaledGDP = [];
  const gdpMax = d3.max(gdpArray);
  const linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, height]);
  scaledGDP = gdpArray.map((item) => linearScale(item));

  const yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([height, 0]);
  const yAxis = d3.axisLeft(yAxisScale);
  addYaxis(svgContainer, yAxis);

  addYlabel(svgContainer);
  addXlabel(svgContainer, width, height);

  d3.select('svg')
    .selectAll('rect')
    .data(scaledGDP)
    .enter()
    .append('rect')
    .attr('data-gdp', (d, i) => data[i][1])
    .attr('data-date', (d, i) => data[i][0])
    .attr('data-index', (d, i) => i)
    .attr('class', 'bar')
    .attr('width', barWidth)
    .attr('height', (d) => d)
    .attr('x', (d, i) => xScale(yearsDate[i]))
    .attr('y', (d) => height - d)
    .attr('transform', 'translate(60, 0)')

    .on('mouseover', (e, d) => {
      const [x, y] = d3.pointer(e) || [];
      const index = e.currentTarget.dataset.index;

      tooltip.transition().duration(200).style('opacity', 0.9);
      tooltip
        .html(buildTooltipContent(years, gdpArray, index))
        .attr('data-date', data[index][0])
        .style('left', index * barWidth + 50 + 'px')
        .style('top', y - 50 + 'px')
        .style('transform', 'translateX(60px)');
    })

    .on('mouseout', function () {
      tooltip.transition().duration(200).style('opacity', 0);
    });
};

d3.json(GDPdataEndpoint).then((response) => {
  buildBarChart(response);
});
