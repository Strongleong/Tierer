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
    throw new Error(`Failed to locate HTML element with id '${id}' and type '${type.name}'!`);
  }

  return element;
}

/**
 * @param {any} strings
 * @param {any[]} values
 */
const html = (strings, ...values) => String.raw({ raw: strings }, ...values);

/**
 * @template T
 *
 * @param {T | T[]} data
 * @param {((event: CustomEvent) => void)|null} callback
 */
function react(data, callback = null) {
  /** @param {'set'|'delete'} action */
  const emit = (action) => {
    callback?.(new CustomEvent(`signal:${action}`));
  }

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

        const value = target[key];

        if (value && typeof(value) === 'object' && !value._isProxy) {
          target[key] = new Proxy(value, handler(data));
          return target[key];
        }

        return value;
      },

      /**
       * @param {object|array} target
       * @param {string} key
       * @param {any} value
       */
      set(target, key, value) {
        if (target[key] === value) {
          return true;
        }

        target[key] = value;
        emit('set');

        return true;
      },

      /**
       * @param {object|array} target
       * @param {string} key
       */
      deleteProperty(target, key) {
        delete target[key];
        emit('delete');
        return true;
      }
    };
  };

  return new Proxy(data, handler(data));
}

// -------------------------

/**
 * @typedef {Object} Tier
 * @property {string} name
 * @property {string} color
 * @property {string[]} items
 */

/** @type {Tier[]} */
const tiers = react([
  { name: 'S', color: '#ff7f7f', items: []},
  { name: 'A', color: '#ffbf7f', items: []},
  { name: 'B', color: '#ffdf7f', items: []},
  { name: 'C', color: '#bfff7f', items: []},
  { name: 'D', color: '#7f7fff', items: []},
], event => renderTierList(event));

/** @type {string[]} */
const items = react([
  "data:image/png;base64,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"
], (event) => renderLibrary(event));

/**
 * @param {FileList} images
 */
const loadImages = (images) => {
  const allowed = Array.from(images).filter((image) => image.type.startsWith("image/"))

  Promise.all(allowed.map((image) => new Promise((resolve, reject) => {
    const r = new FileReader();

    r.onload = () => {
      if (r.result) {
        items.push(r.result.toString());
      }

      resolve(true);
    };

    r.onerror = reject;
    r.readAsDataURL(image);
  })));
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
const tierMove = (id, direction) => {
  let next_id = direction === 'up' ? id - 1 : id + 1;
  if (next_id < 0) next_id = 0;
  if (next_id > tiers.length - 1) next_id = tiers.length - 1;
  const tmp = tiers[next_id];
  tiers[next_id] = tiers[id];
  tiers[id] = tmp;
};

/** @type {number?} to_remove_idx */
let to_remove_idx = null;

/** @type {number|'library'?} to_remove_list */
let to_remove_list = null;

/**
 * @param {DragEvent} event
 * @param {number} i
 */
const onTierDrop = (event, i) => {
  event.stopPropagation();

  if (!event.dataTransfer) {
    return;
  }

  const img = event.dataTransfer.getData("text");
  event.dataTransfer.dropEffect = 'move';

  if (!img.startsWith("data:image/png;base64,")) {
    return;
  }

  tiers[i].items.push(img);

  if (to_remove_list === null || to_remove_idx === null) {
    return;
  }

  if (to_remove_list === 'library') {
    delete(items[to_remove_idx]);
    return
  }

  delete tiers[to_remove_list].items[to_remove_idx];
}

/**
 * @param {DragEvent} event
 * @param {number|'library'} list
 * @param {number} idx
 */
function imgOnDrag(event, list, idx) {
  if (!event.dataTransfer) {
    return;
  }

  if (list === 'library') {
    event.dataTransfer.setData('text', items[idx]);
  } else {
    event.dataTransfer.setData('text', tiers[list].items[idx]);
  }

  to_remove_idx = idx;
  to_remove_list = list;

  event.dataTransfer.dropEffect = 'move';
}

/** @param {DragEvent} event */
function onContainerDrop(event) {
  event.stopPropagation();

  if (!event.dataTransfer) {
    return;
  }

  const img = event.dataTransfer.getData("text");

  if (!img.startsWith("data:image/png;base64,")) {
    return;
  }

  items.push(img);

  if (to_remove_list === null || to_remove_idx === null) {
    return;
  }

  if (to_remove_list === 'library') {
    delete(items[to_remove_idx]);
    return
  }

  delete tiers[to_remove_list].items[to_remove_idx];
}

/** @param {CustomEvent?} _event */
function renderTierList(_event = null) {
  const canvas = getEl('tier-canvas', HTMLDivElement);
  let res = '';

  tiers.map((tier, i) => {
    let itemsHtml = '';

    tier.items.map((src, j) => {
      itemsHtml += html`<img class="item-image" src="${src}" ondragstart="imgOnDrag(event, ${i}, ${j})" draggable="true">`;
    });

    res += html`
      <div
        class="tier"
        ondrop="onTierDrop(event, ${i})"
        ondragover="event.preventDefault()"
      >
        <input
          class="tier-name"
          style="background-color: ${tier.color}"
          value="${tier.name}"
          onchange="setTierName(event.target.value, ${i})"/>

        <div class="tier-main image-container">
          ${itemsHtml}
        </div>

        <div class="tier-settings">
          <div class="tier-buttons">
            <span onclick="tierMove(${i}, 'up')">▲</span>
            <span onclick="tierMove(${i}, 'down')">▼</span>
          </div>
        </div>

        <div class="button add-row-btn" title="Add another tier" onclick="tierAppend(${i})">+</div>
      </div>`;
  })

  canvas.innerHTML = res;
}

function getAddImageButton() {
  return html`
    <input id="library-input" type="file" accept="image/*" onchange="loadImages(event.target.files)" multiple>
    <label for="library-input" id="library-input-label" class="button">
      +
    </label>
  `;
}

/** @param {CustomEvent?} _event */
const renderLibrary = (_event = null) => {
  const lib = getEl("library", HTMLDivElement);
  let res = html`<div
    class="image-container"
    ondrop="onContainerDrop(event)"
    ondragover="event.preventDefault()"
  >`;

  items.map((src, i) => {
    res += html`
      <img
        class="item-image"
        src="${src}"
        draggable="true"
        ondragstart="imgOnDrag(event, 'library', ${i})"
      >
    `;
  });

  res += getAddImageButton();
  res += html`</div>`;
  lib.innerHTML = res;
}

renderTierList();
renderLibrary();
