/**
 * A response can acknowledge only the snapshot that created its request.
 * Keeping this predicate outside the React component makes the race rule
 * directly testable without a browser or a network connection.
 */
export function isSaveSnapshotCurrent(requestSequence: number, currentSequence: number): boolean {
  return requestSequence === currentSequence;
}
