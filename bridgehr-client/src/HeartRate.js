import React, { Component } from 'react';
import { IirFilter, CalcCascades, Fft } from 'fili';
import CanvasCamera from './CanvasCamera';

class HeartRate extends Component {

  static defaultProps = {
    debug: false,
    onBeat: (time) => { },
    onData: (measurement) => { },
    camTorch: false,
    camBack: true
  }

  static FRAMERATE = 30;
  static FFT_RADIX = 4096;
  static HISTORY_SAMPLES = HeartRate.FRAMERATE * 10;
  static HISTORY_FILLER = new Array((HeartRate.FFT_RADIX - HeartRate.HISTORY_SAMPLES)/2).fill(0);

  constructor(props) {
    super(props);
    this.state = {
      rgb: {
        r: 0,
        g: 0,
        b: 0
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

  onFrame = (canvas) => {
    // collect a measurement
    const now = Date.now();
    const frame = this.getFrame(canvas);
    const rgb = this.getFrameAverage(frame);
    const measurement = this.bandpassFilter.singleStep(rgb.r);

    // save it and find the max frequency (heart rate)
    this.history.shift();
    this.history.push(measurement);
    const maxFreq = this.getMaxFreq(this.history);

    // do the callback
    setTimeout(() => {
      this.props.onData({
        time: now,
        value: measurement,
        hr: maxFreq,
        frame: frame
      });
    }, 0);

    // update the state
    this.setState({
      hr: maxFreq,
      rgb: rgb
    });
  }

  getMaxFreq = (history) => {
    const fftIn = HeartRate.HISTORY_FILLER
                      .concat(history)
                      .concat(HeartRate.HISTORY_FILLER);

    const freqMag = this.fft.magnitude(this.fft.forward(fftIn, 'none'));

    var maxFreq = 0;
    var maxMag = 0;
    for (var i = 0; i < freqMag.length/2; i++) {
      if (freqMag[i] > maxMag) {
        maxMag = freqMag[i];
        maxFreq = i * HeartRate.FRAMERATE * 60 / HeartRate.FFT_RADIX;
      }
    }

    return maxFreq;
  }

  getFrame = (canvas) => {
    return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  }

  getFrameAverage = (frame) => {
    const w = frame.width;
    const h = frame.height;

    const x0 = 0;
    const y0 = 0;
    const x1 = w;
    const y1 = h;

    var result = {
      r: 0,
      g: 0,
      b: 0
    };

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
          camTorch={this.props.camTorch}
          camBack={this.props.camBack}
        />
        <pre hidden={!this.props.debug}>
          {JSON.stringify(this.state, null, 2)}
        </pre>
      </div>
    );
  }

}

export default HeartRate;
