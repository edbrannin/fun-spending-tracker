import React from "react"

import Head from "next/head"
import Link from "next/link"
import useSWR from "swr"

import Debug from "@components/Debug"
import TransactionTable from "@components/TransactionTable"

const fetcher = (...args) => fetch(...args).then((res) => res.json())

export default function Home() {
  const { data: transactions, error: transactionError } = useSWR(
    "/api/transactions",
    fetcher
  )

  return (
    <div>
      <Head>
        <title>Next.js advanced start template.</title>

        <meta
          name="description"
          content="Use tailwind css, eslint, prettier & absolute imports instantly.
            Easily extendable zero-config template for pros and beginners."
        />

        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen justify-center bg-gradient-to-b from-gray-50 via-gray-50 to-gray-100 py-20">
        <div>
          <h1 className="mb-4 px-5 text-center text-4xl font-bold leading-tight tracking-tight sm:mt-4 sm:text-6xl">
            Fun Spending Tracker
          </h1>

          {transactionError && (
            <Debug name="Transaction Error" value={transactionError} />
          )}
          <TransactionTable transactions={transactions} />

          <h2 className="mx-auto mt-8 max-w-4xl px-10 text-center text-base tracking-tight text-gray-600 sm:text-2xl md:mt-5 md:text-2xl">
            Tailwind CSS 3.0, ESLint & Prettier without a single line of config!
            Easily extendable zero-config template for pros and beginners.
            <Link href="https://github.com/agcty/nextjs-advanced-starter">
              <a
                type="button"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-4 font-medium leading-6 text-white transition duration-150 ease-in-out hover:bg-blue-500 focus:border-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-400 active:bg-blue-700 sm:px-10"
              >
                Copy Template from GitHub
              </a>
            </Link>
          </h2>

          <div className="px-4 sm:px-0">
            <p className="mt-6 text-center text-xs font-medium text-gray-600">
              Built by{" "}
              <a
                className="font-medium text-blue-600 transition duration-150 ease-in-out hover:text-blue-500 focus:underline focus:outline-none"
                href="https://twitter.com/edbrannin"
              >
                @edbrannin
              </a>
            </p>
          </div>
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