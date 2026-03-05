import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Space } from "../lib/types";


export function useActiveNavigation (spaces: Space[]) {
    const pathname = usePathname()

    // /lists/abc123 -> "abc123"
    const activeListId = pathname.match(/\/lists\/([^/]+)/)?.[1] ?? null 

    const activeSpaceId = useMemo(() => {
        if (!activeListId) return null

        return (
            spaces.find((s) => s.lists.some((l) => l._id === activeListId ))?._id ?? null
        )
    }, [activeListId, spaces])

    return {
        activeListId,
        activeSpaceId
    }
}