import Airtable from "airtable"

import Transaction from "@my-types/Transaction"

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(
  "appLs2g5V4ZowwOJ9"
)

const getAllTransactions = async () => {
  const records = await base("Spending")
    .select({
      view: "Planned By Month",
    })
    .all()
  return records.map(
    (record): Transaction => ({
      id: record.id,
      name: record.get("Name") as string,
      amount: record.get("Amount") as number,
      cost: (record.get("Cost") as number) || 0,
      income: (record.get("Income") as number) || 0,
      month: record.get("Month") as string,
      store: record.get("Store") as string,
      category: record.get("Category") as string,
      notes: record.get("Notes") as string,
      bought: record.get("Bought") as boolean,
      link: record.get("Link") as string,
    })
  )
}

export default async function handler(req, res) {
  res.status(200).json(await getAllTransactions())
}
