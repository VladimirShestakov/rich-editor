import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Segment from '../segment';
import utils from '../../utils.js';

class SegmentPage extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
    broadcaster: PropTypes.instanceOf(utils.Broadcaster)
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.mainRef = React.createRef();
    this.broadcaster = new utils.Broadcaster();
  }

  componentDidUpdate() {
    //this.checkFocus();
  }

  componentDidMount() {
    this.props.broadcaster.addEventListener('changeMouseRange', this.onChangeMouseRange);
    // console.log('mount page', this.props.data.key);
    //this.checkFocus();
  }

  componentWillUnmount() {
    this.props.broadcaster.removeEventListener('changeMouseRange', this.onChangeMouseRange);
  }

  calculateRect(change = false) {
    const rect = {
      left: this.mainRef.current.offsetLeft,
      top: this.mainRef.current.offsetTop,
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
    const data = this.props.data;
    const rect = this.calculateRect();
    let selected = 'none';
    let y0, y1;
    y0 = Math.min(mouseRange.startY, mouseRange.endY);
    y1 = Math.max(mouseRange.startY, mouseRange.endY);
    if (y0 <= rect.top && y1 >= rect.top + rect.height) {
      selected = 'full';
    } else if (y0 < rect.top + rect.height && y1 > rect.top) {
      selected = 'part';
    }
    if (selected !== data.selected) {
      this.props.onChange({
        keyId: data.keyId,
        rect,
        selected
      });
    }
    if (data.children && selected === 'part') {
      this.broadcaster.dispatchEvent('changeMouseRange', mouseRange);
    }
  };

  calculateDist = ({x, y}) => {
    const rect = this.calculateRect();
    const dxCenter = x - (rect.left + rect.width / 2);
    const dyCenter = y - (rect.top + rect.height / 2);
    return {
      dx: Math.min(Math.abs(x - rect.left), Math.abs(x - (rect.left + rect.width))),
      dy: Math.min(Math.abs(y - rect.top), Math.abs(y - (rect.top + rect.height))),
      sideX: dxCenter < 0 ? 'left' : 'right',
      sideY: dyCenter < 0 ? 'top' : 'bottom'
    };
  };

  renderValue(data) {
    if (Array.isArray(data.children) && data.children.length) {
      return data.children.map(keyId => (
        <Segment key={keyId} keyId={keyId} broadcaster={this.broadcaster} />
      ));
    } else {
      return <React.Fragment>{data.value}</React.Fragment>;
    }
  }

  render() {
    const data = this.props.data;
    let props = {
      className: 'SegmentPage',
      ref: this.mainRef,
      style: Object.assign({}, data.attr || {})
    };
    if (data.selected === 'full') {
      props.style.backgroundColor = 'rgba(175,204,0,0.1)';
    }
    return <div {...props}>{this.renderValue(data)}</div>;
  }
}

export default SegmentPage;
