import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Segment from '@components/rich-editor2/segments/segment';

class RichEditor2 extends Component {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func
  };

  static defaultProps = {};

  static getDerivedStateFromProps(props, state) {
    if (props.data !== state.data && props.data && props.data.length) {
      let data = Segment.normalizeData(props.data[0]);
      Segment.processData({
        data,
        limits: {x: 0, y: 0, width: Infinity, height: Infinity},
        place: item => {
          data = item;
        },
        next: () => {
          console.log('Why next doc??');
        }
      });
      console.log(data);
      return {data};
    }
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidUpdate(prevProps) {
    //console.log(this.state);
  }

  processData(data) {
    const size = {
      width: Infinity, // По умолчанию без переноса текста?
      height: Infinity // По умочланию без ограничения по высоте
    };
    //Segment.constructor.processData(data, size);
  }

  renderValue() {
    if (this.state.data) {
      return <Segment data={this.state.data} />;
    } else {
    return 'Loading';
    }
  }

  render() {
    return <div className="RichEditor2">{this.renderValue()}</div>;
  }
}

export default RichEditor2;
