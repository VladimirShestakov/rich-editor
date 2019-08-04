import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';

class SegmentImg extends PureComponent {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func
  };

  static defaultProps = {
    onChange: () => {}
  };

  constructor(props) {
    super(props);
    this.mainRef = React.createRef();
  }

  render() {
    const data = this.props.data;
    let props = {
      className: 'SegmentImg',
      ref: this.mainRef,
      style: Object.assign({}, data.attr || {}),
      draggable: false
    };
    if (data.selected === 'full') {
      props.style.backgroundColor = 'rgb(148, 37, 255)';
      props.style.outline = `1px solid ${'rgb(148, 37, 255)'}`;
      props.style.opacity = 0.5;
    }
    return (
      <React.Fragment>
        <img {...props} src={data.attr.src} width={30} />
      </React.Fragment>
    );
  }
}

export default SegmentImg;
