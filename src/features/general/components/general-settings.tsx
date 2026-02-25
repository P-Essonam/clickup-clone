"use client";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccessToken } from "@workos-inc/authkit-nextjs/components";
import { useCallback, useEffect, useState } from "react";
import { NAME_MAX_LENGTH } from "../lib/constants";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UserSecurity, UserSessions, WorkOsWidgets } from "@workos-inc/widgets";

const GeneralSettings = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { accessToken, loading: tokenLoading } = useAccessToken();

  const { data, isLoading } = useQuery(
    trpc.organization.getOrganization.queryOptions(),
  );
  const [name, setName] = useState("");
  const [savedName, setSaveName] = useState("");

  useEffect(() => {
    if (data?.name && !savedName) {
      setName(data.name);
      setSaveName(data.name);
    }
  }, [data?.name, savedName]);

  const updateOrganization = useMutation(
    trpc.organization.updateOrganizationName.mutationOptions({
      onSuccess: async (_data, variables) => {
        await queryClient.invalidateQueries();
        setName(variables.name);
        setSaveName(variables.name);
        toast.success("Organization updated");
      },
      onError: (e) => {
        toast.error(e.message);
      },
    }),
  );

  const trimmedName = name.trim();
  const canSave =
    trimmedName.length > 0 &&
    trimmedName.length <= NAME_MAX_LENGTH &&
    trimmedName !== savedName &&
    !updateOrganization.isPending;

  const getAuthToken = useCallback(
    async () => accessToken ?? "",
    [accessToken],
  );

  const widgetsReady = !tokenLoading && !!accessToken;

  return (
    <div className="space-y-8 relative">
      <section className="rounded-lg border border-border/60 bg-background">
        <div className="space-y-4 p-4">
          <div>
            <h2 className="font-semibold text-sm">Organization</h2>
            <p className="text-sm text-muted-foreground">
              Update your organization name and details.
            </p>
          </div>
          {isLoading ? (
            <Skeleton className="h-9 w-full max-w-sm" />
          ) : (
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organization name"
              maxLength={NAME_MAX_LENGTH}
              className="max-w-sm"
            />
          )}
        </div>
        <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Please use {NAME_MAX_LENGTH} characters at maximum.
          </span>
          <Button
            onClick={() => updateOrganization.mutate({ name: name.trim() })}
            disabled={!canSave}
          >
            Save
          </Button>
        </div>
      </section>

      <WorkOsWidgets>
        <section className="rounded-lg border border-border/60 bg-background p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Security</h2>
              <p className="text-sm text-muted-foreground">
                Manage your password and multi-factor authentication.
              </p>
            </div>
            <div className="w-full lg:max-w-lg">
              {widgetsReady ? (
                <UserSecurity authToken={getAuthToken} />
              ) : (
                <Skeleton className="h-24 w-full" />
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border/60 bg-background p-4 mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Sessions</h2>
              <p className="text-sm text-muted-foreground">
                Review active sessions across your devices.
              </p>
            </div>
            <div className="w-full lg:max-w-lg">
              {widgetsReady ? (
                <UserSessions authToken={getAuthToken} />
              ) : (
                <Skeleton className="h-24 w-full" />
              )}
            </div>
          </div>
        </section>
      </WorkOsWidgets>
    </div>
  );
};

export default GeneralSettings;
