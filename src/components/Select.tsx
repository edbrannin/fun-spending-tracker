type SelectProps<T> = {
  label: string
  value: T
  defaultValue?: T
  options: T[]
  onChange: (val: T) => void
}

const Select = <T extends string | number>({
  label,
  value,
  defaultValue,
  options,
  onChange,
}: SelectProps<T>) => (
  <div>
    {label}:{" "}
    <select value={value} onChange={(e) => onChange(e.target.value as T)}>
      {options.map((option) => (
        <option key={option} defaultChecked={defaultValue === option}>
          {option}
        </option>
      ))}
    </select>
  </div>
)

export default Select
