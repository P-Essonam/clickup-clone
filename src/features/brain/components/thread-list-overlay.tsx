import { useMutation, usePaginatedQuery, useAction } from "convex/react";
import { ArrowLeft, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAskAIStore } from "../hooks/use-ask-ai-store";
import { api } from "../../../../convex/_generated/api";
import { PER_PAGE } from "@/lib/constants";
import InfiniteScroll from "@/components/infinite-scroll";
import DeleteConfirmDialog from "@/components/delete-confirm-dialog";

const ThreadListOverlay = () => {
  const {
    recentThreadsOpen,
    closeRecentThreads,
    currentThreadId,
    setThreadId,
  } = useAskAIStore();

  const setCurrentThreadMutation = useMutation(api.brain.setCurrentThread);
  const renameThreadMutation = useAction(api.brain.renameThread);
  const deleteThreadMutation = useMutation(api.brain.deleteThread);
  const threadsQuery = usePaginatedQuery(
    api.brain.listThreads,
    {},
    { initialNumItems: PER_PAGE },
  );

  const [editingThreadId, setEditingThreadId] = useState<string | null>(null);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingThreadId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingThreadId]);

  const handleSelectThread = async (threadId: string) => {
    if (editingThreadId === threadId) return;
    try {
      await setCurrentThreadMutation({ threadId });
      setThreadId(threadId);
      closeRecentThreads();
    } catch (error) {
      toast.error("Failed to switch conversation");
    }
  };

  const handleRenameThread = (threadId: string, currentTitle: string) => {
    setEditingThreadId(threadId);
    setEditValue(currentTitle);
  };

  const handleSaveRename = async (threadId: string) => {
    const title = editValue.trim();
    if (!title) {
      setEditingThreadId(null);
      return;
    }

    try {
      await renameThreadMutation({ threadId, title });
      setEditingThreadId(null);
    } catch (error) {
      toast.error("Failed to rename conversation");
    }
  };

  const handleCancelRename = () => {
    setEditingThreadId(null);
    setEditValue("");
  };

  const confirmDelete = async () => {
    if (!threadToDelete) return;

    try {
      await deleteThreadMutation({ threadId: threadToDelete });
      if (currentThreadId === threadToDelete) {
        setThreadId(null);
      }

      setThreadToDelete(null);
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  if (!recentThreadsOpen) return null;

  return (
    <div className="absolute inset-0 z-10 bg-background rounded-lg flex flex-col">
      <div className="flex shrink-0 items-center gap-2 border-b px-4 py-3">
        <Button
          variant={"ghost"}
          size={"icon"}
          className="size-8"
          onClick={closeRecentThreads}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <h3 className="font-semibold text-sm">All chats</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {threadsQuery.results.length === 0 &&
        threadsQuery.status === "Exhausted" ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            No conversations yet
          </p>
        ) : (
          <div className="space-y-1">
            {threadsQuery.results.map((thread) => {
              const isEditing = editingThreadId === thread._id;
              const displayTitle = thread.title || thread.summary || "New chat";

              return (
                <div
                  key={thread._id}
                  className="group flex items-center h-10 px-3 rounded-md text-sm transition-colors hover:bg-accent"
                >
                  {isEditing ? (
                    <input
                      ref={inputRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleCancelRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSaveRename(thread._id);
                        } else if (e.key === "Escape") {
                          handleCancelRename();
                        }
                      }}
                      className="h-8 flex-1 bg-transparent outline-none px-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <button
                        className="flex-1 text-left"
                        onClick={() => handleSelectThread(thread._id)}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium truncate">
                            {displayTitle}
                          </span>
                        </div>
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem
                            onSelect={() =>
                              handleRenameThread(thread._id, displayTitle)
                            }
                          >
                            <Pencil className="size-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setThreadToDelete(thread._id)}
                          >
                            <Trash2 className="size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              );
            })}

            <InfiniteScroll
              status={threadsQuery.status}
              isLoading={threadsQuery.isLoading}
              loadMore={threadsQuery.loadMore}
              numItems={PER_PAGE}
            />
          </div>
        )}
      </div>

      <DeleteConfirmDialog
        open={!!threadToDelete}
        onOpenChange={(open) => !open && setThreadToDelete(null)}
        title="Delete conversation"
        description="Are you sure you want to delete this conversation? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default ThreadListOverlay;
