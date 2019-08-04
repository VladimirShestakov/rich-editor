import React, {Component} from 'react';
import PropTypes from 'prop-types';
import './style.less';
import Segment from '@components/rich-editor/segments/segment';
import utils from './utils.js';
import {DataContext} from './data-context';

class RichEditor extends Component {
  static propTypes = {
    data: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]),
    onChange: PropTypes.func
  };

  static defaultProps = {};

  constructor(props) {
    super(props);
    this.state = {
      isFocus: false,
      data: {
        // Узлы содержимого по идентфикатору
      }
    };
    this.mouseRange = {startX: 0, startY: 0, endX: 0, endY: 0, state: 'end'};
    this.data = utils.indexData(props.data) || {};
    console.log(this.data);
    this.mainRef = React.createRef();
    this.broadcaster = new utils.Broadcaster();
    this.cursor = null;
    this.cursorCandidate = null;
    this.selectionRange = {
      count: 0,
      form: null,
      to: null
    };
    this.control = {
      add: list => {
        if (list) {
          if (!Array.isArray(list)) {
            list = [list];
          }
          for (const item of list) {
            this.data[item.keyId] = item;
          }
        }
      },
      delete: keyId => {
        if (this.data[keyId]) {
          if (this.data[keyId].children) {
            for (const childKeyId of this.data[keyId].children) {
              this.control.delete(childKeyId);
            }
          }
          delete this.data[keyId];
        }
      },

      patch: ({keyId, ...fields}) => {
        if (keyId && this.data[keyId]) {
          let triggerOnChangeItem = false;
          let data = this.data;
          if ('children' in fields) {
            if (fields.children !== data[keyId].children) {
              // Добавлени новых подчиенных в индекс
              // for (const child of fields.children) {
              //   data[child.keyId] = child;
              //   if (!data[child.keyId].relative) {
              //     data[child.keyId].relative = {keyId};
              //   }
              //   if (!data[child.keyId].children) {
              //     data[child.keyId].children = [];
              //   }
              // }
              data[keyId].children = fields.children;
            }
            utils.pathTree(data[keyId], data);
            //delete fields.children;
          } else {
            //Попытка слить подчиенные?
            // const children = utils.joinChildren(data[keyId]);
            // if (children !== data[keyId].children) {
            //   triggerOnChangeItem = true;
            //   if (data[keyId].type === 'text' && children.length === 1) {
            //     data[keyId].value = children[0].value;
            //     data[keyId].children = [];
            //   } else {
            //     data[keyId].children = children;
            //     for (const child of children) {
            //       data[child.keyId] = child;
            //       this.control.broadcaster.dispatchEvent(`onChangeItem-${child.keyId}`, data[child.keyId]);
            //     }
            //   }
            // }
          }
          if ('selected' in fields) {
            if (fields.selected === 'full') {
              if (data[keyId].type !== 'cursor') {
                this.selectionRange.count++;
              }
            }
            if (
              fields.selected !== data[keyId].selected &&
              (fields.selected === 'full' || fields.selected === 'none')
            ) {
              // Установка или сброс выделения для подчиненных
              if (data[keyId].children) {
                for (const childKeyId of data[keyId].children) {
                  this.control.patch({
                    keyId: childKeyId,
                    selected: fields.selected
                  });
                }
              }
              // Если не частичное выделение и нет подчиенных, то сообщать об изменениях
              //if (!data[keyId].children || !data[keyId].children.length) {
              //triggerOnChangeItem = true;
              //}
            }
            data[keyId].selected = fields.selected;
            delete fields.selected;

            //Попытка слить подчиенные?
            // if (!('children' in fields)) {
            //   const children = utils.joinChildren(data[keyId]);
            //   console.log(data[keyId].children, children);
            // if (children !== data[keyId].children) {
            //   triggerOnChangeItem = true;
            //   if (data[keyId].type === 'text' && children.length === 1) {
            //     data[keyId].value = children[0].value;
            //     data[keyId].children = [];
            //   } else {
            //     data[keyId].children = children;
            //     for (const child of children) {
            //       data[child.keyId] = child;
            //       this.control.broadcaster.dispatchEvent(`onChangeItem-${child.keyId}`, data[child.keyId]);
            //     }
            //   }
            // }
            // }
            this.control.broadcaster.dispatchEvent(
              `onChangeItemSelected-${keyId}`,
              data[keyId].selected
            );
          }

          // Если есть другие свойства
          if (triggerOnChangeItem || Object.keys(fields).length > 0) {
            data[keyId] = Object.assign({}, data[keyId], fields);
            this.control.broadcaster.dispatchEvent(`onChangeItem-${keyId}`, data[keyId]);
          }
        } else {
          console.error('The keyId of changed data is undefined', keyId);
        }
      },
      change: item => {
        //this.clearBrowserSelection();
        if (item.keyId) {
          this.control.patch(item);
        }
      },
      get: keyId => {
        return this.data[keyId] || {};
      },
      setCursor: (segment, side = 'right') => {
        if (segment) {
          if (
            !this.cursorCandidate ||
            this.cursorCandidate.keyId !== segment.keyId ||
            this.cursorCandidate.side !== side
          ) {
            this.cursorCandidate = {
              segment,
              side
            };
            this.control.activateCursor();
          }
        } else {
          this.cursorCandidate = null;
          this.control.activateCursor();
        }
      },
      setCursorCandidate: (segment, side = 'right', dx = 0) => {
        if (segment) {
          //console.log(segment, side, dx);
          if (!this.cursorCandidate || this.cursorCandidate.dx >= dx) {
            this.cursorCandidate = {
              segment,
              side,
              dx
            };
          }
        } else {
          this.cursorCandidate = null;
        }
      },
      activateCursor: () => {
        // Деактивация старого курсора
        if (this.cursor) {
          this.data[this.cursor.keyId] = {
            ...this.data[this.cursor.keyId],
            active: false,
            type: 'cursor',
            keyId: this.cursor.keyId
          };
          console.log(this.cursor);
          this.control.broadcaster.dispatchEvent(
            `onChangeItem-${this.cursor.keyId}`,
            this.data[this.cursor.keyId]
          );
        }
        // Если есть сегмент, рядом с которым ставить курсор
        if (this.cursorCandidate) {
          if (
            this.cursorCandidate.segment.relative &&
            this.data[this.cursorCandidate.segment.relative]
          ) {
            const relativeKeyId = this.cursorCandidate.segment.relative;
            // Новый курсор
            this.cursor = {
              keyId: utils.newKey(this.data[relativeKeyId]),
              type: 'cursor',
              attr: Object.assign({}, this.cursorCandidate.segment.attr),
              value: '',
              active: true,
              relative: relativeKeyId
            };
            const children = this.data[relativeKeyId].children;
            let index = children.findIndex(item => item === this.cursorCandidate.segment.keyId);
            if (this.cursorCandidate.side === 'right') {
              index += 1;
            }
            children.splice(index, 0, this.cursor.keyId);
            this.data[relativeKeyId] = {
              ...this.data[relativeKeyId],
              children
            };
            this.data[this.cursor.keyId] = this.cursor;
            this.control.broadcaster.dispatchEvent(
              `onChangeItem-${relativeKeyId}`,
              this.data[relativeKeyId]
            );
          }
        }
      },
      broadcaster: new utils.Broadcaster()
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (props.data !== state.data) {
      return {data: utils.indexData(props.data)};
    }
    return null;
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.onMouseDown, false);
    document.addEventListener('mouseup', this.onMouseUp, false);
    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('ondragstart', this.onDragStart, true);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onMouseDown, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);
    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('ondragstart', this.onDragStart, true);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.data = utils.indexData(this.props.data);
      console.log('new props', this.data);
      const keyIds = Object.keys(this.data);
      for (const keyId of keyIds) {
        this.control.broadcaster.dispatchEvent(`onChangeItem-${keyId}`, this.data[keyId]);
      }
      this.forceUpdate();
    }
  }

  clearBrowserSelection() {
    if (window.getSelection) {
      if (window.getSelection().empty) {
        // Chrome
        window.getSelection().empty();
      } else if (window.getSelection().removeAllRanges) {
        // Firefox
        window.getSelection().removeAllRanges();
      }
    } else if (document.selection) {
      // IE?
      document.selection.empty();
    }
  }

  handleClick = event => {
    if (this.mainRef && !this.mainRef.current.contains(event.target)) {
      this.onBlur();
    } else {
      this.onFocus();
    }
  };

  onFocus = e => {
    if (!this.state.isFocus) {
      this.setState({
        isFocus: true
      });
    }
  };

  onBlur = () => {
    if (this.state.isFocus) {
      this.setState({
        isFocus: false
      });
    }
  };

  dispatchEventThrottle = /*throttle(*/ (name, params) => {
    this.broadcaster.dispatchEvent(name, params);
  } /*, 20)*/;

  findSegment = (parentSegment, point, defaultResult = null) => {
    // Нужно найти ближайший неделимый сегмент
    let result = null;
    let candidates = [];
    let candidatesAdditional = [];
    // Поиск кандидатов среди подчиненных
    // Получить dx/dy кандидата и сравнить с одобренными кандидатами
    // Строки с автопреносом если координат в них, то рассматриваются как дополнительные кандидаты,
    // так как их dx нельзя сравнивать с сегментами без автопереноса.
    // У кандидатов если нет ещё детей, то пытаемся детализировать
    // Если кандидат не делимый, то методом сравнения присваивать в result
    // Поиск новых кандидатов серди детей найденных кандидатов.
    const eq = (a, b, precision = 0.9999) => {
      return Math.abs(b - a) <= precision;
    };
    const gt = (a, b, precision = 0.9999) => {
      return !eq(a, b, precision) && a > b;
    };
    const find = children => {
      for (const segmentKeyId of children) {
        const segment = this.data[segmentKeyId];
        if (segment.type !== 'cursor') {
          const rects = this.control.broadcaster.dispatchEvent(
            `onCalculateItemRect-${segment.keyId}`,
            point
          );
          if (rects && rects.length && typeof rects[0] === 'object') {
            const rect = rects[0];
            const dxCenter = point.x - (rect.left + rect.width / 2);
            const dyCenter = point.y - (rect.top + rect.height / 2);
            const dtop = rect.top - point.y;
            const dbottom = point.y - (rect.top + rect.height);
            const dleft = rect.left - point.x;
            const dright = point.x - (rect.left + rect.width);
            const dist = {
              dx: dleft > 0 ? dleft : dright > 0 ? dright : 0,
              dy: dtop > 0 ? dtop : dbottom > 0 ? dbottom : 0,
              sideX: dxCenter < 0 ? 'left' : 'right',
              sideY: dyCenter < 0 ? 'top' : 'bottom'
            };
            if (!candidates.length || gt(candidates[0].dist.dy, dist.dy)) {
              candidates = [{segment, dist}];
            } else if (eq(candidates[0].dist.dy, dist.dy)) {
              if (
                segment.type === 'text' &&
                segment.textType !== 'char' &&
                segment.textType !== 'word'
              ) {
                candidatesAdditional.push({segment, dist});
              } else if (gt(candidates[0].dist.dx, dist.dx)) {
                candidates = [{segment, dist}];
              } else if (eq(candidates[0].dist.dx, dist.dx)) {
                candidates.push({segment, dist});
              }
            }
          }
        }
      }
      candidates = candidates.concat(candidatesAdditional);
      let newChildren = [];
      for (const child of candidates) {
        this.splitSegment(child.segment.keyId, true);
        const splitSegment = this.data[child.segment.keyId];
        if (!splitSegment.children || !splitSegment.children.length) {
          // Листовой - кандидат на результат
          if (
            !result ||
            gt(result.dist.dy, child.dist.dy) ||
            (eq(result.dist.dy, child.dist.dy) && gt(result.dist.dx, child.dist.dx))
          ) {
            result = child;
          }
        } else {
          newChildren = newChildren.concat(splitSegment.children);
        }
      }
      if (newChildren.length) {
        candidates = [];
        candidatesAdditional = [];
        find(newChildren);
      }
    };

    if (parentSegment.children && parentSegment.children.length) {
      find(parentSegment.children);
    }

    return result;
  };

  splitSegment = keyId => {
    const data = this.data[keyId];
    let list;
    // Если не детализирован и есть что детализировать
    if ((!data.children || !data.children.length) && data.value.length > 1) {
      if (data.type === 'text') {
        if (data.textType === 'sentence') {
          list = utils.splitWords(data);
        } else if (data.textType === 'word') {
          list = utils.splitChars(data);
        } else if (data.textType !== 'char') {
          list = utils.splitSentence(data);
        }
      }
    }
    if (list) {
      this.control.add(list);
      this.control.patch({
        keyId,
        children: list.map(item => item.keyId)
      });
    }
    return list;
  };

  joinSegments = keyId => {
    const segment = this.data[keyId];
    let changes = {};
    if (segment.children) {
      //if (segment.children.length > 1) {
      let newIndex = 0;
      let newChildren = [];
      let newChildrenKeys = [];
      const end = segment.children.length;
      for (let i = 0; i < end; i++) {

        // Слияние внтури подчиенного
        this.joinSegments(segment.children[i]);

        const next = this.data[segment.children[i]];
        if (newChildren.length && utils.canJoin(newChildren[newIndex], next)) {
          // Слияние с предудыщим сегментом
          const newChild = {
            ...newChildren[newIndex],
            value: newChildren[newIndex].value + next.value
          };
          // Корректировка типа строки
          utils.detectTextType(newChild);
          newChildren.splice(newIndex, 1, newChild);
          // Удаление слитого сегмента
          this.control.delete(next.keyId);
          this.data[newChild.keyId] = newChild;

          changes[newChild.keyId] = true;
          changes[keyId] = true;
        } else {
          if (next.type === 'cursor' && !next.active) {
            // удаление неактивного курсора
            this.control.delete(next.keyId);
            changes[keyId] = true;
          } else {
            newChildren.push(next);
            newChildrenKeys.push(next.keyId);
            newIndex = newChildren.length - 1;
          }
        }
      }
      this.data[keyId].children = newChildrenKeys;

      if (utils.canClearParent(keyId, this.data)) {
        const childKeyId = this.data[keyId].children[0];
        this.data[keyId] = {
          ...this.data[keyId],
          value: this.data[childKeyId].value,
          selected: this.data[childKeyId].selected || 'none',
          children: []
        };
        changes[keyId] = true;
        delete changes[childKeyId];
        this.control.delete(childKeyId);
      }
      this.data[keyId] = {
        ...this.data[keyId]
      };
      const keys = Object.keys(changes);
      for (const eventKeyId of keys) {
        this.control.broadcaster.dispatchEvent(`onChangeItem-${eventKeyId}`, this.data[eventKeyId]);
      }
    }
  };

  selectSegments = (from, to) => {
    this.selectionRange.count = 0;
    // Рекурсивный обход
    //const lastRange = this.selectionRange;
    // По _path узла сверять, стоит ли продолжать рекурсию
    // Сравнивая from._path и to._path определить кто вначале, кто в конце
    // Выполнять обобщение после перебора подиченных и установки им selected
    // Общий обход скооректировать предыдущим from и to
    const iterate = (segment, selectRange) => {
      const compFrom = utils.pathTreeCompare(selectRange.from.segment._path, segment._path);
      const compTo = utils.pathTreeCompare(selectRange.to.segment._path, segment._path);
      let result = 'none';
      if (
        (compFrom === 'self' &&
          compTo === 'self' &&
          selectRange.from.dist.sideX === 'left' &&
          selectRange.to.dist.sideX === 'right') ||
        (compFrom === 'self' && compTo === 'right' && selectRange.from.dist.sideX === 'left') ||
        (compFrom === 'left' && compTo === 'self' && selectRange.to.dist.sideX === 'right') ||
        (compFrom === 'left' && compTo === 'right')
      ) {
        // selected
        result = 'full';
      // } else if (
      //   compFrom === 'self' &&
      //   compTo === 'self' &&
      //   (selectRange.from.dist.sideX !== 'left' || selectRange.to.dist.sideX !== 'right')) {
      //   result = 'part';
      } else if (compFrom === 'child' || compTo === 'child') {
        // Частичное или полное выделение?
        let selectedFullCnt = 0;
        let selectedPartCnt = 0;
        for (const childKeyId of segment.children) {
          const selectedChild = iterate(this.data[childKeyId], selectRange);
          if (selectedChild === 'full') {
            selectedFullCnt++;
          } else if (selectedChild === 'part') {
            selectedPartCnt++;
          }
        }
        if (selectedFullCnt === 0 && selectedPartCnt === 0) {
          result = 'none';
        } else if (selectedFullCnt < segment.children.length) {
          result = 'part';
        } else {
          result = 'full';
        }
      }
      this.control.patch({
        keyId: segment.keyId,
        selected: result
      });
      // Сросить выделение всех подчиенных\
      return result;
    };

    const selectionRangeNew = {from, to, count: 0};
    const comp = utils.pathTreeCompare(from.segment._path, to.segment._path);
    if (
      comp === 'right' ||
      (comp === 'self' && from.dist.sideX !== to.dist.sideX && from.dist.sideX === 'right')
    ) {
      selectionRangeNew.from = to;
      selectionRangeNew.to = from;
    }

    if (
      !this.selectionRange ||
      !this.selectionRange.count ||
      this.selectionRange.from.segment.keyId !== selectionRangeNew.from.segment.keyId ||
      this.selectionRange.to.segment.keyId !== selectionRangeNew.to.segment.keyId ||
      this.selectionRange.from.dist.sideX !== selectionRangeNew.from.dist.sideX ||
      this.selectionRange.to.dist.sideX !== selectionRangeNew.to.dist.sideX
    ) {
      this.selectionRange = selectionRangeNew;
      iterate(this.data['root'], this.selectionRange);
    }
  };

  onMouseDown = e => {
    //this.clearBrowserSelection();
    this.mouseRange = {
      startX: e.clientX + window.pageXOffset,
      startY: e.clientY + window.pageYOffset,
      endX: e.clientX + window.pageXOffset,
      endY: e.clientY + window.pageYOffset,
      state: 'start'
    };

    this.control.patch({keyId: this.data['root'].keyId, selected: 'none'});

    this.startNode = this.findSegment(this.data['root'], {
      x: this.mouseRange.startX,
      y: this.mouseRange.startY
    });

    this.control.setCursor(this.startNode.segment, this.startNode.dist.sideX);
    // this.control.setCursorCandidate(null);
    // this.broadcaster.dispatchEvent('changeMouseRange', this.mouseRange);
    //this.setState({mouseRange: this.mouseRange});

    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1]));
    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1, 1]));
    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1, 1, 1]));
    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1, 1, 2]));
    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1, 1, 2, 1]));
    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1, 1, 2, 2]));
    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1, 1, 2, 2, 1]));
    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1, 1, 3]));
    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1, 1, 4]));
    // console.log(utils.pathTreeCompare([1, 1, 2, 2], [1, 2]));
    //
    // console.log(this.data);
    //this.joinSegments('root');
  };

  onMouseMove = e => {
    if (this.mouseRange.state !== 'end') {
      this.mouseRange = {
        ...this.mouseRange,
        endX: e.clientX + window.pageXOffset,
        endY: e.clientY + window.pageYOffset,
        state: 'change'
      };

      this.endNode = this.findSegment(this.data['root'], {
        x: this.mouseRange.endX,
        y: this.mouseRange.endY
      });

      this.selectSegments(this.startNode, this.endNode, true);
      if (!this.selectionRange.count) {
        this.control.setCursor(this.startNode.segment, this.startNode.dist.sideX);
      } else {
        this.control.setCursor(null);
      }

      //this.joinSegments('root');
    }
  };

  onMouseUp = e => {
    this.mouseRange = {
      ...this.mouseRange,
      endX: e.clientX + window.pageXOffset,
      endY: e.clientY + window.pageYOffset,
      state: 'end'
    };

    this.joinSegments('root');
    console.log(this.data);
  };

  onDragStart = e => {
    console.log('drag');
    e.preventDefault();
  };

  onChange = data => {
    this.props.onChange(data);
  };

  render() {
    const color = this.state.isFocus ? '#0f0' : '#ccc';
    const selectionStyle = {
      left: `${Math.min(this.mouseRange.startX, this.mouseRange.endX) - window.pageXOffset}px`,
      top: `${Math.min(this.mouseRange.startY, this.mouseRange.endY) - window.pageYOffset}px`,
      width: `${Math.abs(this.mouseRange.startX - this.mouseRange.endX)}px`,
      height: `${Math.abs(this.mouseRange.startY - this.mouseRange.endY)}px`
    };
    const rootKey = this.data.root.keyId;
    return (
      <div
        className="RichEditor"
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        tabIndex={0}
        ref={this.mainRef}
        style={{outline: `1px solid ${color}`, outlineOffset: -1}}
      >
        {/*{<div className="RichEditor__mouseRange" style={selectionStyle}/>}*/}
        <DataContext.Provider value={this.control}>
          {rootKey && <Segment keyId={rootKey} broadcaster={this.broadcaster}/>}
        </DataContext.Provider>
      </div>
    );
  }
}

export default RichEditor;
