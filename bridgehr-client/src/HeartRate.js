import React, { Component } from 'react';
import SmoothieComponent from 'react-smoothie';
import { IirFilter, CalcCascades, Fft } from 'fili';
import CanvasCamera from './CanvasCamera';
import { rgbToHsv } from './util';

class HeartRate extends Component {

  static defaultProps = {
    onBeat: (time) => { }
  }

  static FRAMERATE = 30;
  static FFT_RADIX = 4096;
  static HISTORY_SAMPLES = HeartRate.FRAMERATE * 10;
  static HISTORY_FILLER = new Array((HeartRate.FFT_RADIX - HeartRate.HISTORY_SAMPLES)/2).fill(0);

  constructor(props) {
    super(props);
    this.state = {
      debug: false,
      chartWidth: 200,
      rgb: {
        r: 0,
        g: 0,
        b: 0
      },
      hsv: {
        h: 0,
        s: 0,
        v: 0
      },
      hr: 0
    };

    this.bandpassFilter = new IirFilter(
      new CalcCascades().bandpass({
        order: 4,
        characteristic: 'butterworth',
        Fs: HeartRate.FRAMERATE,
        Fc: 80/60,
        BW: 160/60
      })
    );

    this.fft = new Fft(HeartRate.FFT_RADIX);
    this.history = new Array(HeartRate.HISTORY_SAMPLES).fill(0);
  }

  componentDidMount() {
    this.setChartWidth();
    this.signal0 = this.refs.chart.addTimeSeries({}, {
      strokeStyle: 'rgba(0, 0, 0, 1)',
      lineWidth: 2,
      delay: 0.333333
    });
    this.signal1 = this.refs.chart.addTimeSeries({}, {
      strokeStyle: 'rgba(0, 255, 0, 1)',
      lineWidth: 2,
    });
  }

  componentDidUpdate(nextProps) {
  }

  componentWillUnmount() {
  }

  setChartWidth = () => {
    var chartWidth = this.refs.chartParent.clientWidth;
    const cs = getComputedStyle(this.refs.chartParent);
    chartWidth -= parseFloat(cs.paddingLeft);
    chartWidth -= parseFloat(cs.paddingRight);
    chartWidth -= parseFloat(cs.borderLeftWidth);
    chartWidth -= parseFloat(cs.borderRightWidth);
    this.setState({chartWidth: chartWidth});
  }

  onFrame = (canvas) => {
    const now = Date.now();
    const rgb = this.getFrameAverage(canvas);
    const _hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    const hsv = {
      h: _hsv[0]*255,
      s: _hsv[1]*255,
      v: _hsv[2]*255
    };

    this.setState({
      rgb: rgb,
      hsv: hsv
    });

    const measurement = this.bandpassFilter.singleStep(rgb.r);
    this.signal0.append(now, measurement);

    this.history.shift();
    this.history.push(measurement);

    const fftIn = HeartRate.HISTORY_FILLER
                      .concat(this.history)
                      .concat(HeartRate.HISTORY_FILLER);

    const freqMag = this.fft.magnitude(this.fft.forward(fftIn, 'hanning'));

    var maxFreq = 0;
    var maxMag = 0;
    for (var i = 0; i < freqMag.length/2; i++) {
      if (freqMag[i] > maxMag) {
        maxMag = freqMag[i];
        maxFreq = i * HeartRate.FRAMERATE * 60 / HeartRate.FFT_RADIX;
      }
    }

    this.setState({ hr: maxFreq });
  }

  getFrameAverage = (canvas) => {
    const w = canvas.width;
    const h = canvas.height;

    const x0 = 0;
    const x1 = w;
    const y0 = 0;
    const y1 = h;

    var result = {
      r: 0,
      g: 0,
      b: 0
    };

    const frame = canvas.getContext('2d').getImageData(0, 0, w, h);

    var total = 0;
    for (var i = y0; i < y1; i++) {
      for (var j = x0; j < x1; j++) {
        const r = frame.data[(i*w+j)*4+0];
        const g = frame.data[(i*w+j)*4+1];
        const b = frame.data[(i*w+j)*4+2];
        result.r += r;
        result.g += g;
        result.b += b;
        total++;
      }
    }

    result.r /= total;
    result.g /= total;
    result.b /= total;

    return result;
  }

  render() {
    return (
      <div>
        <CanvasCamera
          onNewFrame={this.onFrame}
          frameRate={HeartRate.FRAMERATE}
        />
        <div className='row'>
          <div className='col-xs-12' ref='chartParent'>
            <SmoothieComponent
              ref={'chart'}
              width={this.state.chartWidth}
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
              millisPerPixel={5}
              interpolation={'linear'}
            />
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-12'>
            <span style={{fontSize: 72}}>{Math.round(this.state.hr)}</span>
          </div>
        </div>
        <pre hidden={!this.state.debug}>
          {JSON.stringify(this.state, null, 2)}
        </pre>
      </div>
    );
  }

}

export default HeartRate;
