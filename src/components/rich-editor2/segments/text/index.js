import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Segment from '../segment';
import {measure} from "@utils";
import utils from './../../utils';

class SegmentText extends PureComponent {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func,
  };

  static defaultProps = {
    onChange: () => {
    }
  };

  static childType = 'text';

  static normalizeData(data) {
    return {...data};
  }

  constructor(props) {
    super(props);
    this.mainRef = React.createRef();
  }

  static getSize(data) {
    return measure.textSize(data.value, data.attr || {});
  }

  static processData({data, limits, place, next}) {
    if (!data.children || !data.children.length) {
      const style = data.attr ? data.attr : {};
      data.size = measure.textSize(data.value, style);
      if (data.size.width > limits.width) {
        const children = utils.splitWords(data);
        if (children.length > 1) {
          data.children = children;
        } else {
          //console.log(data.keyId, data.size.width, '>', limits.width);
          // Размещаем себя в новоей области (автоперенос)
          next();
          // Если не вмещается, то всеравно выводим?? Теоретически не надо, но бывают за рамки выходящие объекта. Наверно они должны уметь свой размер обрезать, а не выводиться за пределы границы.
          // @todo Возможно надо определить data.size с учётом limit, чтобы при рендере выполнять overflow:hidden
          limits = place(data);
        }
      } else {
        //console.log(data.keyId, data.size.width, '<', limits.width);
        // Размещаем в текущей области
        limits = place(data);
      }
    }
    // Если есть (появились) дети, то..
    if (data.children && data.children.length) {
      let limitsForChild = {
        x: 0, // Начало внутри абзаца
        y: 0,
        width: limits.width, // Максимальный размер цельного абзаца (оставшееся месо на странице)
        height: limits.height
      };
      // Из-за автопереносов объект будет расчленяться на составные части (отдельные иерархии, но с общим ключем)
      let virtualData = utils.cloneData(data);
      virtualData.first = true;
      let prevChild = null;
      for (const child of data.children) {
        Segment.processData({
          data: child,
          limits: {...limitsForChild},
          place: item => {
            if (prevChild && utils.canJoin(prevChild, item)) {
              prevChild.value += item.value;
              prevChild.size.width += item.size.width;
              prevChild.size.height = Math.max(prevChild.size.height, item.size.height);
            } else {
              virtualData.children.push(item);
              prevChild = item;
            }
            virtualData.size.width += item.size.width;
            virtualData.size.height = Math.max(virtualData.size.height, item.size.height);
            // Уменьшаем свободное место
            limitsForChild.width -= item.size.width;
            limitsForChild.x += item.size.width;
            return {...limitsForChild};
          },
          next: () => {
            if (virtualData.children.length) {
              place(virtualData);
            }
            prevChild = null;
            limits = next();
            virtualData = utils.cloneData(data);
            limitsForChild = {
              x: 0,
              y: 0,
              width: limits.width,
              height: limits.height
            };
            return {...limitsForChild};
          }
        });
      }
      if (virtualData.children.length) {
        if (virtualData.first) {
          data.children = virtualData.children;
          data.size = virtualData.size;
          place(data);
        } else {
          place(virtualData);
        }
      }
    }
  }

  renderValue(data) {
    if (Array.isArray(data.children) && data.children.length) {
      return data.children.map(item => (
        <Segment key={item.keyId} data={item}/>
      ));
    } else {
      return <React.Fragment>{data.value.replace(/\s/g, ' ')}</React.Fragment>;
    }
  }

  render() {
    const data = this.props.data;
    let props = {
      className: 'SegmentText',
      ref: this.mainRef,
      style: Object.assign({}, data.attr || {}, {
        width: `${data.size.width}px`,
        height: `${data.size.height}px`
      })
    };
    props.style.outlineOffset = -1;
    props.style.outline = '1px solid rgba(255,0,0,0.4)';
    if (data.textType === 'sentence') {
      props.style.outlineColor = 'rgba(255,0,56,0.57)';
      props.style.outlineOffset = -2;
    } else if (data.textType === 'word') {
      props.style.outlineColor = 'rgba(216,154,0,0.64)';
      props.style.outlineOffset = -3;
    } else if (data.textType === 'char') {
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
      props.style.backgroundColor = 'rgb(148, 37, 255)';
      props.style.color = '#fff';
    }

    if (data.selected === 'part' /*&& (!data.children || data.children.length < 1)*/) {
      props.style.backgroundColor = 'rgb(255,0,139)';
      props.style.color = '#fff';
    }

    if (this.dx) {
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

