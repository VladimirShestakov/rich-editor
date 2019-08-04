import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import * as actions from '@store/actions';
import Accordion from '@components/elements/accordion';
import Button from '@components/elements/button';
import LayoutPage from '@components/layouts/layout-page';
import LayoutContent from '@components/layouts/layout-content';
import HeaderContainer from '@containers/header-container';
import RichEditor from '@components/rich-editor';
import RichEditor2 from '@components/rich-editor2';
import {measure} from '@utils';

class Home extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    history: PropTypes.object.isRequired,
    richEditor: PropTypes.object
  };

  showInfo = () => {
    this.props.dispatch(actions.modal.open('info')).then(result => {
      console.log(result);
    });
  };

  componentDidMount() {
    this.props.dispatch(actions.richEditor.load());
  }

  onChangeRichEditor = data => {
    this.props.dispatch(actions.richEditor.change(data));
  };

  render() {
    return (
      <LayoutPage header={<HeaderContainer />}>
        <RichEditor2 data={this.props.richEditor.data} onChange={this.onChangeRichEditor} />
      </LayoutPage>
    );
  }
}

export default connect(store => ({
  richEditor: store.richEditor
}))(Home);
