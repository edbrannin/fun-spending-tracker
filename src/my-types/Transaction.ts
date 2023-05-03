type Transaction = {
  id: string
  name: string
  amount: number
  cost: number
  income: number
  month: string
  store: string
  category: string
  notes: string
  bought: boolean
  link: string
  priority?: number
}

export default Transaction
