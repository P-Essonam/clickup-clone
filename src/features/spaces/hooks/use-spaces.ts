import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { useEffect, useMemo, useState } from "react";
import { Id } from "../../../../convex/_generated/dataModel";

export function useSpaces() {
  const router = useRouter();

  const spacesData = useQuery(api.spaces.listWithLists);

  const [openSpaces, setOpenSpaces] = useState<Set<string>>(() => new Set());
  const [hasInitializedOpenSpaces, setHasInitializedOpenSpaces] =
    useState(false);

  const createSpaceMutation = useMutation(api.spaces.create);
  const updateSpaceMutation = useMutation(api.spaces.update);
  const removeSpaceMutation = useMutation(api.spaces.remove);
  const reorderSpacesMutation = useMutation(api.spaces.reorder);

  const createListMutation = useMutation(api.lists.create);
  const updateListMutation = useMutation(api.lists.update);
  const removeListMutation = useMutation(api.lists.remove);
  const reorderListsMutation = useMutation(api.lists.reorder);

  const createTaskMutation = useMutation(api.tasks.create);

  const spaces = useMemo(() => {
    if (!spacesData) return [];

    return spacesData.map((space) => ({
      ...space,
      isOpen: hasInitializedOpenSpaces ? openSpaces.has(space._id) : true,
    }));
  }, [spacesData, openSpaces, hasInitializedOpenSpaces]);

  useEffect(() => {
    if (spacesData && !hasInitializedOpenSpaces) {
      setOpenSpaces(new Set(spacesData.map((s) => s._id)));
      setHasInitializedOpenSpaces(true);
    }
  }, [spacesData, hasInitializedOpenSpaces]);

  const isLoading = spacesData === undefined;

  const toggleSpace = (spaceId: Id<"spaces">) => {
    setOpenSpaces((prev) => {
      const next = new Set(prev);
      if (next.has(spaceId)) {
        next.delete(spaceId);
      } else {
        next.add(spaceId);
      }
      return next;
    });
  };

  const createSpaceWithDefaults = async (values: {
    name: string;
    description?: string;
    color: string;
    icon: string;
  }) => {
    const spaceId = await createSpaceMutation({
      name: values.name,
      description: values.description,
      color: values.color,
      icon: values.icon,
    });

    const listId = await createListMutation({
      spaceId,
      name: "List",
    });

    await createTaskMutation({
      listId,
      title: "My default task",
      status: "todo",
    });

    setOpenSpaces((prev) => new Set([...prev, spaceId]));

    router.push(`/dashboard/lists/${listId}`);
  };

  const updateSpace = async (
    id: Id<"spaces">,
    values: { name: string; description?: string; color: string; icon: string },
  ) => {
    await updateSpaceMutation({ id, ...values });
  };

  const deleteSpace = async (id: Id<"spaces">) => {
    await removeSpaceMutation({ id });
    setOpenSpaces((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const createList = async (spaceId: Id<"spaces">, name: string) => {
    await createListMutation({ spaceId, name });
  };

  const updateList = async (
    id: Id<"lists">,
    values: { name: string; spaceId: Id<"spaces"> },
  ) => {
    await updateListMutation({ id, ...values });
  };

  const deleteList = async (id: Id<"lists">) => {
    await removeListMutation({ id });
  };

  return {
    spaces,
    isLoading,
    toggleSpace,
    createSpaceWithDefaults,
    updateSpace,
    deleteSpace,
    createList,
    updateList,
    deleteList,
  };
}
