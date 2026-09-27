export const POOLS = {
  flowers: [
    'photo-1508610048659-a06b669e3321', // pink roses bouquet
    'photo-1490750967868-88aa4486c946', // roses + gift box
    'photo-1457089328109-e5d9bd499191', // carnations
    'photo-1487070183336-b863922373d4', // roses closeup
    'photo-1561181286-d3fee7d55364', // roses & macarons
    'photo-1519378058457-4c29a0a2efac', // tulips
    'photo-1471899236350-e3016bf1e69e', // pink tulips
    'photo-1468327768560-75b778cbb551', // sunflowers
    'photo-1494972308805-463bc619d34e', // rose closeup
  ],
  cakes: [
    'photo-1578985545062-69928b1d9587', // chocolate cake
    'photo-1535141192574-5d4897c12636', // cake slice
    'photo-1587668178277-295251f900ce', // berries cake
    'photo-1464349095431-e9a21285b5f3', // birthday cake candles
    'photo-1621303837174-89787a7d4729', // cupcake
  ],
  plants: [
    'photo-1416879595882-3373a0480b5b', // plants
    'photo-1466692476868-aef1dfb1e735', // potted plant
    'photo-1485955900006-10f4d324d411', // plants on table
    'photo-1463320726281-696a485928c7', // succulents
  ],
  gifts: [
    'photo-1549465220-1a8b9238cd48', // red gift box
    'photo-1512909006721-3d6018887383', // gift boxes
    'photo-1513201099705-a9746e1e201f', // gift & confetti
    'photo-1481349518771-20055b2a7b24', // surprise box
    'photo-1513885535751-8b9238bd345a', // gift bag
  ],
  chocolates: [
    'photo-1481391319762-47dff72954d9', // truffles
    'photo-1511381939415-e44015466834', // chocolate bars
    'photo-1549007994-cb92caebd54b', // hot chocolate
    'photo-1606312619070-d48b4c652a52', // pralines box
  ],
  hampers: [
    'photo-1549465220-1a8b9238cd48', // gift box
    'photo-1513885535751-8b9238bd345a', // gift basket
    'photo-1513201099705-a9746e1e201f', // celebration
  ],
  personalized: [
    'photo-1512909006721-3d6018887383', // gifts
    'photo-1607344645866-009c320b63e0', // mug print
    'photo-1513885535751-8b9238bd345a', // gift bag
  ],
  occasions: {
    birthday: 'photo-1464349095431-e9a21285b5f3',
    anniversary: 'photo-1490750967868-88aa4486c946',
    wedding: 'photo-1519741497674-611481863552',
    corporate: 'photo-1549465220-1a8b9238cd48',
    congratulations: 'photo-1513201099705-a9746e1e201f',
  },
  hero: ['photo-1513885535751-8b9238bd345a', 'photo-1490750967868-88aa4486c946', 'photo-1549465220-1a8b9238cd48'],
} as Record<string, unknown>

export function unsplash(id: string, w = 800, q = 80): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`
}
