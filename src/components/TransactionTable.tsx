import React, { useMemo } from "react"

import formatDate from "date-fns/format"
import parseDate from "date-fns/parse"
import Link from "next/link"

import RunningTotalMode from "@my-types/RunningTotalMode"
import Transaction from "@my-types/Transaction"

import Money from "./Money"

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
    this.transactions = []

    transactions.forEach((t) => {
      this.addTransaction(t)
    })
  }

  addTransaction(t: Transaction) {
    if (t.month !== this.month) {
      throw new Error(
        `Transaction month ${t.month} does not match TransactionGrouping month ${this.month}!`
      )
    }
    this.transactions.push(t)

    this.transactions.sort((a, b) => {
      const boughtA = a.bought || false
      const boughtB = b.bought || false

      if (boughtA != boughtB) {
        return boughtA ? -1 : 1
      }

      const priorityA = a.priority || 0
      const priorityB = b.priority || 0
      if (priorityA != priorityB) {
        return priorityB - priorityA
      }
      return a.amount - b.amount
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
      transactionGroupingssByMonth.get(t.month).addTransaction(t)
    }
  })
  const keys = [...transactionGroupingssByMonth.keys()]
  keys.sort()
  return keys.map((k) => transactionGroupingssByMonth.get(k))
}

const monthTotal = (
  month: TransactionGrouping,
  {
    mode = "expected",
  }: {
    mode: RunningTotalMode
  }
) => {
  if (mode === "expected") {
    return month.totalPlannedAmount
  }
  if (mode === "spent") {
    return month.totalSpentAmount
  }
  throw new Error(`Unexpected total mode: ${mode}`)
}

const calculateRunningTotalAmounts = (
  transactionGroups: TransactionGrouping[],
  monthlyBudget: number,
  {
    mode = "expected",
  }: {
    mode: RunningTotalMode
  }
): Record<string, number> =>
  transactionGroups.reduce((records, currentMonth, index) => {
    const lastMonth = transactionGroups[index - 1]?.month
    const lastTotal = lastMonth ? records[lastMonth] : 0
    return {
      ...records,
      [currentMonth.month]:
        lastTotal + monthlyBudget + monthTotal(currentMonth, { mode }),
    }
  }, {})

const TransactionTable = ({
  transactions,
  showCategory = false,
  showStore = false,
  hideMonthsBefore = "2023-04",
  monthlyBudget = 30,
  runningTotalMode = "expected",
}: {
  transactions: Transaction[]
  showCategory?: boolean
  showStore?: boolean
  monthlyBudget?: number
  hideMonthsBefore?: string
  runningTotalMode?: RunningTotalMode
}) => {
  const transactionGroups = useMemo(
    () => groupByMonth(transactions),
    [transactions]
  )

  const runningAmountTotalsAfterMonths = useMemo(
    () =>
      calculateRunningTotalAmounts(transactionGroups, monthlyBudget, {
        mode: runningTotalMode,
      }),
    [transactionGroups, monthlyBudget, runningTotalMode]
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
        {transactionGroups
          .filter((tg) => {
            if (hideMonthsBefore) {
              return tg.month >= hideMonthsBefore
            }
            return true
          })
          .map((tg) => (
            <TransactionTableGroup
              key={tg.month}
              tg={tg}
              runningAmountTotal={runningAmountTotalsAfterMonths[tg.month]}
              showCategory={showCategory}
              showStore={showStore}
            />
          ))}
      </tbody>
    </table>
  )
}

const TransactionTableGroup = ({
  tg,
  runningAmountTotal,
  showCategory,
  showStore,
}: {
  tg: TransactionGrouping
  runningAmountTotal: number
  showCategory: boolean
  showStore: boolean
}) => (
  <React.Fragment key={tg.month}>
    {tg.transactions.map((t, index) => (
      <tr
        key={t.id}
        className={`${index === 0 && "border-t-2"} ${
          t.amount > 0 && "is-income"
        }`}
      >
        {index === 0 && (
          <>
            <td className="bg-transparent" rowSpan={tg.transactions.length}>
              {formatMonth(tg.month)}
            </td>
            <td
              rowSpan={tg.transactions.length}
              className="border-r-2 bg-transparent"
            >
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
            amount={tg.transactions.reduce((sum, { cost }) => sum + cost, 0)}
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
        <Money amount={runningAmountTotal} />
      </td>
      <td className="py-2"></td>
      <td className="py-2"></td>
      <td className="py-2">Running Total Balance</td>
    </tr>
  </React.Fragment>
)

export default TransactionTable
