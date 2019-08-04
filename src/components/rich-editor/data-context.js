import React from 'react';

export const DataContext = React.createContext({a: 0});

export const withData = (Component, data) => {
  class ComponentWithData extends React.Component {
    static contextType = DataContext;

    constructor(props) {
      super(props);
    }

    componentDidMount() {
      console.log('context', this.context);
    }

    componentWillUnmount() {
    }

    componentDidUpdate() {
      console.log('context', this.context);
    }

    render() {
      return <Component {...this.props} />;
    }
  }

  return ComponentWithData;
};
