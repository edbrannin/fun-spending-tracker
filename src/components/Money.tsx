export const formatMoney = (amount: number, currency = "USD") =>
  amount.toLocaleString("en-US", { style: "currency", currency })

const Money = ({ amount, currency = "USD" }) => (
  <span className="font-mono">{formatMoney(amount || 0, currency)}</span>
)

export default Money
