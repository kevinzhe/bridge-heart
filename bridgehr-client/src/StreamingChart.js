import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import SmoothieComponent from 'react-smoothie';

class StreamingChart extends Component {

  constructor(props) {
    super(props);
    this.chart = React.createRef();
    this.state = {
      width: 400
    };
  }

  addTimeSeries(params) {
    return this.chart.current.addTimeSeries({}, params);
  }

  componentDidMount() {
    const parent = ReactDOM.findDOMNode(this.chart.current).parentNode;
    var chartWidth = parent.clientWidth;
    const cs = getComputedStyle(parent);
    chartWidth -= parseFloat(cs.paddingLeft);
    chartWidth -= parseFloat(cs.paddingRight);
    chartWidth -= parseFloat(cs.borderLeftWidth);
    chartWidth -= parseFloat(cs.borderRightWidth);
    this.setState({width: chartWidth});
  }

  yrange(range) {
    const max = 5;
    const min = 0.1;
    const curRange = Math.max(Math.abs(range.min), Math.abs(range.max));
    const newRange = Math.max(min, Math.min(max, curRange));
    return {
      min: -newRange,
      max: +newRange
    };
  }

  render() {
    return (
      <SmoothieComponent
        ref={this.chart}
        width={this.state.width}
        height={75}
        grid={{
          strokeStyle: '#00000000',
          fillStyle: '#00000000',
          verticalSections: 0,
          borderVisible: false,
          labels: {
            disabled: true
          }
        }}
        labels={{
          fillStyle: '#000000ff'
        }}
        millisPerPixel={5}
        interpolation={'linear'}
        yRangeFunction={this.yrange}
      />
    );
  }

}

export default StreamingChart;
