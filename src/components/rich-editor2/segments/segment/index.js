import React, {PureComponent} from 'react';
import './style.less';
import * as segments from '../index';
import utils from "@components/rich-editor2/utils";

class Segment extends PureComponent {
  static propTypes = {};
  static defaultProps = {};
  static childType = 'p';

  constructor(props) {
    super(props);
    // Выборка данных из контекста, которые ренедрить
    this.mainRef = React.createRef();
  }

  static normalizeData(data) {
    const Component = data.type && segments[data.type];
    if (Component) {
      if (Component.normalizeData) {
        return Component.normalizeData(data);
      } else {
        let children = [];
        let result = utils.normalizeData(data);
        let virtualChild = {
          keyId: utils.newKey(data),
          type: Component.childType,
          virtual: true,
          children: [],
          value: result.value
        };
        for (let child of result.children) {
          child = Segment.normalizeData(child);
          if (child.type !== Component.childType) {
            virtualChild.children.push(child);
          } else {
            if (virtualChild.children.length){
              children.push(virtualChild);
              virtualChild = {
                keyId: utils.newKey(data),
                type: Component.childType,
                virtual: true,
                children: [],
                value: result.value
              };
            }
            children.push(child);
          }
        }
        if (virtualChild.children.length) {
          children.push(virtualChild);
        }
        result.children = children;
        return result;
      }
    }
    return {...data};
  }

  static processData({data, limits, place, next}) {
    const Component = data.type && segments[data.type];
    if (Component && Component.processData) {
      return Component.processData({data, limits, place, next});
    } else {
      return data;
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

  render() {
    const Component = this.props.data.type && segments[this.props.data.type];
    if (Component) {
      return <Component {...this.props} ref={this.mainRef}/>;
    } else {
      return null;
    }
  }
}

export default Segment;
