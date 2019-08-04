import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import {DataContext} from '../../data-context';
import * as segments from '../index';

class Segment extends PureComponent {
  static propTypes = {
    keyId: PropTypes.string
  };

  static contextType = DataContext;

  static defaultProps = {};

  constructor(props, context) {
    super(props);
    // Выборка данных из контекста, которые ренедрить
    this.state = {
      data: context.get(props.keyId)
    };
    this.mainRef = React.createRef();
  }

  componentDidMount() {
    // Изменения данных в общем хранилище
    this.context.broadcaster.addEventListener(
      `onChangeItem-${this.state.data.keyId}`,
      this.onChangeItem
    );
    this.context.broadcaster.addEventListener(
      `onChangeItemSelected-${this.state.data.keyId}`,
      this.onChangeItemSelected
    );
    this.context.broadcaster.addEventListener(
      `onCalculateItemRect-${this.state.data.keyId}`,
      this.onCalculateItemRect
    );
  }

  componentWillUnmount() {
    this.context.broadcaster.removeEventListener(
      `onChangeItem-${this.state.data.keyId}`,
      this.onChangeItem
    );
    this.context.broadcaster.removeEventListener(
      `onChangeItemSelected-${this.state.data.keyId}`,
      this.onChangeItemSelected
    );
    this.context.broadcaster.removeEventListener(
      `onCalculateItemRect-${this.state.data.keyId}`,
      this.onCalculateItemRect
    );
  }

  // componentDidUpdate() {
  //   console.log('context', this.context);
  // }

  onChangeItem = data => {
    this.setState({data});
  };

  onChangeItemSelected = selected => {
    if (this.mainRef.current.onChangeSelected) {
      this.mainRef.current.onChangeSelected(selected);
    }
  };

  onCalculateItemRect = () => {
    if (this.mainRef.current.calculateRect) {
      return this.mainRef.current.calculateRect();
    } else {
      return false;
    }
  };

  changeItem = data => {
    this.context.patch(data);
  };

  setCursorCandidate = (...cursorInfo) => {
    console.log(cursorInfo);
    this.context.setCursorCandidate(...cursorInfo);
  };

  static getSize(keyId) {
    const Component = data.type && segments[data.type];
    if (Component && Component.getSize) {
      return Component.getSize(data);
    } else {
      return {width: 0, height: 0};
    }
  }

  render() {
    const Component = this.state.data.type && segments[this.state.data.type];
    if (Component) {
      return (
        <Component
          {...this.props}
          data={this.state.data}
          onChange={this.changeItem}
          setCursorCandidate={this.setCursorCandidate}
          ref={this.mainRef}
        />
      );
    } else {
      return null;
    }
  }
}

export default Segment;
