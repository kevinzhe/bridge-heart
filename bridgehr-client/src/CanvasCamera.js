import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import WebRTCWebcam from './WebRTCWebcam';

class CanvasCamera extends Component {

  static defaultProps = {
    onNewFrame: (canvas) => { },
    frameRate: 30
  };

  static FRAME_WIDTH = 100;
  static FRAME_HEIGHT = 100;

  constructor(props) {
    super(props);
    this.state = {
      cameraSide: 'environment',
      torchAvailable: false,
      torch: false,
      debug: false
    };
  }

  componentDidMount() {
    this.startService()
  }

  componentDidUpdate(nextProps) {
  }

  componentWillUnmount() {
    this.stopService();
  }

  startService = () => {
    if (typeof this.timerID !== 'undefined') {
      throw new Error('Service already started');
    }
    this.timerID = setInterval(this.processFrame, 1000/this.props.frameRate);
  }

  stopService = () => {
    if (typeof this.timerID === 'undefined') {
      throw new Error('Service not started');
    }
    clearInterval(this.timerID);
    delete this.timerID;
  }

  processFrame = () => {
    const ctx = this.canvas.getContext('2d');
    this.cam.drawOnCanvas(ctx, 0, 0, this.canvas.width, this.canvas.height);
    setTimeout(this.props.onNewFrame(this.canvas));
  }

  flipCamera = () => {
    const newSide = this.state.cameraSide === 'user' ? 'environment' : 'user';
    this.setState({
      cameraSide: newSide
    });
  }

  toggleTorch = () => {
    this.setState({ torch: !this.state.torch });
  }

  onCapabilities = (capabilities) => {
    var torchAvailable = false;
    if (typeof capabilities.torch === 'boolean') {
      torchAvailable = capabilities.torch;
    }
    this.setState({torchAvailable: torchAvailable});
  }

  render() {
    const debugInfo = {
      state: this.state
    };

    return (
      <div>
        <div className='row'>
          <div className='col-xs-12 col-md-6'>
            <Button onClick={this.flipCamera} block bsSize='large'>Flip</Button>
          </div>
          <div className='col-xs-12 col-md-6'>
            <Button onClick={this.toggleTorch} block bsSize='large' disabled={!this.state.torchAvailable}>Flash</Button>
          </div>
        </div>

        <div className='row'>
          <div className='col-xs-12'>
            <canvas
              ref={(canvas) => this.canvas = canvas}
              width={CanvasCamera.FRAME_WIDTH}
              height={CanvasCamera.FRAME_HEIGHT}
              style={{width: '100%', height: '50px'}}
            />
          </div>
        </div>

        <div className='row' hidden={!this.state.debug}>
          <div className='col-xs-12'>
            <pre>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        </div>

        <WebRTCWebcam
          video={true}
          audio={false}
          videoSource={this.state.cameraSide}
          torch={this.state.torch}
          onCapabilities={this.onCapabilities}
          style={{display: 'none'}}
          ref={(cam) => this.cam = cam}
        />
      </div>
    );
  }

}

export default CanvasCamera;
