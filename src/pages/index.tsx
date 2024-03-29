import React, { useMemo, useState } from "react"

import { format, subDays } from "date-fns"
import Head from "next/head"
import useSWR from "swr"

import Debug from "@components/Debug"
import Select from "@components/Select"
import TransactionTable from "@components/TransactionTable"
import RunningTotalMode from "@my-types/RunningTotalMode"
import Transaction from "@my-types/Transaction"

const fetcher = (a: RequestInfo | URL, b: RequestInit) =>
  fetch(a, b).then((res) => res.json())

const getTransactionMonths = (transactions: Transaction[]): string[] => {
  if (!transactions) {
    return []
  }
  const months = transactions.map((t) =>
    t.month?.substring(0, "2020-02".length)
  )
  const result = new Set<string>(months)
  return [...result].sort()
}

const getLastMonth = () => format(subDays(new Date(), 30), "yyyy-MM")

export default function Home() {
  const { data: transactions, error: transactionError } = useSWR(
    "/api/transactions",
    fetcher
  )

  const [runningTotalMode, setRunningTotalMode] = useState(
    "expected" as RunningTotalMode
  )

  const allMonths = useMemo(
    () => getTransactionMonths(transactions),
    [transactions]
  )

  const [hideMonthsBefore, setHideMonthsBefore] = useState(() => getLastMonth())

  return (
    <div>
      <Head>
        <title>Fun Spending Tracker</title>

        <meta name="description" content="Discretionary Spending budget" />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen justify-center py-20">
        <div>
          <h1 className="mb-4 px-5 text-center text-4xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-6xl">
            Fun Spending Tracker
          </h1>

          <div className="flex flex-row justify-evenly">
            <Select<RunningTotalMode>
              label="Mode"
              onChange={setRunningTotalMode}
              options={["spent", "expected"]}
              value={runningTotalMode}
              defaultValue={"spent"}
            />
            <Select<string>
              label="Hide Months Before"
              onChange={setHideMonthsBefore}
              options={allMonths}
              value={hideMonthsBefore}
            />
          </div>

          {transactionError && (
            <Debug name="Transaction Error" value={transactionError} />
          )}
          <TransactionTable
            transactions={transactions}
            runningTotalMode={runningTotalMode}
            hideMonthsBefore={hideMonthsBefore}
          />
        </div>
      </main>
    </div>
  )
}

interface FeatureListProps {
  children: React.ReactNode
}

function FeatureList({ children }: FeatureListProps) {
  return <ul className="space-y-5 px-12 py-12">{children}</ul>
}

function Feature({ children, main }) {
  return (
    <li className="flex items-center">
      <CheckIcon className="hiddden hidden h-5 w-5 flex-shrink-0 rounded-full bg-blue-600 p-1 text-gray-100 sm:inline" />
      <p className="ml-3 hidden text-lg text-gray-600 sm:inline">{children}</p>

      <p className="mx-auto sm:hidden">
        <InfoText text={main} />
      </p>
    </li>
  )
}

function InfoText({ text }) {
  return (
    <span className="inline-flex items-center rounded-md bg-gray-100 px-3 py-2 font-medium text-gray-700">
      <CheckIcon className="mr-3 inline-flex h-5 w-5 flex-shrink-0 rounded-full bg-blue-600 p-1 text-gray-100 sm:hidden" />
      {text}
    </span>
  )
}

function CheckIcon(props) {
  return (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    </svg>
  )
}
