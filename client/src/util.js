module.exports = {
  toRGBString: (rgb) => {
    const r = Math.min(255, Math.round(rgb.r));
    const g = Math.min(255, Math.round(rgb.g));
    const b = Math.min(255, Math.round(rgb.b));
    return 'rgb('+r+','+g+','+b+')';
  }
};
