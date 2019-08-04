import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Segment from '../segment';
import utils from "@components/rich-editor2/utils";

class SegmentDocument extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func
  };

  static childType = 'page';

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.mainRef = React.createRef();
  }

  static getSize(data) {
    // @todo Использовать параметры страницы (формат) и учитывать ppi
    return {
      width: 794,
      height: 1123,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 30,
      paddingBottom: 20
    };
  }

  static processData({data, limits, place, next}) {
    // Документ отображает страницы
    // По умолчанию в документе всегда есть страница (если есть данные)
    // Но эти страницы могут делиться на несколько старниц из-за автопереносов.
    // Документ определяет лимиты для всего множестав страниц. По умолчанию лимитов нет.
    // По умолчанию страницы выводятся в столбик, но возможны любые другие варианты
    // Позиционирование страниц выполняет разметка документа. Этого слоя ещё нет.
    // Если в документе не хватит места для вывода очередной страницы, то вывод останавливается.
    if (Array.isArray(data.children) && data.children.length) {
      let limitsForChild = {
        x: limits.x,
        y: limits.y,
        width: limits.width,
        height: limits.height
      };
      let children = [];
      for (const child of data.children) {
        Segment.processData({
          data: child,
          limits: {...limitsForChild},
          place: item => {
            // Добавление подчиенного в список для рендера
            children.push(item);
            // Если страницы столбиком
            limitsForChild.y += item.size.height;
            limitsForChild.height -= item.size.height;
            return {...limitsForChild};
          },
          next: () => {
            // Документ не делиться на чати
            // Если нет огрнаичений размеров, то этот метод не будет вызыван вовсе.
            // При вызове отдаём текущий остаток места
            return {...limitsForChild};
          }
        });
      }
      data.children = children;
      place(data);
    }
  }

  renderValue(data) {
    // const size = this.constructor.getSize(data);
    // const innerWidth = size.width - size.paddingLeft - size.paddingRight;
    // const innerHeight = size.height - size.paddingTop - size.paddingBottom;

    if (Array.isArray(data.children) && data.children.length) {
      return data.children.map(item => (
        <Segment key={item.keyId} data={item}/>
      ));
    } else {
      return <React.Fragment>Документ пуст</React.Fragment>;
    }
  }

  render() {
    const data = this.props.data;
    let props = {
      className: 'SegmentDocument',
      ref: this.mainRef,
      style: Object.assign({}, data.attr || {})
    };
    // @todo Как показывать страницы (плиткой, в столбик, галереей)
    return <div {...props}>{this.renderValue(data)}</div>;
  }
}

export default SegmentDocument;
