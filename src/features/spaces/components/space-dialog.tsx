"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Id } from "../../../../convex/_generated/dataModel";
import { SpaceFormValues } from "../lib/types";
import { useSpaces } from "../../../hooks/use-spaces";
import { toast } from "sonner";
import IconPicker, { getIcon } from "@/components/icon-picker";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: SpaceFormValues;
  mode: "create" | "edit";
  spaceId?: Id<"spaces">;
}

const DEFAULT_ICON = "Layers";
const DEFAULT_COLOR = "bg-indigo-500";

const SpaceDialog = ({
  open,
  onOpenChange,
  initialValues,
  mode = "create",
  spaceId,
}: Props) => {
  const { createSpaceWithDefaults, updateSpace } = useSpaces();

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedIcon, setSelectedIcon] = React.useState(DEFAULT_ICON);
  const [selectedColor, setSelectedColor] = React.useState(DEFAULT_COLOR);
  const [showIconPicker, setShowIconPicker] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isEdit = mode === "edit";

  React.useEffect(() => {
    if (open) {
      setName(initialValues?.name ?? "");
      setDescription(initialValues?.description ?? "");
      setSelectedIcon(initialValues?.icon ?? DEFAULT_ICON);
      setSelectedColor(initialValues?.color ?? DEFAULT_COLOR);
      setShowIconPicker(false);
    }
  }, [open, initialValues]);

  const canSubmit = !!name.trim() && !isSubmitting;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit || (isEdit && !spaceId)) return;

    setIsSubmitting(true);
    try {
      const payload: SpaceFormValues = {
        name: name.trim(),
        description: description.trim(),
        icon: selectedIcon,
        color: selectedColor,
      };

      isEdit
        ? await updateSpace(spaceId!, payload)
        : await createSpaceWithDefaults(payload);

      onOpenChange(false);
    } catch (error) {
      toast.error(isEdit ? "Failed to update space" : "Failed to create space");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleReset = () => {
    setSelectedIcon(DEFAULT_ICON);
    setSelectedColor(DEFAULT_COLOR);
  };

  const SelectedIconComponent = getIcon(selectedIcon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Space" : "Create a Space"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update your space name, icon, color, and description."
              : "A Space represents teams, departments, or groups."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Icon & name
            </Label>
            <div className="flex items-center gap-3">
              <Popover open={showIconPicker} onOpenChange={setShowIconPicker}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg text-white transition-colors",
                      selectedColor,
                    )}
                  >
                    <SelectedIconComponent className="size-5" />
                  </button>
                </PopoverTrigger>

                <PopoverContent
                  align="start"
                  side="bottom"
                  sideOffset={8}
                  className="w-full max-w-md p-0"
                  onWheelCapture={(e) => e.stopPropagation()}
                  onTouchMoveCapture={(e) => e.stopPropagation()}
                >
                  <IconPicker
                    icon={selectedIcon}
                    color={selectedColor}
                    onIconChange={setSelectedIcon}
                    onColorChange={setSelectedColor}
                    onReset={handleReset}
                  />
                </PopoverContent>
              </Popover>

              <Input
                id="space-name"
                placeholder="e.g. Marketing, Engineering, HR"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="space-description"
              className="text-sm text-muted-foreground"
            >
              Description{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="space-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit} size="lg">
              {isSubmitting
                ? isEdit
                  ? "Saving…"
                  : "Creating…"
                : isEdit
                  ? "Save"
                  : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SpaceDialog;
