const Debug = ({ name, value, indent = 2 }) => (
  <div>
    <h2>{name}</h2>
    <code>
      <pre>{JSON.stringify(value, null, indent)}</pre>
    </code>
  </div>
)

export default Debug
