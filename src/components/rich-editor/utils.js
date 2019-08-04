import uniqid from 'uniqid';
import deepEqual from 'deep-equal';

const SEPARATE_SENTENCE = '';
const SEPARATE_WORDS = /\s/;


const NOT_IN_WORD = '';
const NOT_IN_SENTENCE = '!?:,;.\'"`/\\';

const utils = {
  intersects: (a, b) => {
    return (
      (((a.x0 >= b.x0 && a.x0 <= b.x1) || (a.x1 >= b.x0 && a.x1 <= b.x1)) &&
        ((a.y0 >= b.y0 && a.y0 <= b.y1) || (a.y1 >= b.y0 && a.y1 <= b.y1))) ||
      (((b.x0 >= a.x0 && b.x0 <= a.x1) || (b.x1 >= a.x0 && b.x1 <= a.x1)) &&
        ((b.y0 >= a.y0 && b.y0 <= a.y1) || (b.y1 >= a.y0 && b.y1 <= a.y1))) ||
      ((((a.x0 >= b.x0 && a.x0 <= b.x1) || (a.x1 >= b.x0 && a.x1 <= b.x1)) &&
        ((b.y0 >= a.y0 && b.y0 <= a.y1) || (b.y1 >= a.y0 && b.y1 <= a.y1))) ||
        (((b.x0 >= a.x0 && b.x0 <= a.x1) || (b.x1 >= a.x0 && b.x1 <= a.x1)) &&
          ((a.y0 >= b.y0 && a.y0 <= b.y1) || (a.y1 >= b.y0 && a.y1 <= b.y1))))
    );
  },

  newKey: segment => {
    return uniqid.time(segment ? segment.keyId + '/' : '');
  },

  splitSentence: segment => {
    const sentences = [];
    const length = segment.value.length;
    let sentence = '';
    for (let i = 0; i < length; i++) {
      const char = segment.value.substring(i, i + 1);
      sentence += char;
      if (char.match(/[!?:,;.\/`\\]/)) {
        sentences.push(sentence);
        sentence = '';
      }
    }
    if (sentence) {
      sentences.push(sentence);
    }
    return sentences.map(sentence => ({
      keyId: utils.newKey(segment),
      type: segment.type,
      textType: sentence.length === 1 ? 'char' : 'sentence',
      attr: Object.assign({}, segment.attr),
      selected: 'none',
      value: sentence,
      children: [],
      relative: segment.keyId
    }));
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

  splitChars: segment => {
    return segment.value.split('').map(word => ({
      keyId: utils.newKey(segment),
      type: segment.type,
      textType: 'char',
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
      result = result && prev.selected === next.selected && prev.selected !== 'part';
      result = result && prev.side === next.side;
      result =
        result &&
        (!prev.children || !prev.children.length) &&
        (!next.children || !next.children.length);
      result = result && deepEqual(prev.attr, next.attr);
      //console.log(next, prev, result);
    }
    return result;
  },

  canClearParent: (parentKey, nodesStore, ifEmpty = false) => {
    if (nodesStore[parentKey]) {
      if (!nodesStore[parentKey].children || !nodesStore[parentKey].children.length) {
        return ifEmpty;
      } else {
        if (nodesStore[parentKey].children.length === 1) {
          const result = utils.canClearParent(nodesStore[parentKey].children[0], nodesStore, true);
          if (
            result &&
            nodesStore[parentKey].type === 'text' &&
            nodesStore[nodesStore[parentKey].children[0]].type === 'text'
          ) {
            return true;
          }
        }
      }
    }
    return false;
  },

  joinChildren: segment => {
    if (segment.children) {
      if (segment.children.length > 1) {
        let newIndex = 0;
        let newChildren = [];
        const end = segment.children.length;
        for (let i = 0; i < end; i++) {
          if (i !== 0 && utils.canJoin(newChildren[newIndex], segment.children[i])) {
            const newChild = {
              ...newChildren[newIndex],
              value: newChildren[newIndex].value + segment.children[i].value
            };
            utils.detectTextType(newChild);
            newChildren.splice(newIndex, 1, newChild);
          } else {
            // if (segment.type === 'cursor' && segment.active === false) {
            //   // удаление неактивного курсора
            // } else {
            newChildren.push(segment.children[i]);
            newIndex = newChildren.length - 1;
            // }
          }
        }
        if (newChildren.length !== segment.children.length) {
          return newChildren;
        }
      }
    }
    return segment.children;
  },

  detectTextType: node => {
    if (node.type === 'text') {
      node.textType = 'string';
      if (node.value.length > 0) {
        if (node.value.length === 1) {
          node.textType = 'char';
        } else {
          if (!node.value.match(/[\s()\\-]/)) {
            node.textType = 'word';
          } else {
            const clear = node.value.replace(/[!?:,;.\/`\\]+$/, '');
            if (!node.value.match(/[\s()\\-]/)) {
              node.textType = 'sentence';
            }
          }
        }
      }
    }
    return node.textType;
  },

  indexData: data => {
    const index = {};
    const roots = [];
    const iterate = (list, relative, addToChildren = true) => {
      const result = [];
      if (list) {
        for (const item of list) {
          if (!item.keyId) {
            item.keyId = utils.newKey({keyId: relative});
          }
          result.push(item.keyId);

          const children = iterate(item.children, item.keyId, false);

          if (index[item.keyId]) {
            index[item.keyId] = {
              ...index[item.keyId],
              ...item,
              children: children.concat(index[item.keyId].children)
            };
          } else {
            index[item.keyId] = {...item, children};
          }

          if (relative) {
            index[item.keyId].relative = relative;
          }
          utils.detectTextType(index[item.keyId]);

          if (addToChildren) {
            if (item.relative) {
              if (!index[item.relative]) {
                index[item.relative] = {
                  keyId: item.relative,
                  children: []
                };
              }
              index[item.relative].children.push(item.keyId);
            } else {
              roots.push(index[item.keyId]);
            }
          }
        }
      }
      return result;
    };

    iterate(data);
    index['root'] = roots[0] || {};
    utils.pathTree(index['root'], index);
    return index;
  },

  pathTree: (node, nodesStore = {}) => {
    if (node) {
      if (/*!node.relative || !node.relative._id || */ !node._path) {
        node._path = [1];
      }
      if (node.children) {
        let order = 0;
        for (const childKeyId of node.children) {
          order++;
          nodesStore[childKeyId]._path = node._path.concat([order]);
          utils.pathTree(nodesStore[childKeyId], nodesStore);
        }
      }
    }
    return node;
  },

  pathTreeCompare: (path1, path2) => {
    //console.log(path1, path2);
    if (typeof path1 === 'undefined' || typeof path2 === 'undefined') {
      return 'out';
    }
    const cnt = Math.max(path1.length, path2.length);
    for (let i = 0; i < cnt; i++) {
      if (typeof path2[i] === 'undefined') {
        return 'child';
      }
      if (typeof path1[i] === 'undefined') {
        return 'parent';
      }
      if (path1[i] > path2[i]) {
        return 'right';
      }
      if (path1[i] < path2[i]) {
        return 'left';
      }
    }
    return 'self';
  },

  Broadcaster: class {
    constructor() {
      this.listeners = {};
    }

    addEventListener(name, listener) {
      if (!this.listeners[name]) {
        this.listeners[name] = [];
      }
      if (this.listeners[name].indexOf(listener) === -1) {
        this.listeners[name].push(listener);
      }
    }

    hasEventListener(name, listener) {
      return !this.listeners[name] && this.listeners[name].indexOf(listener) !== -1;
    }

    removeEventListener(name, listener) {
      if (this.listeners[name]) {
        const index = this.listeners[name].indexOf(listener);
        if (index !== -1) {
          this.listeners[name].splice(index, 1);
        }
      }
    }

    dispatchEvent(name, params) {
      const result = [];
      if (this.listeners[name]) {
        for (const listener of this.listeners[name]) {
          result.push(listener(params));
        }
      }
      return result;
    }
  }
};

export default utils;
