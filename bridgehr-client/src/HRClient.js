import React, { Component } from 'react';
import HeartRate from './HeartRate';
import './HRClient.css';

class HRClient extends Component {

  componentDidMount() {
    document.title = 'My <3 is on the bridge';
  }

  onBeat = (time) => {
    console.log(time);
  }

  render() {
    return (
      <div className='container'>
        <HeartRate
          onBeat={this.onBeat}
        />
      </div>
    );
  }

}

export default HRClient;
