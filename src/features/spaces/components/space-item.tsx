"use client";

import React, { useState } from "react";
import { Space } from "../lib/types";
import { getIcon } from "@/components/icon-picker";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import SecondarySidebarItem from "./secondary-sidebar-item";
import { cn } from "@/lib/utils";
import { ChevronRight, Plus } from "lucide-react";
import ItemMenu from "./item-menu";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import ListItem from "./list-item";
import SpaceDialog from "./space-dialog";
import ListDialog from "./list-dialog";
import { useSpaces } from "../hooks/use-spaces";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";

interface SpaceItemProps {
  space: Space;
  index: number;
  isDragged: boolean;
  isDraggingList: boolean;
  activeSpaceId: string | null;
  activeListId: string | null;
  onToggle: () => void;
}

const SpaceItem = ({
  space,
  index,
  isDragged,
  isDraggingList,
  activeSpaceId,
  activeListId,
  onToggle,
}: SpaceItemProps) => {
  const { spaces, deleteSpace } = useSpaces();
  const [editSpaceOpen, setEditSpaceOpen] = useState(false);
  const [createListOpen, setCreateListOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const isOpen = space.isOpen ?? true;
  const isActiveSpace = activeSpaceId === space._id;
  const SpaceIcon = getIcon(space.icon);

  return (
    <>
      <Draggable draggableId={space._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className="flex flex-col"
          >
            <div {...provided.dragHandleProps}>
              <SecondarySidebarItem
                label={space.name}
                onClick={onToggle}
                className={cn(
                  "cursor-pointer text-foreground",
                  snapshot.isDragging && "bg-muted opacity-80",
                )}
                leading={
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex size-6 items-center justify-center rounded-md text-white",
                        space.color,
                      )}
                    >
                      <SpaceIcon className="size-4" />
                    </span>
                    <ChevronRight
                      className={cn(
                        "size-4 text-muted-foreground transition-transform",
                        isOpen && !snapshot.isDragging && "rotate-90",
                      )}
                    />
                  </div>
                }
                actions={
                  <div className="flex items-center gap-1">
                    <ItemMenu
                      onRename={() => setEditSpaceOpen(true)}
                      onDelete={() => setDeleteOpen(true)}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCreateListOpen(true);
                      }}
                      aria-label="Add list"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                }
              />
            </div>

            {!isDragged && (
              <Droppable droppableId={space._id} type="LIST">
                {(droppableProvided, droppableSnapshot) => (
                  <div
                    ref={droppableProvided.innerRef}
                    {...droppableProvided.droppableProps}
                    className={cn(
                      "ml-4 flex flex-col border-l border-border pl-2",
                    )}
                  >
                    <Collapsible open={isOpen}>
                      <CollapsibleContent className="ml-4 flex flex-col border-l border-border pl-2">
                        {space.lists.map((list, listIndex) => (
                          <ListItem
                            key={list._id}
                            list={list}
                            index={listIndex}
                            active={isActiveSpace && activeListId === list._id}
                          />
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                    {droppableProvided.placeholder}
                  </div>
                )}
              </Droppable>
            )}
          </div>
        )}
      </Draggable>

      <SpaceDialog
        open={editSpaceOpen}
        onOpenChange={setEditSpaceOpen}
        mode="edit"
        spaceId={space._id}
        initialValues={{
          name: space.name,
          description: space.description ?? "",
          icon: space.icon,
          color: space.color,
        }}
      />

      <ListDialog
        open={createListOpen}
        onOpenChange={setCreateListOpen}
        spaces={spaces}
        defaultSpaceId={space._id}
        mode="create"
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete space"
        description="This will permanently delete this space and all its lists and tasks. This action cannot be undone."
        onConfirm={async () => {
          await deleteSpace(space._id);
          setDeleteOpen(false);
        }}
      />
    </>
  );
};

export default SpaceItem;
