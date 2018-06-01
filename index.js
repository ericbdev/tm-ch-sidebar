// ==UserScript==
// @name         Clubhouse Accordions
// @namespace    BucketDrop
// @version      0.1
// @author       ericbdev
// @description  Convert Clubhouse's Story pages column items into accordions
// @match        https://*.clubhouse.io/*
// @grant        none
// ==/UserScript==

/*
  TODO:
    - detach all nodes of content
    - inject h3 as trigger
    - take remaning nodes, inject in new wrapping node
    - set that node to hide/show

*/

const helpers = {
  wrapAll: (nodes, wrapper) => {
    // Cache the current parent and previous sibling of the first node.
    const { previousSibling, parentNode } = nodes[0];

    // Place each node in wrapper.
    //  - If nodes is an array, we must increment the index we grab from
    //    after each loop.
    //  - If nodes is a NodeList, each node is automatically removed from
    //    the NodeList when it is removed from its parent with appendChild.
    for (let i = 0; nodes.length - i; wrapper.firstChild === nodes[0] && i++) {
      wrapper.appendChild(nodes[i]);
    }

    // Place the wrapper just after the cached previousSibling,
    // or if that is null, just before the first child.
    const nextSibling = previousSibling ? previousSibling.nextSibling : parentNode.firstChild;
    parentNode.insertBefore(wrapper, nextSibling);

    return wrapper;
  },
};

class BucketAccordion {
  constructor(element) {
    // Clubhouse has no communal selector across column items
    // Expect this to fail some day
    this.element = element;
    this.elementChildren = element.childNodes;

    this.title = null;
    this.content = null;
    this.button = null;
    this.isActive = false;

    this.triggerClass = 'ba-active';
    this.faClases = ['fa', 'fa-caret-down'];

    this._handleTriggerClick = this._handleTriggerClick.bind(this);

    this._init();
  }

  unload() {
    this.title.removeEventListener('click', this._handleTriggerClick);
  }

  _init() {
    const content = document.createElement('div');

    // Break out section title
    const title = this.element.querySelector('h3');
    const clonedTitle = title.cloneNode(true);
    this.element.removeChild(title);

    // Wrap children in one element
    const wrappedChildren = helpers.wrapAll(this.elementChildren, content);

    // Add to layout
    this.element.innerHTML = '';
    this.element.append(clonedTitle);
    this.element.append(wrappedChildren);

    // Add data hooks
    content.setAttribute('data-accordion-content', '');
    clonedTitle.setAttribute('data-accordion-trigger', '');

    // Cache DOM
    this.title = clonedTitle;
    this.content = wrappedChildren;

    // Attach event handler to title
    this.title.addEventListener('click', this._handleTriggerClick);

    this._addArrow();

    // Hide all content
    // TODO: Connect to whitelist of content boxes to keep open
    // TODO: Save remembered content status via localStorage
    // TODO: Use 'data-context-menu' or h3.innerText as reference
    this._toggleContent(false);
  }

  _addArrow() {
    // Create a button to display on the page
    const button = document.createElement('span');

    // Add FontAwesome Class
    this.faClases.forEach((faClass) => {
      button.classList.add(faClass);
    });

    // Style button
    button.style.float = 'left';
    button.style.marginRight = '5px';
    button.style.height = '11px';
    button.style.width = '11px';
    button.style.display = 'inline-block';
    button.style.textAlign = 'center';

    // Store button
    this.button = button;

    // Add to DOM
    this.title.appendChild(button);
  }

  _toggleContent(state) {
    if (state) {
      this._showContent();
    } else {
      this._hideContent();
    }
  }

  _handleTriggerClick(event) {
    const isActive = event.currentTarget.classList.contains(this.triggerClass);

    this._toggleContent(!isActive);
  }

  /**
   * Hide content
   */
  _hideContent() {
    this.content.style.height = '0';
    this.content.style.overflow = 'hidden';

    this._toggleButton(false);
  }

  /**
   * Show content
   */
  _showContent() {
    this.content.style.height = 'auto';
    this.content.overflow = '';
    this._toggleButton(true);
  }

  /**
   * Toggle Button
   * @param {boolean} state - Toggle button to on (true) or off (false);
   */
  _toggleButton(state = false) {
    this.button.style.transform = state ? 'rotate(0)' : 'rotate(-90deg)';
    this.title.classList.toggle(this.triggerClass, state);
  }
}

class BucketDrop {
  constructor() {
    this.namespace = 'bd_';
    this.bucketAccordions = [];

    setInterval(() => {
      this._intervals();
    }, 1000);
  }

  _intervals() {
    const buckets = document.querySelectorAll('.sidebar-bucket');

    if (buckets) {
      this.load(buckets);
    } else {
      this.unload();
    }
  }

  load(buckets) {
    buckets.forEach((element) => {
      const trigger = element.querySelector('[data-accordion-trigger]');
      if (trigger) {
        return;
      }

      // Stores as variable because of 'no-new'
      // Could be used in future to unload javascript.
      this.bucketAccordions.push(new BucketAccordion(element));
    });
  }

  unload() {
    this.bucketAccordions.forEach((accordion) => {
      accordion.unload();
    });

    this.bucketAccordions = [];
  }
}


new BucketDrop();
