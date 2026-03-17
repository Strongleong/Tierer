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

const tiers = [
  { name: 'S', color: '#ff7f7f', items: [] },
  { name: 'A', color: '#ffbf7f', items: [] },
  { name: 'B', color: '#ffdf7f', items: [] },
  { name: 'C', color: '#bfff7f', items: [] },
  { name: 'D', color: '#7f7fff', items: [] },
];

const renderTierList = () => {
  const canvas = getEl('tier-canvas', HTMLDivElement);
  let res = '';

  tiers.forEach((tier, i) => {
    res += html`
      <div class="tier">
        <input
          class="tier-name"
          style="background-color: ${tier.color}"
          value="${tier.name}"
          onchange="tiers.at(${i}).name = event.target.value"/>

        <div class="tier-main"></div>

        <div class="tier-settings">
          <div class="tier-buttons">
            <span onclick="onButton(${i}, 'up')">▲</span>
            <span onclick="onButton(${i}, 'down')">▼</span>
          </div>
        </div>
        <div class="add-row-btn" title="Add another tier" onclick=tier_append(${i})>+</div>
      </div>`;
  });

  canvas.innerHTML = res;
}

/**
 * @param {number} idx
 */
const tier_append = (idx) => {
  tiers.splice(idx+1, 0, { name: "new", color: "#ffdf7f", items: []})
  renderTierList();
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
  renderTierList();
};

renderTierList();
