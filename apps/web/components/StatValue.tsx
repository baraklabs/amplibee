/** A stat value. A leading "+" is shown as a green up arrow instead, so "+17" reads as 17 up. */
export function StatValue({ value }: { value: string }) {
  if (!value.startsWith('+')) return <>{value}</>
  return (
    <>
      <svg className="stat-up" viewBox="0 0 12 12" width="0.6em" height="0.6em" aria-hidden="true">
        <path d="M6 1.5 11 10H1z" fill="currentColor" />
      </svg>
      <span className="sr-only">up </span>
      {value.slice(1)}
    </>
  )
}
