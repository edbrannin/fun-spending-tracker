import React, { useMemo } from "react"

import Transaction from "@my-types/Transaction"

class TransactionGrouping {
  constructor(month: string, transactions?: Transaction[]) {
    this.month = month
    this.transactions = transactions || []

    this.transactions.forEach((t) => {
      if (t.month !== this.month) {
        throw new Error(
          `Transaction month ${t.month} does not match TransactionGrouping month ${this.month}!`
        )
      }
    })
  }
  month: string
  transactions: Transaction[]
  get totalSpent(): number {
    return this.transactions
      .filter((t) => t.bought)
      .reduce((total: number, t: Transaction) => total + t.amount, 0)
  }
  get totalPlanned(): number {
    return this.transactions.reduce(
      (total: number, t: Transaction) => total + t.amount,
      0
    )
  }
}

const formatMoney = (amount: number, currency = "USD") =>
  amount.toLocaleString("en-US", { style: "currency", currency })

const Money = ({ amount, currency = "USD" }) => (
  <span>{formatMoney(amount, currency)}</span>
)

const groupByMonth = (
  transactions: Transaction[] = []
): TransactionGrouping[] => {
  const transactionGroupingssByMonth = new Map<string, TransactionGrouping>()
  transactions.forEach((t) => {
    if (!transactionGroupingssByMonth.get(t.month)) {
      transactionGroupingssByMonth.set(
        t.month,
        new TransactionGrouping(t.month, [t])
      )
    } else {
      transactionGroupingssByMonth.get(t.month).transactions.push(t)
    }
  })
  return [...transactionGroupingssByMonth.values()]
}

const calculateRunningTotals = (
  transactionGroups: TransactionGrouping[],
  monthlyBudget: number
): Record<string, number> =>
  transactionGroups.reduce((records, currentMonth, index) => {
    const lastMonth = transactionGroups[index - 1]?.month
    const lastTotal = lastMonth ? records[lastMonth] : 0
    return {
      ...records,
      [currentMonth.month]:
        lastTotal + monthlyBudget - currentMonth.totalPlanned,
    }
  }, {})

const TransactionTable = ({
  transactions,
  showCategory = false,
  showStore = false,
  monthlyBudget = 30,
}: {
  transactions: Transaction[]
  showCategory?: boolean
  showStore?: boolean
  monthlyBudget?: number
}) => {
  const transactionGroups = useMemo(
    () => groupByMonth(transactions),
    [transactions]
  )

  const runningTotalsAfterMonths = useMemo(
    () => calculateRunningTotals(transactionGroups, monthlyBudget),
    [transactionGroups]
  )

  return (
    <table className="my-6 w-full">
      <thead>
        <tr>
          <th>Month</th>
          <th>Total</th>
          <th>Name</th>
          <th>Amount</th>
          <th>Bought?</th>
          {showCategory && <th>Category</th>}
          {showStore && <th>Store</th>}
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {transactionGroups.map((tg) => (
          <React.Fragment key={tg.month}>
            {tg.transactions.map((t, index) => (
              <tr key={t.id} className={`${index === 0 && "border-t-2"}`}>
                {index === 0 && (
                  <>
                    <td rowSpan={tg.transactions.length}>{tg.month}</td>
                    <td rowSpan={tg.transactions.length} className="border-r-2">
                      {tg.totalSpent !== tg.totalPlanned && (
                        <>
                          <div>
                            <Money amount={tg.totalSpent} />
                          </div>
                          <hr />
                        </>
                      )}
                      <div>
                        <Money amount={tg.totalPlanned} />
                      </div>
                    </td>
                  </>
                )}
                <td>{t.name}</td>
                <td>
                  <Money amount={t.amount} />
                </td>
                <td>
                  <input type="checkbox" checked={t.bought} disabled />
                </td>
                {showCategory && <td>{t.category}</td>}
                {showStore && <td>{t.store}</td>}
                <td>{t.notes}</td>
              </tr>
            ))}
            <tr>
              <td className="py-2">Total</td>
              <td className="border-r-2 py-2">
                <Money amount={runningTotalsAfterMonths[tg.month]} />
              </td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}

export default TransactionTable
