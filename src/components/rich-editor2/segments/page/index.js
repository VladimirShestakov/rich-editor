import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Segment from '../segment';
import utils from '@components/rich-editor2/utils';

class SegmentPage extends PureComponent {
  static propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func
  };

  static defaultProps = {};

  static childType = 'line';

  constructor(props) {
    super(props);
    this.mainRef = React.createRef();
  }

  static processData({data, limits, place, next}) {
    // Размер страницы надо брать из настроек документа
    // Также учитывать поля, отсупы в странице для сверки по лимитам родителя
    const defaultPageSize = {
      width: 794,
      height: 85 //1123
    };
    // Так как у страниц фиксированный размер, то сразу проверяем вместимость
    if (limits.width < defaultPageSize.width || limits.height < defaultPageSize.height) {
      // Странице не хватает места
      limits = next();
    }
    // Если место выделено, то готовим страницу
    if (limits.width >= defaultPageSize.width && limits.height >= defaultPageSize.height) {
      let limitsForChild = {
        x: 0,
        y: 0,
        width: defaultPageSize.width,
        height: defaultPageSize.height
      };
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
            // Если страницы столбиком
            limitsForChild.y += item.size.height;
            limitsForChild.height -= item.size.height;
            return {...limitsForChild};
          },
          next: () => {
            // Часть содержимого оставляем в текущей странице, отправляем в документ
            if (virtualData.children.length) {
              place(virtualData);
            }
            virtualData = utils.cloneData(data);
            // Запрос новой области для страницы
            limits = next();
            if (limits.width < defaultPageSize.width || limits.height < defaultPageSize.height) {
              // Места нет для страницы, можно остановить наполнение
              limitsForChild = {
                x: 0,
                y: 0,
                width: 0,
                height: 0
              };
            } else {
              limitsForChild = {
                x: 0,
                y: 0,
                width: defaultPageSize.width,
                height: defaultPageSize.height
              };
            }
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

  static getSize(data) {
    // @todo Использовать параметры страницы (формат) и учитывать ppi
    return {
      width: 794,
      height: 85,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 0,
      paddingBottom: 0
    };
  }

  renderValue(data) {
    const size = this.constructor.getSize(data);
    const innerWidth = size.width - size.paddingLeft - size.paddingRight;
    const innerHeight = size.height - size.paddingTop - size.paddingBottom;

    if (Array.isArray(data.children) && data.children.length) {
      return data.children.map(item => (
        <Segment key={item.keyId} data={item} outerWidth={innerWidth} outerHeight={innerHeight} />
      ));
    } else {
      return <React.Fragment>{data.value}</React.Fragment>;
    }
  }

  render() {
    const data = this.props.data;
    const size = this.constructor.getSize(data);
    let props = {
      className: 'SegmentPage',
      ref: this.mainRef,
      style: Object.assign({}, size, data.attr || {})
    };
    if (data.selected === 'full') {
      props.style.backgroundColor = 'rgba(175,204,0,0.1)';
    }
    return (
      <div {...props}>
        <div
          className="SegmentPage__used"
          style={{
            height: `${data.size.height}px`,
            width: `${data.size.width}px`,
            left: `${size.paddingLeft}px`,
            top: `${size.paddingTop}px`
          }}
        />
        <div className="SegmentPage__content">{this.renderValue(data)}</div>
      </div>
    );
  }
}

export default SegmentPage;
