

export function reorder<T>(list: T[], from: number, to: number): T[] {
    const result = [...list]
    const [removed] = result.splice(from, 1)
    result.splice(to, 0, removed);
    return result
}


export const idsMatch = (a: string[], b: string[]) =>
  a.join(",") === b.join(",");


export function reorderById<T extends { _id: string }>(
  items: T[],
  ids: string[],
): T[] {

    return ids  
        .map((id) => items.find((item) => item._id === id))
        .filter((item): item is T => item !== undefined)
        
}