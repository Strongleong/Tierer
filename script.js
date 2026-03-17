// @ts-check

/**
 * @template T
 * @typedef {new (...args: any[]) => T} Class<T>
 */

/**
 * Retrieves an element by its ID and checks its type.
 * To make tsserver happy
 * @template {HTMLElement} T
 * @param {string} id - ID of the element.
 * @param {Class<T>} type - Type of the element.
 * @returns {T} The element bearing the given ID.
 */
function getEl(id, type) {
  const element = document.getElementById(id);

  if (!element || !(element instanceof type)) {
    throw new Error(`Failed to locate HTML element with id '${id}' and type '${type}'!`);
  }

  return element;
}

/**
 * @param {any} strings
 * @param {any[]} values
 */
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);

/**
 * @param {object|array} data
 * @param {((event: Event) => void)|null} callback
 */
function react(data, callback = null) {
  /**
   * @param {'set'|'delete'} action
   */
  const emit = (action, detail = {}) => callback?.(
    new CustomEvent(`signal:${action}`, {
      bubbles: true,
      detail: detail
    }))

  /** @param {object|array} data */
  const handler = (data) => {
    return {
      /**
       * @param {object|array} target
       * @param {string} key
       */
      get(target, key) {
        if (key === '_isProxy') {
          return true;
        }

        const nested = ['[object Object]', '[object Array]'];
        const type = Object.prototype.toString.call(target[key]);

        if (nested.includes(type) && !target[key]._isProxy) {
          target[key] = new Proxy(target[key], handler(data));
        }

        return target[key];
      },

      /**
       * @param {object|array} target
       * @param {string} key
       * @param {any} value
       */
      set(target, key, value) {
        if (target[key] === value) return true;
        target[key] = value;
        emit('set', { prop: key, value });
        return true;
      },

      /**
       * @param {object|array} target
       * @param {string} key
       */
      deleteProperty(target, key) {
        delete target[key];
        emit('delete', { prop: key, value: target[key] });
        return true;
      }
    };
  };

  return new Proxy(data, handler(data));
}

const tiers = react([
  { name: 'S', color: '#ff7f7f', items: [] },
  { name: 'A', color: '#ffbf7f', items: [] },
  { name: 'B', color: '#ffdf7f', items: [] },
  { name: 'C', color: '#bfff7f', items: [] },
  { name: 'D', color: '#7f7fff', items: [] },
], () => renderTierList());

/**
 * @type {File[]}
 */
const items = react([], () => renderItems());

/**
 * @param {FileList} images
 */
const loadImages = (images) => {
  const allowed = Array.from(images).filter((image) => image.type.startsWith("image/"))
  items.push(...allowed);
}

function renderTierList() {
  const canvas = getEl('tier-canvas', HTMLDivElement);
  let res = '';

  tiers.forEach((/** @type {{ color: any; name: any; }} */ tier, /** @type {any} */ i) => {
    res += html`
      <div class="tier">
        <input
          class="tier-name"
          style="background-color: ${tier.color}"
          value="${tier.name}"
          onchange="setTierName(event.target.value, ${i})"/>

        <div class="tier-main"></div>

        <div class="tier-settings">
          <div class="tier-buttons">
            <span onclick="onButton(${i}, 'up')">▲</span>
            <span onclick="onButton(${i}, 'down')">▼</span>
          </div>
        </div>

        <div class="button add-row-btn" title="Add another tier" onclick=tierAppend(${i})>+</div>
      </div>`;
  });

  canvas.innerHTML = res;
}

/**
 * @param {string} name
 * @param {number} idx
 */
const setTierName = (name, idx) => {
  tiers[idx].name = name;
}

/**
 * @param {number} idx
 */
const tierAppend = (idx) => {
  tiers.splice(idx + 1, 0, { name: "new", color: "#ffdf7f", items: [] })
}

/**
 * @param {number} id
 * @param {'up'|'down'} direction
 */
const onButton = (id, direction) => {
  let next_id = direction === 'up' ? id - 1 : id + 1;
  if (next_id < 0) next_id = 0;
  if (next_id > tiers.length - 1) next_id = tiers.length - 1;
  const tmp = tiers[next_id];
  tiers[next_id] = tiers[id];
  tiers[id] = tmp;
};

function getAddImageButton() {
  return html`
    <input id="library-input" type="file" accept="image/*" onchange="loadImages(event.target.files)" multiple>
    <label for="library-input" id="library-input-label" class="button">
      +
    </label>
  `;
}

function renderItems() {
  const lib = getEl('library', HTMLDivElement);
  let res = '';

  if (items.length === 0) {
    lib.innerHTML = getAddImageButton();
    return;
  }

  let done = 0;

  items.forEach((item) => {
    const r = new FileReader();

    r.onload = () => {
      res += html`<img class="item-image" src="${r.result}">`;
      done++;

      if (done === items.length) {
        res += getAddImageButton();
        lib.innerHTML = res;
      }
    };

    r.readAsDataURL(item);
  });
}

renderTierList();
renderItems();
