import uniqid from 'uniqid';
import deepEqual from 'deep-equal';

const utils = {
  newKey: segment => {
    return uniqid.time(segment ? segment.keyId + '/' : '');
  },

  normalizeData: data => {
    let result = {...data};
    if (!result.keyId) {
      result.keyId = utils.newKey();
    }
    if (!result.children) {
      result.children = [];
    }
    if (!result.attr) {
      result.attr = {};
    }
    return result;
  },

  cloneData: data => {
    return {
      keyIdJoin: data.keyId,
      keyId: utils.newKey(data),
      type: data.type,
      attr: data.attr || {},
      value: '',
      size: {
        width: 0,
        height: 0
      },
      children: []
    };
  },

  splitWords: segment => {
    const words = [];
    const length = segment.value.length;
    let word = '';
    for (let i = 0; i < length; i++) {
      const char = segment.value.substring(i, i + 1);
      word += char;
      if (char.match(/[\s()\\-]/)) {
        words.push(word);
        word = '';
      }
    }
    if (word) {
      words.push(word);
    }
    return words.map(word => ({
      keyId: utils.newKey(segment),
      type: segment.type,
      textType: word.length === 1 ? 'char' : 'word',
      attr: Object.assign({}, segment.attr),
      selected: 'none',
      value: word,
      children: [],
      relative: segment.keyId
    }));
  },

  canJoin: (prev, next) => {
    // соединяется только текст
    let result = false;
    if (prev.type === next.type && prev.type === 'text') {
      // одинаковый стиль и отношение к области выделения
      const prevAttrKeys = Object.keys(prev.attr || {});
      const nextAttrKeys = Object.keys(next.attr || {});
      let attrCnt = prevAttrKeys.length;

      result = attrCnt === nextAttrKeys.length;
      //result = result && prev.selected === next.selected;
      //result = result && prev.side === next.side;
      result =
        result &&
        (!prev.children || !prev.children.length) &&
        (!next.children || !next.children.length);
      result = result && deepEqual(prev.attr, next.attr);
      //console.log(next, prev, result);
    }
    return result;
  }
};

export default utils;
