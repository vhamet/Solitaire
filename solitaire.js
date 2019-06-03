/* eslint-disable no-cond-assign */
/* eslint-disable no-param-reassign */
/* eslint-disable no-plusplus */
const typesEnum = { stack: 1, ace: 2 };
const colors = [
  { name: 'hearts', value: 1 },
  { name: 'spades', value: 2 },
  { name: 'diamonds', value: 3 },
  { name: 'clubs', value: 4 },
];
const values = [
  { value: 1, name: 'ace' },
  { value: 2, name: '2' },
  { value: 3, name: '3' },
  { value: 4, name: '4' },
  { value: 5, name: '5' },
  { value: 6, name: '6' },
  { value: 7, name: '7' },
  { value: 8, name: '8' },
  { value: 9, name: '9' },
  { value: 10, name: '10' },
  { value: 11, name: 'jack' },
  { value: 12, name: 'queen' },
  { value: 13, name: 'king' },
];
const cards = [];
const hiddenUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Card_back_02a.svg';

const body = document.querySelector('body');
const container = document.getElementById('container');
const deck = document.getElementById('deck');
const pick = document.getElementById('pick');
const ace1 = document.getElementById('ace1');
const ace2 = document.getElementById('ace2');
const ace3 = document.getElementById('ace3');
const ace4 = document.getElementById('ace4');
const stack1 = document.getElementById('stack1');
const stack2 = document.getElementById('stack2');
const stack3 = document.getElementById('stack3');
const stack4 = document.getElementById('stack4');
const stack5 = document.getElementById('stack5');
const stack6 = document.getElementById('stack6');
const stack7 = document.getElementById('stack7');

const stacks = [stack1, stack2, stack3, stack4, stack5, stack6, stack7];
const aces = [ace1, ace2, ace3, ace4];
const potentialDestinations = [
  ...aces.map((a, i) => ({ type: typesEnum.ace, element: a, index: i })),
  ...stacks.map((s, i) => ({ type: typesEnum.stack, element: s, index: i }))];

const deckCards = [];
const pickCards = [];
const stackCards = [[], [], [], [], [], [], []];
const stackAcesCards = [[], [], [], []];

const imageScale = document.getElementById('img-scale');
let rectImage = imageScale.getBoundingClientRect();

let grabbed = null;
let grabbedFrom = null;
let grabbedTop = null;
let grabbedLeft = null;
let offsetX = null;
let offsetY = null;
let grabbedStack = [];

const resetGrab = () => {
  grabbed = null;
  grabbedFrom = null;
  grabbedTop = null;
  grabbedLeft = null;
  offsetX = null;
  offsetY = null;
  grabbedStack = null;
};

const initDeck = () => {
  colors.forEach((color) => {
    values.forEach((value) => {
      cards.push({
        id: `${color.name[0]}${value.name[0]}`,
        color: color.name,
        iColor: color.value,
        value: value.name,
        iValue: value.value,
      });
    });
  });
};

const shuffleDeck = () => {
  for (let i = 51; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
};

const getElementFromCard = (index, card, shift) => {
  const img = document.createElement('img');
  img.id = card.id;
  img.src = card.src;
  img.classList.add(...card.classes);
  img.style.top = shift ? `${index * rectImage.height * shift}px` : 0;

  return img;
};

const setGame = () => {
  let counter = 0;
  for (let i = 0; i < 7; i++) {
    for (let j = i; j < 7; j++) {
      if (i === j) {
        cards[counter].facing = true;
        cards[counter].src = `svg_cards/${cards[counter].value}_of_${
          cards[counter].color
        }.svg`;
        cards[counter].classes = ['stack-image', 'stack-image-facing'];
      } else {
        cards[counter].facing = false;
        cards[counter].src = hiddenUrl;
        cards[counter].classes = ['stack-image'];
      }
      stackCards[j].unshift(cards[counter]);
      stacks[j].appendChild(getElementFromCard(i, cards[counter], 0.03));
      counter++;
    }
  }

  cards.slice(counter).forEach((card, i) => {
    card.facing = false;
    card.src = hiddenUrl;
    card.classes = ['deck-image'];
    deckCards.unshift(card);
    deck.appendChild(getElementFromCard(i, card, 0));
  });
};

const setPickLayout = () => {
  if (pickCards.length > 2) {
    pick.lastChild.style.left = `${rectImage.width * 0.4}px`;
    pick.lastChild.previousSibling.style.left = `${rectImage.width * 0.2}px`;
  }
};

const setStackLayout = () => {
  const topFacing = rectImage.height * 0.2;
  const topHidden = rectImage.height * 0.03;
  stacks.forEach((stack, i) => {
    let total = 0;
    const stackCard = [...stackCards[i]].reverse();
    stack.querySelectorAll('.stack-image').forEach((img, j) => {
      let top = 0;
      if (j > 0) {
        top = stackCard[j - 1].facing ? topFacing : topHidden;
      }
      total += top;
      img.style.top = `${total}px`;
    });
  });
};

const resize = () => {
  rectImage = imageScale.getBoundingClientRect();
  const rowGap = rectImage.height / 2;
  const columnGap = rectImage.width / 4;
  container.style.gridRowGap = `${rowGap}px`;
  container.style.gridColumnGap = `${columnGap}px`;

  rectImage = imageScale.getBoundingClientRect();
  container.style.gridTemplateRows = `repeat(2, ${rectImage.height}px)`;

  setStackLayout();
  setPickLayout();
};

const init = () => {
  if (!imageScale.getBoundingClientRect().height) {
    window.requestAnimationFrame(init);
  } else {
    resize();
  }
};

const intersect = (rect1, rect2) => Math.max(0,
  Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left))
  * Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top)) || 0;

const getIntersectionFromAce = (rect, destination, grabbedCard) => {
  if (grabbedStack.length) return 0;

  const aceStack = stackAcesCards[destination.index];
  if (!aceStack.length) {
    if (grabbedCard.value === 'ace') {
      return intersect(rect, destination.element.getBoundingClientRect());
    }
  } else if (aceStack[0].color === grabbedCard.color
    && aceStack[0].iValue === grabbedCard.iValue - 1) {
    return intersect(rect, destination.element.lastChild.getBoundingClientRect());
  }

  return 0;
};

const getIntersectionFromStack = (rect, destination, grabbedCard) => {
  const cardStack = stackCards[destination.index];
  if (!cardStack.length) {
    return intersect(rect, destination.element.getBoundingClientRect());
  }

  if (cardStack[0].facing && cardStack[0].iColor % 2 !== grabbedCard.iColor % 2
    && cardStack[0].iValue === grabbedCard.iValue + 1) {
    return intersect(rect, destination.element.lastChild.getBoundingClientRect());
  }

  return 0;
};

const getDestination = (rect) => {
  const grabbedCard = cards.filter(c => c.id === grabbed.id)[0];
  const intersections = [];

  potentialDestinations.forEach((d) => {
    if (d.element === grabbedFrom) {
      intersections.push(0);
      return;
    }

    let intersection;
    if (d.type === typesEnum.ace) {
      intersection = getIntersectionFromAce(rect, d, grabbedCard);
    } else {
      intersection = getIntersectionFromStack(rect, d, grabbedCard);
    }

    intersections.push(intersection);
  });

  const index = intersections.indexOf(Math.max(...intersections));
  if (intersections[index] > 0) {
    return potentialDestinations[index];
  }

  return null;
};

const getNextSiblings = (element) => {
  const nextSiblings = [];
  while ((element = element.nextSibling)) {
    nextSiblings.push({ element });
  }

  return nextSiblings;
};

const grab = (card, x, y) => {
  grabbed = card;
  grabbedFrom = grabbed.parentNode;
  grabbedTop = grabbed.style.top;
  grabbedLeft = grabbed.style.left;
  grabbedStack = getNextSiblings(grabbed);

  const rect = grabbed.getBoundingClientRect();
  offsetX = x - rect.x;
  offsetY = y - rect.y;

  grabbed.classList.add('grabbing');
  grabbed.style.height = rectImage.height * 1.1;
  grabbed.style.width = rectImage.width * 1.1;
  const left = `${x - offsetX}px`;
  grabbed.style.left = left;
  grabbed.style.top = `${y - offsetY}px`;

  body.appendChild(grabbed);
  grabbedStack.forEach((e) => {
    const rectElement = e.element.getBoundingClientRect();
    e.element.classList.add('grabbing');
    e.offsetY = y - rectElement.y;
    e.element.style.left = left;
    e.element.style.top = `${y - e.offsetY}px`;
    e.element.style.height = rectImage.height * 1.1;
    e.element.style.width = rectImage.width * 1.1;

    body.appendChild(e.element);
  });
};

const handleMouseDown = (e) => {
  e.preventDefault();
  if (e.target.classList.contains('stack-image-facing')
    || e.target.classList.contains('pick-image-facing')) {
    grab(e.target, e.clientX, e.clientY);
  }
};

const handleMouseMove = (e) => {
  if (grabbed) {
    const left = `${e.clientX - offsetX}px`;
    grabbed.style.left = left;
    grabbed.style.top = `${e.clientY - offsetY}px`;

    grabbedStack.forEach((g) => {
      g.element.style.left = left;
      g.element.style.top = `${e.clientY - g.offsetY}px`;
    });
  }
};

const unstackMovedCards = (parent) => {
  if (parent.id[0] === 's') {
    const movedCards = [];
    const index = parseInt(grabbedFrom.id[5], 10) - 1;
    const movedElements = [...grabbedStack, grabbed];
    movedElements.forEach(() => movedCards.push(stackCards[index].shift()));

    return movedCards;
  }

  if (parent.id[0] === 'a') {
    return [stackAcesCards[parseInt(grabbedFrom.id[3] - 1, 10)].shift()];
  }

  return [pickCards.shift()];
};

const moveGrabbedCard = (destination) => {
  let top;
  const movedCards = unstackMovedCards(grabbedFrom);
  if (destination.type === typesEnum.ace) {
    grabbed.style.top = 0;
    top = 0;
    stackAcesCards[destination.index].unshift(movedCards[0]);
  } else {
    const nbFacingCards = stackCards[destination.index].filter(c => c.facing).length;
    const nbHiddenCards = stackCards[destination.index].length - nbFacingCards;
    top = (nbHiddenCards - 1) * rectImage.height * 0.03 + nbFacingCards * rectImage.height * 0.2;
    grabbed.style.top = `${top}px`;
    stackCards[destination.index] = [...movedCards, ...stackCards[destination.index]];
  }

  return top;
};

const setMovedCard = () => {
  if (grabbedFrom === pick) {
    grabbed.classList.remove('pick-image');
    grabbed.classList.remove('pick-image-facing');
    grabbed.classList.add('stack-image');
    grabbed.classList.add('stack-image-facing');
    if (pick.lastChild) {
      pick.lastChild.classList.add('pick-image-facing');
    }
    setPickLayout();
  } else if (grabbedFrom.lastChild) {
    grabbedFrom.lastChild.classList.add('stack-image-hidden');
  }
};

const setMovedStack = (parent, top) => {
  grabbedStack.forEach((e, i) => {
    e.element.classList.remove('grabbing');
    e.element.style.height = null;
    e.element.style.width = null;
    e.element.style.top = `${top + rectImage.height * 0.2 * (i + 1)}px`;
    e.element.style.left = 0;
    parent.appendChild(e.element);
  });
};

const checkForVictory = () => !cards.filter(c => !c.facing).length
    && !deckCards.length && !pickCards.length;

const handleMouseUp = () => {
  if (!grabbed) return;

  const rect = grabbed.getBoundingClientRect();
  const destination = getDestination(rect);

  let parent = grabbedFrom;
  let top;
  if (destination) {
    grabbed.style.left = 0;
    parent = destination.element;
    top = moveGrabbedCard(destination);
    setMovedCard();
  } else {
    grabbed.style.top = grabbedTop;
    grabbed.style.left = grabbedLeft;
    top = parseInt(grabbedTop, 10);
  }

  grabbed.classList.remove('grabbing');
  grabbed.style.height = null;
  grabbed.style.width = null;
  parent.appendChild(grabbed);
  setMovedStack(parent, top);
  resetGrab();

  if (checkForVictory()) alert('victory !');
};

const clickHiddenCard = (e) => {
  const card = cards.filter(c => c.id === e.target.id)[0];
  card.facing = true;
  e.target.classList.remove('stack-image-hidden');
  e.target.classList.add('stack-image-facing');
  e.target.src = `svg_cards/${card.value}_of_${card.color}.svg`;
};

const clickDeckCard = () => {
  pick.childNodes.forEach((child) => { child.style.left = 0; });

  const max = Math.min(deckCards.length, 3);
  for (let i = 0; i < max; i++) {
    const card = deckCards.shift();
    card.facing = true;
    pickCards.unshift(card);

    const child = deck.lastChild;
    child.src = `svg_cards/${card.value}_of_${card.color}.svg`;
    child.classList.remove('deck-image');
    child.classList.add('pick-image');
    if (i === max - 1) child.classList.add('pick-image-facing');

    child.style.left = `${i * rectImage.width * 0.2}px`;
    child.style.top = 0;
    pick.appendChild(child);
  }
};

const clickDeck = () => {
  let cardElement = pick.lastChild;
  while (cardElement != null) {
    cardElement.src = hiddenUrl;
    cardElement.style.left = 0;
    cardElement.classList.add('deck-image');
    cardElement.classList.remove('pick-image');
    cardElement.classList.remove('pick-image-facing');
    deck.appendChild(cardElement);

    const card = pickCards.shift();
    card.facing = false;
    deckCards.unshift(card);

    cardElement = pick.lastChild;
  }
};

const handleClick = (e) => {
  e.preventDefault();
  if (e.target.classList.contains('stack-image-hidden')) {
    clickHiddenCard(e);
  } else if (e.target.classList.contains('deck-image')) {
    clickDeckCard(e);
  } else if (e.target.id === 'deck') {
    clickDeck(e);
  }
};

window.addEventListener('resize', resize);
document.addEventListener('mousedown', handleMouseDown);
document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('mouseup', handleMouseUp);
document.addEventListener('click', handleClick);

init();
initDeck();
shuffleDeck();
setGame();
