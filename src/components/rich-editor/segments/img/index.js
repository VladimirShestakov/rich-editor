import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import utils from '../../utils';

class SegmentImg extends PureComponent {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func,
    broadcaster: PropTypes.instanceOf(utils.Broadcaster)
  };

  static defaultProps = {
    onChange: () => {}
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
    const rect = this.calculateRect(false);
    let selected;
    let selectionKindX = 'none';
    let selectionKindY = 'none';
    let x0, x1, y0, y1;
    y0 = Math.min(mouseRange.startY, mouseRange.endY);
    y1 = Math.max(mouseRange.startY, mouseRange.endY);
    // Полное вхождение по вертикали
    if (y0 <= rect.top && y1 >= rect.top + rect.height) {
      selectionKindY = 'full';
    } else if (y0 < rect.top + rect.height && y1 > rect.top) {
      selectionKindY = 'part';
    }
    if (selectionKindY === 'part') {
      // Проверка по горизонтали
      // Однострочноое выделение
      if (y0 >= rect.top && y1 <= rect.top + rect.height) {
        const x0 = Math.min(mouseRange.startX, mouseRange.endX);
        const x1 = Math.max(mouseRange.startX, mouseRange.endX);
        if (x0 <= rect.left + rect.width && x1 >= rect.left) {
          selectionKindX = 'full';
        }
      }
      // Многострочное выделение
      else if (y1 >= rect.top && y0 <= rect.top + rect.height) {
        if (mouseRange.startY < mouseRange.endY) {
          x0 = mouseRange.startX;
          x1 = mouseRange.endX;
        } else {
          x0 = mouseRange.endX;
          x1 = mouseRange.startX;
        }
        if (y0 >= rect.top && y0 < rect.top + rect.height) {
          // Первая строка выделения
          if (x0 <= rect.left + rect.width) {
            selectionKindX = 'full';
          }
        } else if (y1 >= rect.top && y1 < rect.top + rect.height) {
          // Последняя строка выделения
          if (x1 > rect.left) {
            selectionKindX = 'full';
          }
        } else {
          // Середина выделения - всегда входит
          selectionKindX = 'full';
        }
      }
    }
    if (selectionKindY === 'part') {
      selected = selectionKindX;
    } else {
      // полное выделение или его снятие
      selected = selectionKindY;
    }

    if (selected !== data.selected) {
      this.props.onChange({
        keyId: data.keyId,
        rect,
        selected
      });
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

  onChangeSelected = (selected) => {
    if (selected === 'full') {
      this.mainRef.current.style.backgroundColor = 'rgb(148, 37, 255)';
      this.mainRef.current.style.outline = `1px solid ${'rgb(148, 37, 255)'}`;
      this.mainRef.current.style.outlineOffset = -1;
    } else {
      this.mainRef.current.style.backgroundColor = 'transparent';
      this.mainRef.current.style.outline = `none`;
    }
  };

  render() {
    const data = this.props.data;
    //console.log('render img', data.keyId);
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
        {/*{data.selected ? (*/}
        {/*  <span*/}
        {/*    className="SegmentText__select"*/}
        {/*    style={{*/}
        {/*      top: `${data.rect.top}px`,*/}
        {/*      height: `${data.rect.height}px`,*/}
        {/*      left: `${data.rect.left}px`,*/}
        {/*      width: `${data.rect.width}px`*/}
        {/*    }}*/}
        {/*  />*/}
        {/*) : null}*/}
        <img {...props} src={data.attr.src} width={30} />
        {/*<span ref={this.mainRefTop} className="SegmentImg__after" />*/}
        {/*<span ref={this.mainRefBottom} className="SegmentImg__before" />*/}
      </React.Fragment>
    );
  }
}

export default SegmentImg;
