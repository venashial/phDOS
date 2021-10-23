import { Stack, Card } from '../types.ts'

export default function dealCards(cards: Stack): { draw: Stack; hand: Stack } {
  const hand: Stack = {}
  const cardsArray = Object.keys(cards)
  const handArray = cardsArray.splice(0, 6)

  handArray.forEach((cardIndex) => {
    hand[cardIndex] = cards[cardIndex]
  })

  const remainingCards: Stack = {}

  cardsArray.forEach((cardIndex) => {
    remainingCards[cardIndex] = cards[cardIndex]
  })

  return { draw: remainingCards, hand }
}
