"use client";

import React, { useState } from "react";
import { Doc } from "../../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useSpaces } from "../../../hooks/use-spaces";
import { Draggable } from "@hello-pangea/dnd";
import SecondarySidebarItem from "./secondary-sidebar-item";
import { cn } from "@/lib/utils";
import { ListChecks } from "lucide-react";
import ItemMenu from "./item-menu";
import ListDialog from "./list-dialog";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";

interface Props {
  list: Doc<"lists">;
  index: number;
  active: boolean;
}

const ListItem = ({ list, index, active }: Props) => {
  const router = useRouter();
  const { spaces, deleteList } = useSpaces();

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleSelect = () => {
    router.push(`/dashboard/lists/${list._id}`);
  };

  return (
    <>
      <Draggable draggableId={list._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <SecondarySidebarItem
              label={list.name}
              active={active}
              onClick={handleSelect}
              className={cn(
                "cursor-pointer",
                snapshot.isDragging && "bg-muted opacity-80",
              )}
              leading={<ListChecks className="size-4" />}
              actions={
                <ItemMenu
                  onRename={() => setEditOpen(true)}
                  onDelete={() => setDeleteOpen(true)}
                />
              }
            />
          </div>
        )}
      </Draggable>

      <ListDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        spaces={spaces}
        mode="edit"
        listId={list._id}
        initialValues={{ name: list.name, spaceId: list.spaceId }}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete list"
        description="This will permanently delete this list and all its tasks. This action cannot be undone."
        onConfirm={async () => {
          await deleteList(list._id);
          setDeleteOpen(false);
        }}
      />
    </>
  );
};

export default ListItem;
