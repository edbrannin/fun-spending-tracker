import React, { useMemo } from "react"

import formatDate from "date-fns/format"
import parseDate from "date-fns/parse"
import Link from "next/link"

import Transaction from "@my-types/Transaction"

const formatMonth = (monthDate) => {
  if (!monthDate) {
    return ""
  }
  const parsedDate = parseDate(monthDate, "yyyy-MM-dd", new Date())
  return formatDate(parsedDate, "MMM yyyy")
}

class TransactionGrouping {
  month: string
  transactions: Transaction[]

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

  get hasIncome(): boolean {
    return this.transactions.filter((tx) => tx.income > 0).length > 0
  }

  get totalSpentCost(): number {
    return this.transactions
      .filter((t) => t.bought)
      .reduce((total: number, t: Transaction) => total + t.cost, 0)
  }

  get totalPlannedCost(): number {
    return this.transactions.reduce(
      (total: number, t: Transaction) => total + t.cost,
      0
    )
  }

  get totalSpentAmount(): number {
    return this.transactions
      .filter((t) => t.bought)
      .reduce((total: number, t: Transaction) => total + t.amount, 0)
  }

  get totalPlannedAmount(): number {
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

const calculateRunningTotalCosts = (
  transactionGroups: TransactionGrouping[],
  monthlyBudget: number
): Record<string, number> =>
  transactionGroups.reduce((records, currentMonth, index) => {
    const lastMonth = transactionGroups[index - 1]?.month
    const lastTotal = lastMonth ? records[lastMonth] : 0
    return {
      ...records,
      [currentMonth.month]:
        lastTotal + monthlyBudget - currentMonth.totalPlannedCost,
    }
  }, {})

const calculateRunningTotalAmounts = (
  transactionGroups: TransactionGrouping[],
  monthlyBudget: number
): Record<string, number> =>
  transactionGroups.reduce((records, currentMonth, index) => {
    const lastMonth = transactionGroups[index - 1]?.month
    const lastTotal = lastMonth ? records[lastMonth] : 0
    return {
      ...records,
      [currentMonth.month]:
        lastTotal + monthlyBudget + currentMonth.totalPlannedAmount,
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

  const runningCostTotalsAfterMonths = useMemo(
    () => calculateRunningTotalCosts(transactionGroups, monthlyBudget),
    [transactionGroups, monthlyBudget]
  )

  const runningAmountTotalsAfterMonths = useMemo(
    () => calculateRunningTotalAmounts(transactionGroups, monthlyBudget),
    [transactionGroups, monthlyBudget]
  )

  return (
    <table className="my-6 w-full">
      <thead>
        <tr>
          <th>Month</th>
          <th>Total</th>
          <th>Bought?</th>
          <th>Amount</th>
          <th>Name</th>
          {showCategory && <th>Category</th>}
          {showStore && <th>Store</th>}
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {transactionGroups.map((tg) => (
          <React.Fragment key={tg.month}>
            {tg.transactions.map((t, index) => (
              <tr
                key={t.id}
                className={`${index === 0 && "border-t-2"} ${
                  t.amount > 0 && "bg-emerald-500"
                }`}
              >
                {index === 0 && (
                  <>
                    <td rowSpan={tg.transactions.length}>
                      {formatMonth(tg.month)}
                    </td>
                    <td rowSpan={tg.transactions.length} className="border-r-2">
                      {tg.totalSpentCost !== tg.totalPlannedCost && (
                        <>
                          <div>
                            <Money amount={tg.totalSpentCost} />
                          </div>
                          <hr />
                        </>
                      )}
                      <div>
                        <Money amount={tg.totalPlannedCost} />
                      </div>
                    </td>
                  </>
                )}
                <td>
                  <input type="checkbox" checked={t.bought} disabled />
                </td>
                <td>
                  <Money amount={t.amount} />
                </td>
                <td>{t.link ? <Link href={t.link}>{t.name}</Link> : t.name}</td>
                {showCategory && <td>{t.category}</td>}
                {showStore && <td>{t.store}</td>}
                <td className="max-w-prose whitespace-pre-line">{t.notes}</td>
              </tr>
            ))}
            {tg.hasIncome && (
              <tr>
                <td className="py-2"></td>
                <td className="border-r-2 py-2">
                  <Money
                    amount={tg.transactions.reduce(
                      (sum, { cost }) => sum + cost,
                      0
                    )}
                  />
                </td>
                <td className="py-2"></td>
                <td className="py-2"></td>
                <td className="py-2">Month Total Spending</td>
              </tr>
            )}
            <tr>
              <td className="py-2"></td>
              <td className="border-r-2 py-2">
                <Money amount={runningAmountTotalsAfterMonths[tg.month]} />
              </td>
              <td className="py-2"></td>
              <td className="py-2"></td>
              <td className="py-2">Running Total Balance</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  )
}

export default TransactionTable
