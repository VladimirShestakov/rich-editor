import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Segment from '../segment';
import utils from '../../utils';

class SegmentP extends PureComponent {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func,
    broadcaster: PropTypes.instanceOf(utils.Broadcaster)
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.mainRef = React.createRef();
    this.broadcaster = new utils.Broadcaster();
    this.childrenRef = {};
  }

  componentDidMount() {
    this.props.broadcaster.addEventListener('changeMouseRange', this.onChangeMouseRange);
    //console.log('mount p', this.props.data.keyId);
    //this.checkFocus();
  }

  componentWillUnmount() {
    this.props.broadcaster.removeEventListener('changeMouseRange', this.onChangeMouseRange);
  }

  componentDidUpdate() {
    //this.checkFocus();
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

  onChangeSelected = selected => {
    if (selected === 'full') {
      this.mainRef.current.style.background = 'rgba(204,143,0,0.25)';
    } else {
      this.mainRef.current.style.background = 'transparent';
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
      let children = [];
      for (const keyId of data.children) {
        if (!this.childrenRef[keyId]) {
          this.childrenRef[keyId] = React.createRef();
        }
        console.log(Segment.getSize(keyId));
        children.push(
          React.createElement(Segment, {
            ref: this.childrenRef[keyId],
            key: keyId,
            keyId: keyId,
            broadcaster: this.broadcaster,
          })
          //
          // <Segment
          //   ref={this.childrenRef[keyId]}
          //   key={keyId}
          //   keyId={keyId}
          //   broadcaster={this.broadcaster}
          // />
        );
      }

      return children;
    } else {
      return <React.Fragment>{data.value}</React.Fragment>;
    }
  }

  render() {
    const data = this.props.data;
    //console.log('render p', data.keyId);
    let props = {
      className: 'SegmentP',
      ref: this.mainRef,
      style: Object.assign({}, data.attr || {})
    };
    if (data.selected === 'full') {
      props.style.backgroundColor = 'rgba(204,143,0,0.25)';
    }
    //props.style.outline = `1px solid ${color}`;
    return <p {...props}>{this.renderValue(data)}</p>;
  }
}

export default SegmentP;
