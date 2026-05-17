export type MemberBalance = {
  id: string
  name: string
  totalPoints: number
}

export type PairwisePhrase = {
  text: string
  tone: 'more' | 'less' | 'equal'
}

export type MemberPairwiseComparison = {
  memberId: string
  memberName: string
  phrases: PairwisePhrase[]
}

export function buildPairwiseComparisons(members: MemberBalance[]): MemberPairwiseComparison[] {
  return members.map((a) => {
    const phrases: PairwisePhrase[] = []

    for (const b of members) {
      if (a.id === b.id) continue
      const diff = a.totalPoints - b.totalPoints
      if (diff === 0) {
        phrases.push({
          text: `est à l'équilibre avec ${b.name}`,
          tone: 'equal',
        })
      } else if (diff > 0) {
        phrases.push({
          text: `fait ${Math.round(Math.abs(diff))} pts de plus que ${b.name}`,
          tone: 'more',
        })
      } else {
        phrases.push({
          text: `fait ${Math.round(Math.abs(diff))} pts de moins que ${b.name}`,
          tone: 'less',
        })
      }
    }

    return {
      memberId: a.id,
      memberName: a.name,
      phrases,
    }
  })
}
