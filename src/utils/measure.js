class Measure {
  constructor() {
  }

  createContainer() {
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.style.font = 'initial';
      this._container.style.position = 'absolute';
      this._container.style.width = '10000px';
      this._container.style.height = 0;
      this._container.style.display = 'block';
      this._container.style.visibility = 'hidden';
      this._container.style.zIndex = -1;
      document.body.append(this._container);
    }
    return this._container;
  }

  deleteContainer() {
    if (this._container) {
      document.body.removeChild(this._container);
      this._container = null;
    }
  }

  textSize(text, style = {}) {
    this.createContainer();
    const element = document.createElement('span');
    element.style.display = 'inline';
    const keys = Object.keys(style);
    for (const key of keys) {
      element.style[key] = style[key];
    }
    element.append(text.replace(/\s/g, ' '));
    this._container.append(element);
    const rect = element.getBoundingClientRect();
    const result = {
      width: element.offsetWidth,
      height: element.offsetHeight,
      widthBounding: rect.width,
      heightBounding: rect.height
    };
    //this._container.removeChild(element);
    this.deleteContainer();
    return result;
  }

  getPPI() {
    this.createContainer();
    const element = document.createElement('div');
    element.style.width = '1in';
    this._container.appendChild(element);
    const ppi = element.offsetWidth;
    this._container.removeChild(element);
    this.deleteContainer();
    return ppi;
  }
}

export default new Measure();
