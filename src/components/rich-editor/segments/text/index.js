import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import utils from '../../utils.js';
import Segment from '../segment';

class SegmentText extends PureComponent {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func,
    setCursorCandidate: PropTypes.func,
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
    this.calculateRect(true);
    //this.props.broadcaster.addEventListener('changeMouseRange', this.onChangeMouseRange);
    //console.log('mount text', this.props.data.keyId);
    //this.checkFocus();
  }

  componentWillUnmount() {
    //this.props.broadcaster.removeEventListener('changeMouseRange', this.onChangeMouseRange);
  }

  componentDidUpdate() {
    //this.checkFocus();
  }

  calculateRect(change = false) {
    let rect;
    if (this.props.data.textType === 'char' /*|| this.props.data.textType === 'word'*/) {
      const bound = this.mainRef.current.getBoundingClientRect() || {};

      rect = {
        left: this.mainRef.current.offsetLeft,
        top: this.mainRef.current.offsetTop,
        width: this.mainRef.current.offsetWidth,
        height: this.mainRef.current.offsetHeight,
      };
      rect.dx = bound.left + window.pageXOffset - this.mainRef.current.offsetLeft;
      console.log(rect.left, bound.left + window.pageXOffset);
    } else {
      const bound = this.mainRef.current.getBoundingClientRect() || {};
      rect = {
        left: bound.left + window.pageXOffset,
        top: bound.top + window.pageYOffset,
        width: bound.width,
        height: bound.height
      };
      rect.dx = bound.left + window.pageXOffset - this.mainRef.current.offsetLeft;
    }

    // if (rect.dx < 1 && rect.dx > -1) {
    //   this.dx = rect.dx/5;
    // } else {
    //   this.dx = 0;
    // }
    //const boundWidth = this.mainRef.current.getBoundingClientRect() || {};
    //const boundTopParent = this.mainRefTop.current.parentNode.getBoundingClientRect() || {};
    //const boundTop = this.mainRefTop.current.getBoundingClientRect() || {};
    //const boundBottom = this.mainRefBottom.current.getBoundingClientRect() || {};
    //console.log(boundWidth.bottom - boundWidth.top, this.mainRef.current.offsetHeight);

    if (change) {
      // this.props.onChange({
      //   ...this.props.data,
      //   rect
      // });
      this.props.onChange({
        ...this.props.data,
        rect
      });
    }
    return rect;
  }

  // split(change = false) {
  //   const data = this.props.data;
  //   let children = data.children;
  //   // Если не детализирован и есть что детализировать
  //   if ((!data.children || !data.children.length) && data.value.length > 1) {
  //     if (data.textType === 'sentence') {
  //       children = utils.splitWords(data);
  //     } else if (data.textType === 'word') {
  //       children = utils.splitChars(data);
  //     } else if (data.textType !== 'char') {
  //       children = utils.splitSentence(data);
  //     }
  //     // if (children.length === 1) {
  //     //   children = data.children;
  //     // }
  //   }
  //   if (change && children !== data.children) {
  //     this.props.onChange({
  //       ...this.props.data,
  //       children
  //     });
  //   }
  //   return children;
  // }
  //
  // onChangeMouseRange = mouseRange => {
  //   //console.log('onChangeMouseRange:text', this.props.data.keyId, mouseRange);
  //   const data = this.props.data;
  //   const rect = this.calculateRect(false);
  //   let selected;
  //   let selectionKindX = 'none';
  //   let selectionKindY = 'none';
  //   let x0, x1, y0, y1;
  //   let patch = {
  //     keyId: data.keyId,
  //     rect,
  //     side: 'none'
  //   };
  //   y0 = Math.min(mouseRange.startY, mouseRange.endY);
  //   y1 = Math.max(mouseRange.startY, mouseRange.endY);
  //   // Полное вхождение по вертикали
  //   if (y0 <= rect.top && y1 >= rect.top + rect.height) {
  //     selectionKindY = 'full';
  //   } else if (y0 < rect.top + rect.height && y1 > rect.top) {
  //     selectionKindY = 'part';
  //   }
  //   if (selectionKindY === 'part') {
  //     if (data.textType === 'char' || data.textType === 'word') {
  //       // Проверка по горизонтали для текста без автопереноса
  //       const width2 = rect.width / 2;
  //       // Однострочноое выделение
  //       if (y0 >= rect.top && y1 <= rect.top + rect.height) {
  //         const x0 = Math.min(mouseRange.startX, mouseRange.endX);
  //         const x1 = Math.max(mouseRange.startX, mouseRange.endX);
  //         // Малейшее пересечение с обоастью
  //         if (x0 <= rect.left + rect.width && x1 >= rect.left) {
  //           // Если символ, то полное выделение возможно при попадании более половины ширины
  //           if (data.textType === 'char') {
  //             if (x0 <= rect.left && x1 >= rect.left + width2) {
  //               selectionKindX = 'full';
  //             } else if (x0 <= rect.left + width2 && x1 >= rect.left + rect.width) {
  //               selectionKindX = 'full';
  //             } else {
  //               selectionKindX = 'part';
  //               // К какому краю ближе?
  //               const dx = {
  //                 left: Math.abs(mouseRange.endX - rect.left),
  //                 right: Math.abs(mouseRange.endX - (rect.left + rect.width))
  //               };
  //               if (dx.left < dx.right) {
  //                 patch.side = 'left';
  //               } else {
  //                 patch.side = 'right';
  //               }
  //               this.props.setCursorCandidate(data, patch.side, Math.min(dx.left, dx.right));
  //             }
  //           } else {
  //             if (x0 <= rect.left && x1 >= rect.left + rect.width) {
  //               selectionKindX = 'full';
  //             } else {
  //               selectionKindX = 'part';
  //             }
  //           }
  //         }
  //       } else
  //       // Многострочное выделение
  //       if (y1 >= rect.top && y0 <= rect.top + rect.height) {
  //         if (mouseRange.startY < mouseRange.endY) {
  //           x0 = mouseRange.startX;
  //           x1 = mouseRange.endX;
  //         } else {
  //           x0 = mouseRange.endX;
  //           x1 = mouseRange.startX;
  //         }
  //         if (y0 >= rect.top && y0 < rect.top + rect.height) {
  //           // Первая строка выделения
  //           if (x0 <= rect.left + rect.width) {
  //             if (x0 <= rect.left) {
  //               selectionKindX = 'full';
  //             } else {
  //               selectionKindX = 'part';
  //             }
  //           }
  //         } else if (y1 >= rect.top && y1 < rect.top + rect.height) {
  //           // Последняя строка выделения
  //           if (x1 > rect.left) {
  //             if (x1 >= rect.left + rect.width) {
  //               selectionKindX = 'full';
  //             } else {
  //               selectionKindX = 'part';
  //             }
  //           }
  //         } else {
  //           // Середина выделения - всегда входит
  //           selectionKindX = 'full';
  //         }
  //       }
  //     } else {
  //       // для текста с автопереносом ещё не факт, что попадает в область
  //       // но нужно его датализировать и передать проверку подчиненным.
  //       selectionKindX = 'part'; // частичное, но не факт 'maybe';
  //     }
  //   }
  //
  //   let children = data.children;
  //   if (selectionKindY === 'part') {
  //     if (selectionKindX === 'part') {
  //       // Детализировать children, если их нету
  //       // Обновить данные узла без установки selected
  //       // Вызывать onChangeMouseRange, если есть подчиненые или были созданы
  //       if (!data.children || !data.children.length) {
  //         children = this.split();
  //         if (children !== data.children) {
  //           patch.children = children;
  //         }
  //       }
  //     }
  //     patch.selected = selectionKindX;
  //   } else {
  //     // полное выделение или его снятие
  //     patch.selected = selectionKindY;
  //   }
  //
  //   if (patch.selected !== data.selected || children !== data.children || patch.side !== data.side) {
  //     this.props.onChange(patch);
  //   }
  //   if (children && patch.selected === 'part') {
  //     this.broadcaster.dispatchEvent('changeMouseRange', mouseRange);
  //   }
  // };

  onChangeSelected = (selected) => {
    if (selected === 'full') {
      this.mainRef.current.style.background = 'rgb(148, 37, 255)';
      this.mainRef.current.style.color = '#fff';
    } else {
      this.mainRef.current.style.background = 'transparent';
      this.mainRef.current.style.color = '#000';
    }
    if (this.dx) {
      console.log(this.dx);
      this.mainRef.current.style.marginLeft = `${this.dx}px`;
    }
  };

  calculateDist = ({x, y}) => {
    const rect = this.calculateRect();
    const dxCenter = x - (rect.left + rect.width / 2);
    const dyCenter = y - (rect.top + rect.height / 2);
    return {
      dx: Math.min(Math.abs(rect.left - x), Math.abs(x - (rect.left + rect.width))),
      dy: Math.min(Math.abs(y - rect.top), Math.abs(y - (rect.top + rect.height))),
      sideX: dxCenter < 0 ? 'left' : 'right',
      sideY: dyCenter < 0 ? 'top' : 'bottom',
    };
  };

  renderValue(data) {
    if (Array.isArray(data.children) && data.children.length) {
      return data.children.map(keyId => (
        <Segment key={keyId} keyId={keyId} broadcaster={this.broadcaster}/>
      ));
    } else {
      return <React.Fragment>{data.value}</React.Fragment>;
    }
  }

  render() {
    const data = this.props.data;
    //console.log('render text', data.key);
    let props = {
      className: 'SegmentText',
      ref: this.mainRef,
      style: Object.assign({}, data.attr || {})
    };
    props.style.outlineOffset = -1;
    props.style.outline = '1px solid rgba(255,0,0,0.4)';
    if (data.textType === 'sentence') {
      props.style.outlineColor = 'rgba(255,0,56,0.57)';
      props.style.outlineOffset = -2;
    }else
    if (data.textType === 'word'){
      props.style.outlineColor = 'rgba(216,154,0,0.64)';
      props.style.outlineOffset = -3;
    } else
    if (data.textType === 'char'){
      props.style.outlineColor = 'rgba(0,183,13,0.74)';
      props.style.outlineOffset = -4;
    } else {
      props.style.outlineColor = 'rgba(0,70,255,0.66)';
    }

    if (!props.style.color) {
      props.style.color = '#000';
    }
    // if (data.selected) {
    //   props.style.backgroundColor = 'transparent';
    //   props.style.color = '#fff';
    // }
    if (data.textType === 'word' || data.textType === 'char') {
      //props.style.whiteSpace = 'nowrap';

    }
    if (data.textType === 'char') {
      props.className += ' SegmentText-char';
    }
    // if (data.side === 'left'){
    //   props.style.borderLeft = `1px solid ${'#ff00d4'}`;
    // } else
    // if (data.side === 'right'){
    //   props.style.borderRight = `1px solid ${'#8e00ff'}`;
    // }

    if (data.selected === 'full' && (!data.children || data.children.length < 1)) {
      //console.log('render selection for', data.key, data.rect);
      props.style.backgroundColor = 'rgb(148, 37, 255)';
      props.style.color = '#fff';
    }

    if (data.selected === 'part' /*&& (!data.children || data.children.length < 1)*/) {
      //console.log('render selection for', data.key, data.rect);
      props.style.backgroundColor = 'rgb(255,0,139)';
      props.style.color = '#fff';
    }

    if (this.dx){
      console.log('dx', this.dx);
      props.style.marginLeft = `${this.dx}px`;
    }

    return (
      <span {...props} data-type={data.textType}>
        {/*{data.selected &&*/}
        {/*(data.selectionKind === 'full' || !data.children || !data.children.length)*/}
        {/*  ? (*/}
        {/*    <span*/}
        {/*      className="SegmentText__select"*/}
        {/*      style={{*/}
        {/*        top: `${data.rect.top}px`,*/}
        {/*        height: `${data.rect.height}px`,*/}
        {/*        left: `${data.rect.left}px`,*/}
        {/*        width: `${data.rect.width}px`*/}
        {/*      }}*/}
        {/*    />*/}
        {/*  )*/}
        {/*  : null}*/}
        {/*<span ref={this.mainRefTop} className="SegmentText__after"/>*/}
        {this.renderValue(data)}

        {/*<span ref={this.mainRefBottom} className="SegmentText__before"/>*/}
      </span>
    );
  }
}

export default SegmentText;

