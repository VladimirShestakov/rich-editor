import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import * as segments from '../index';
import Segment from '@components/rich-editor2/segments/segment';
import utils from '@components/rich-editor2/utils';

class Line extends PureComponent {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func
  };

  static childType = 'text';

  static defaultProps = {};

  constructor(props) {
    super(props);
    // Выборка данных из контекста, которые ренедрить
    this.mainRef = React.createRef();
    this.childtype = 'text';
    this.childAllow = ['inline'];
  }

  static processData({data, limits, place, next}) {
    // Размер абзаца динамический, нужно по мере его наполнения сверять вместимость в родителя
    // Для подчиенных ограничения определяет родитель
    let limitsForChild = {
      x: 0, // Начало внутри абзаца
      y: 0,
      width: limits.width, // Максимальный размер цельного абзаца (оставшееся месо на странице)
      height: Infinity //limits.height
    };
    // Наполняемый абзац. Если окажется один, то перестанет быть вирутальным.
    let virtualData = utils.cloneData(data);
    virtualData.first = true;
    for (const child of data.children) {
      Segment.processData({
        data: child,
        limits: {...limitsForChild},
        place: item => {
          // Добавление подчиненного в список для рендера
          virtualData.children.push(item);
          virtualData.size.width += item.size.width;
          virtualData.size.height = Math.max(virtualData.size.height, item.size.height);
          // Внутри строки, заполняют область по вертикали
          limitsForChild.x += item.size.width;
          limitsForChild.width -= item.size.width;
          return {...limitsForChild};
        },
        next: () => {
          // Часть содержимого оставляем в текущей строке, отправляем в абзац
          if (virtualData.children.length) {
            if (limits.height < virtualData.size.height) {
              // Строка не влезает
              next();
            }
            limits = place(virtualData);
          }
          // Запрос новой области, так как в текущую подчиенные уже не вмещаются.
          virtualData = utils.cloneData(data);
          limitsForChild = {
            x: 0,
            y: 0,
            width: limits.width,
            height: Infinity //limits.height
          };
          return {...limitsForChild};
        }
      });
    }
    if (virtualData.children.length) {
      if (limits.height < virtualData.size.height) {
        // Строка не влезает
        limits = next();
      }
      if (virtualData.first) {
        data.children = virtualData.children;
        data.size = virtualData.size;
        place(data);
      } else {
        place(virtualData);
      }
    }
  }

  static getSize(data) {
    const Component = data.type && segments[data.type];
    if (Component && Component.getSize) {
      return Component.getSize(data);
    } else {
      return null;
    }
  }

  renderValue(data) {
    let result = [];
    if (Array.isArray(data.children) && data.children.length) {
      for (const item of data.children) {
        result.push(<Segment key={item.keyId} data={item} />);
      }
      return result;
    } else {
      return <React.Fragment>{data.value}</React.Fragment>;
    }
  }

  render() {
    const data = this.props.data;
    let props = {
      className: 'Line',
      ref: this.mainRef,
      style: Object.assign({height: `${data.size.height}px`}, data.attr || {})
    };
    return <span {...props}>{this.renderValue(data)}</span>;
  }
}

export default Line;
