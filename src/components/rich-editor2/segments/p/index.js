import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Segment from '../segment';
import utils from '../../utils';

class SegmentP extends PureComponent {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func
  };

  static defaultProps = {};

  static childType = 'line';

  constructor(props) {
    super(props);
    this.mainRef = React.createRef();
  }

  static processData({data, limits, place, next}) {
    // Размер абзаца динамический, нужно по мере его наполнения сверять вместимость в родителя
    // Для подчиенных ограничения определяет родитель
    let limitsForChild = {
      x: 0, // Начало внутри абзаца
      y: 0,
      width: limits.width, // Максимальный размер цельного абзаца (оставшееся месо на странице)
      height: limits.height
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
          virtualData.size.width = Math.max(virtualData.size.width, item.size.width);
          virtualData.size.height += item.size.height;
          // Внутри строки, заполняют область по вертикали
          limitsForChild.y += item.size.height;
          limitsForChild.height -= item.size.height;
          return {...limitsForChild};
        },
        next: () => {
          // Часть содержимого оставляем в текущем абзаце, отправляем в страницу
          if (virtualData.children.length) {
            place(virtualData);
          }
          // Запрос новой области, так как в текущую подчиенные уже не вмещаются.
          // Абзац дополнительное место запрашивает у страницы, возможно произойдет перенос на новую страницу.
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
      className: 'SegmentP',
      ref: this.mainRef,
      style: Object.assign({height: `${data.size.height}px`}, data.attr || {})
    };
    if (data.selected === 'full') {
      props.style.backgroundColor = 'rgba(204,143,0,0.25)';
    }
    //props.style.outline = `1px solid ${color}`;
    return <p {...props}>{this.renderValue(data)}</p>;
  }
}

export default SegmentP;
