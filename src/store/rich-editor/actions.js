import data from './data2.js';

const detectTextType = (node)=>{
  if (node.type === 'text') {
    node.textType = 'string';
    if (node.value.length > 0) {
      if (node.value.length === 1) {
        node.textType = 'char';
      } else {
        if (!node.value.match(/[\s!@#$%^&*()_=+<>,.\/?`\\-]/)) {
          node.textType = 'word';
        }
      }
    }
  }
  if (node.children) {
    for (const item of node.children) {
      detectTextType(item);
    }
  }
  return node.textType;
};

const convertToTree = (items) => {
  const roots = [];
  const index = {};
  const sorted = items.sort((a, b) => (a.order > b.order ? 1 : (a.order < b.order ? -1 : 0)));
  for (const item of sorted) {
    if (item.children) {
      for (const existItem of item.children) {
        existItem.relative = {key: item.key};
      }
    }
    if (index[item.key]) {
      index[item.key] = {...item, children: (item.children || []).concat(index[item.key].children)};
    } else {
      index[item.key] = {...item, children: item.children || []};
    }

    detectTextType(index[item.key]);

    if (item.relative && item.relative.key) {
      if (!index[item.relative.key]) {
        index[item.relative.key] = {children: []};
      }
      index[item.relative.key].children.push(index[item.key]);
    } else {
      roots.push(index[item.key]);
    }
  }
  return roots[0] || {};
};

export const types = {
  LOAD: Symbol('LOAD'),
  CHANGE: Symbol('UPDATE'),

  SUBMIT: Symbol('SUBMIT'),
  SUBMIT_SUCCESS: Symbol('SUBMIT_SUCCESS'),
  SUBMIT_FAILURE: Symbol('SUBMIT_FAILURE')
};

export default {

  load: () => {
    return dispatch => {
      dispatch({
        type: types.LOAD,
        payload: /*convertToTree(*/data.items || []/*)*/
      });
    };
  },

  change: data => {
    return dispatch => {
      dispatch({
        type: types.CHANGE,
        payload: data
      });
    };
  },
};


