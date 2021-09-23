export default function newDeck() {
  const cards: Record<string, Record<string, string | number>> = {}

  const colors: Array<string> = ['red', 'yellow', 'green', 'blue']
  const distribution: Record<number | string, number> = {
    0: 1,
    1: 2,
    2: 2,
    3: 2,
    4: 2,
    5: 2,
    6: 2,
    7: 2,
    8: 2,
    9: 2,
    s: 2,
    r: 2,
    '+2': 2,
  }
  const specials: Array<Record<string, string | number>> = [
    {
      color: 'black',
      symbol: '+4',
      count: 4,
    },
    {
      color: 'black',
      symbol: 'w',
      count: 4,
    },
  ]

  colors.forEach((color) => {
    Object.keys(distribution).forEach((symbol) => {
      for (let i = 0; i < distribution[symbol]; i++) {
        cards[`${color}-${symbol}-${i}`] = {
          color,
          symbol: symbol,
        }
      }
    })
  })

  specials.forEach((special) => {
    for (let y = 0; y < special.count; y++) {
      cards[`${special.color}-${special.symbol}-${y}`] = {
        color: special.color,
        symbol: special.symbol,
      }
    }
  })

  return cards
}