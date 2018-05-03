import React, { Component } from 'react';
import { Grid } from 'semantic-ui-react';
import { toRGBString } from './util';

class BridgeSim extends Component {

  static defaultProps = {
    bridge: [ ]
  };

  render() {
    const tiles = this.props.bridge.map((client, i) => (
      <Tile color={client.color} present={client.present} key={i} />
    ));
    if (this.props.bridge.length > 0) {
      return (
        <Grid divided>
          <Grid.Row columns={this.props.bridge.length}>
            {tiles}
          </Grid.Row>
        </Grid>
      );
    } else {
      return (
        <Grid.Row columns={1}>
          <Tile />
        </Grid.Row>
      );
    }
  }

}

class Tile extends Component {
  
  static defaultProps = {
    present: false,
    marked: false,
    color: {
      r: 0,
      g: 0,
      b: 0
    },
  };

  render() {
    return (
      <Grid.Column
        verticalAlign='middle'
        textAlign='center'
        style={{
          backgroundColor: this.props.present ? toRGBString(this.props.color, true) : 'rgb(230,230,230)',
          paddingTop: '25px',
          paddingBottom: '25px'
        }}
      >
        {this.props.marked ? <h1 style={{color:'white'}}>★</h1> : ''}
      </Grid.Column>
    );
  }

}

export default BridgeSim;
