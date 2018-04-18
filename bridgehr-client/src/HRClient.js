import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import HeartRate from './HeartRate';
import StreamingChart from './StreamingChart';
import ImageCanvas from './ImageCanvas';
import './HRClient.css';

class HRClient extends Component {

  constructor(props) {
    super(props);
    this.chart = React.createRef();
    this.state = {
      beatCount: 0,
      measurement: {
        time: 0,
        hr: 0,
        value: 0,
        frame: null
      },
      camera: {
        torch: false,
        back: true
      }
    };
  }

  componentWillMount() {
    document.title = 'My <3 is on the bridge';
  }

  componentDidMount() {
    this.signal0 = this.chart.current.addTimeSeries({
      strokeStyle: 'rgba(0, 0, 0, 1)',
      lineWidth: 2,
    });
  }

  onBeat = (time) => {
    this.setState({ beatCount: this.state.beatCount + 1 });
  }
  
  onData = (measurement) => {
    this.signal0.append(measurement.time, measurement.value);
    this.setState({ measurement: measurement });
  }

  render() {
    return (
      <div className='container'>

        <div className='row'>
          <div className='col-md-6'>
            <Button
              onClick={() => this.setState({camera: {torch: !this.state.camera.torch}})}
              block
              bsSize='large'
              disabled={false}>
              Flash
            </Button>
          </div>
          <div className='col-md-6'>
            <Button
              onClick={() => this.setState({camera: {back: !this.state.camera.back}})}
              block
              bsSize='large'
              disabled={false}>
              Flip
            </Button>
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-12'>
            <StreamingChart ref={this.chart} />
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-12'>
            <ImageCanvas
              ref={'canvas'}
              frame={this.state.measurement.frame}
            />
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-6'>
            <span style={{fontSize: 72}}>{Math.round(this.state.measurement.hr)}</span>
          </div>
          <div className='col-xs-6'>
            <span style={{fontSize: 72}}>{Math.round(this.state.beatCount)}</span>
          </div>
        </div>

        <HeartRate
          onBeat={this.onBeat}
          onData={this.onData}
          camTorch={this.state.camera.torch}
          camBack={this.state.camera.back}
        />

      </div>
    );
  }

}

export default HRClient;
