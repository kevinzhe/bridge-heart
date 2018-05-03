import React, { Component } from 'react';
import { Button, Container, Grid, Icon, Loader, Statistic, Transition } from 'semantic-ui-react';
import io from 'socket.io-client';
import HeartRate from './HeartRate';
import StreamingChart from './StreamingChart';
import './HRClient.css';

class HRClient extends Component {

  static SERVER = 'https://api.bridge.kevinzheng.com:43414/';

  constructor(props) {
    super(props);
    this.chart = React.createRef();
    this.state = {
      active: true,
      connected: false,
      beatCount: 0,
      measurement: {
        time: 0,
        hr: 0,
        value: 0,
        frame: null,
        rgb: {
          r: 0,
          g: 0,
          b: 0
        }
      },
      camera: {
        torch: false,
        back: true
      }
    };
  }

  componentDidMount() {
    document.title = 'My <3 is in the bridge';
    this.signal0 = this.chart.current.addTimeSeries({
      strokeStyle: 'rgba(0, 0, 0, 1)',
      lineWidth: 2,
    });
    if (this.state.active) {
      this.setUpSocket();
    }
  }

  componentWillUnmount() {
    if (this.socket) {
      this.tearDownSocket();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.active && !this.state.active) {
      this.tearDownSocket();
    } else if (!prevState.active && this.state.active) {
      this.setUpSocket();
    }
  }

  setUpSocket = () => {
    this.socket = io(HRClient.SERVER);
    this.socket.on('connect', () => { this.setState({connected: true}); });
    this.socket.on('disconnect', () => { this.setState({connected: false}); });
    this.socket.on('colors', (br) => { console.log(br); });
    this.socket.on('beat', (br) => { console.log(br); });
  }

  tearDownSocket = () => {
    this.socket.disconnect();
    delete this.socket;
  }

  onBeat = (time) => {
    if (this.state.connected) {
      this.socket.emit('beat', time);
    }
    this.setState({ beatCount: this.state.beatCount + 1 });
  }
  
  onData = (measurement) => {
    this.signal0.append(measurement.time, measurement.value);
    this.setState({ measurement: measurement });
  }

  getCurRGB = () => {
    const r = Math.min(255, Math.round(this.state.measurement.rgb.r));
    const g = Math.min(255, Math.round(this.state.measurement.rgb.g));
    const b = Math.min(255, Math.round(this.state.measurement.rgb.b));
    return 'rgb('+r+','+g+','+b+')';
  }

  render() {
    return (
      <div>
        <Container>
          <Grid centered columns={1}>
            <Grid.Row>
              <Grid.Column>
                <StreamingChart ref={this.chart} active={this.state.active} />
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column textAlign='center'>
                <Statistic>
                  <Statistic.Value>
                    {Math.round(this.state.measurement.hr)}
                  </Statistic.Value>
                  <Statistic.Label>
                    BPM
                  </Statistic.Label>
                </Statistic>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column textAlign='center'>
                <Transition animation='pulse' duration={250} visible={this.state.beatCount % 2 === 0}>
                  <Icon.Group size='massive'>
                    <Icon name='heart' style={{color: this.getCurRGB()}} />
                  </Icon.Group>
                </Transition>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column textAlign='center'>
                <Button
                  onClick={() => this.setState({camera: {torch: !this.state.camera.torch}})}
                  basic
                  circular
                  toggle
                  active={this.state.camera.torch}
                  icon
                  size={'massive'}
                  disabled={!this.state.active}
                >
                  <Icon name='lightbulb' />
                </Button>

                <Button
                  onClick={() => this.setState({active: !this.state.active})}
                  basic
                  circular
                  toggle
                  active={this.state.active}
                  icon
                  size={'massive'}
                >
                  <Icon name={this.state.active ? 'pause' : 'play'} />
                </Button>
              </Grid.Column>
            </Grid.Row>

            <Transition visible={this.state.active && !this.state.connected} animation='scale' duration={500}>
              <Grid.Row>
                <Grid.Column textAlign='center'>
                  <Loader active={true} inline>
                    Connecting
                  </Loader>
                </Grid.Column>
              </Grid.Row>
            </Transition>

          </Grid>
        </Container>

        { this.state.active &&
        <HeartRate
          onBeat={this.onBeat}
          onData={this.onData}
          camTorch={this.state.camera.torch}
          camBack={this.state.camera.back}
        /> }
      </div>
    );
  }

}

export default HRClient;
