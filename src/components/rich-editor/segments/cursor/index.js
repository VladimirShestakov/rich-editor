import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import utils from '../../utils';

class SegmentCursor extends PureComponent {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func,
    broadcaster: PropTypes.instanceOf(utils.Broadcaster)
  };

  static defaultProps = {
    onChange: () => {
    }
  };

  constructor(props) {
    super(props);
    this.mainRef = React.createRef();
    // this.mainRefTop = React.createRef();
    // this.mainRefBottom = React.createRef();
    this.broadcaster = new utils.Broadcaster();
  }

  componentDidMount() {
    //this.checkFocus();
    this.calculateRect(true);
    this.props.broadcaster.addEventListener('changeMouseRange', this.onChangeMouseRange);
    //console.log('mount img', this.props.data.keyId);
  }

  componentWillUnmount() {
    this.props.broadcaster.removeEventListener('changeMouseRange', this.onChangeMouseRange);
  }

  componentDidUpdate() {
    //this.checkFocus();
  }

  calculateRect(change = false) {
    // const boundWidth = this.mainRef.current.getBoundingClientRect() || {};
    // const boundTop = this.mainRefTop.current.getBoundingClientRect() || {};
    // const boundBottom = this.mainRefBottom.current.getBoundingClientRect() || {};

    // const rect = {
    //   left: boundWidth.left,
    //   top: boundWidth.top,
    //   width: this.mainRef.current.offsetWidth,
    //   height: boundWidth.bottom - boundWidth.top
    // };
    const rect = {
      left: this.mainRef.current.offsetLeft,
      top: this.mainRef.current.offsetTop,//boundWidth.top,
      width: this.mainRef.current.offsetWidth,
      height: this.mainRef.current.offsetHeight
    };
    if (change) {
      this.props.onChange({
        ...this.props.data,
        rect
      });
    }
    return rect;
  }

  onChangeMouseRange = mouseRange => {

  };

  render() {
    const data = this.props.data;
    let props = {
      className: 'SegmentCursor',
      ref: this.mainRef,
      style: {},
    };
    if (!data.active) {
      props.style.display = 'none';
    }
    return (
      <span {...props} data-type={data.textType}><i className="SegmentCursor__after">|</i></span>
    );
  }
}

export default SegmentCursor;
