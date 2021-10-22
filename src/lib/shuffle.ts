import { Stack } from '../types.ts'

export default function shuffle(cards: Stack): Stack {
  if (Math.random() > 0.7) {
    const numberOfBridges = Math.ceil(Math.random() * 90) + 50 // Bridge a ton of times to make sure its shuffled enough
    for (let bridges = 0; bridges < numberOfBridges; bridges++) {
      cards = bridge(cards)
    }
  } else {
    const numberOf52s = Math.ceil(Math.random() * 3) + 1
    for (let pickups = 0; pickups < numberOf52s; pickups++) {
      cards = fiftyTwoPickup(cards)
    }
  }

  const numberOfSplits = Math.ceil(Math.random() * 4) + 1
  for (let splits = 0; splits < numberOfSplits; splits++) {
    cards = split(cards)
  }

  return cards
}

/** Split the stack into two smaller stacks, combine the stacks one card at a time. */
function bridge(cards: Stack): Stack {
  const cardsArray = Object.keys(cards)
  const newStack: Stack = {}

  const half = Math.floor(cardsArray.length / 2)

  const stack1: string[] = []
  const stack2: string[] = []


  cardsArray.forEach((card, index) => {
    if (index < half) {
      stack1.push(card)
    } else {
      stack2.push(card)
    }
  })

  Object.keys(cards).forEach((_card, i) => {
    let index: string
    if (i % 2 == 0) {
      index = stack1.shift() ?? ''
    } else {
      index = stack2.shift() ?? ''
    }

    newStack[index] = cards[index]
  })

  return newStack
}

/** Scatter a stack of cards, randomly pick a card from the pile to add back to the deck */
function fiftyTwoPickup(cards: Stack): Stack {
  const cardsArray = Object.keys(cards)
  const newStack: Stack = {}

  while (cardsArray.length > 0) {
    const index = Math.floor(Math.random() * cardsArray.length)
    newStack[cardsArray[index]] = cards[cardsArray[index]]
    cardsArray.splice(index, 1)
  }

  return newStack
}

/** Split the stack into two smaller stacks, then combine the stacks, but with the bottom one on top */
function split(cards: Stack): Stack {
  const cardsArray = Object.keys(cards)
  const newStack: Stack = {}

  const half = Math.floor(cardsArray.length / 2) + (Math.round(Math.random() * 20) - 10)

  const stack1: string[] = []
  const stack2: string[] = []


  cardsArray.forEach((card, index) => {
    if (index < half) {
      stack1.push(card)
    } else {
      stack2.push(card)
    }
  })

  stack2.forEach((card) => {
    newStack[card] = cards[card]
  })

  stack1.forEach((card) => {
    newStack[card] = cards[card]
  })

  return newStack
}