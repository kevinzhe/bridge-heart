import React, { Component } from 'react';

class ImageCanvas extends Component {

  static defaultProps = {
    frame: null
  };

  constructor(props) {
    super(props);
    this.canvas = React.createRef();
  }

  UNSAFE_componentWillUpdate(nextProps) {
    this
      .canvas
      .current
      .getContext('2d')
      .putImageData(nextProps.frame, 0, 0);
  }

  render() {
    return (
      <canvas
        ref={this.canvas}
      />
    );
  }

}

export default ImageCanvas;
