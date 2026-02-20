"use client";

import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMutation as useConvexMutation } from "convex/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React, { useState } from "react";
import { MANAGE_TYPES, WORKSPACE_TYPES } from "../lib/utils";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { api } from "../../../../convex/_generated/api";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";

const OnboardingWizard = () => {
  const { user, refreshAuth } = useAuth({ ensureSignedIn: true });

  const [step, setStep] = useState(1);
  const [workspaceType, setWorkspaceType] = useState<string | null>(null);
  const [manageType, setManageType] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const startOnboarding = useConvexMutation(api.onboarding.startOnboarding)
  const createOrganization = useMutation(
    trpc.organization.createOrganization.mutationOptions({
      onSuccess: async (organization) => {
        await  queryClient.invalidateQueries()

        await startOnboarding({
          organizationId: organization.id,
          workspaceType: workspaceType || "unknown",
          manageType: manageType || "unknown"
        })

        await refreshAuth({
          organizationId: organization.id
        })


        window.location.reload()
      },

      onError: async (error) => {
        toast.error(error.message)
        setIsLoading(false)
      }

    })
  )

  const handleSumbit = () => {
    setIsLoading(true)
    createOrganization.mutate({
      name: workspaceName
    })
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleNext = () => {
    if (step === 1 && !workspaceType) return;
    if (step == 2 && !manageType) return;
    setStep((prev) => prev + 1);
  };

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/30 font-sans">
      <header className="flex items-center justify-between p-6 sm:px-10 h-20">
        <div className="flex items-center gap-3">
          <Image src={"/logo.svg"} alt="Logo" width={24} height={32} />
          <span className="font-bold text-xl tracking-tight">Clickup</span>
        </div>

        <div className="text-sm font-medium text-muted-foreground">
          Welcome,{" "}
          <span className="text-foreground">
            {user?.firstName} {user?.lastName}
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
        <div className="w-full max-w-5xl relative z-10">
          {step === 1 && (
            <div className="animate-in fade-in zoom-in-95 duration-700 text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-12 tracking-tight">
                What will you use this Workspace for?
              </h1>

              <div className="flex flex-wrap justify-center gap-6">
                {WORKSPACE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={cn(
                      "px-10 py-4 rounded-full text-lg font-medium transition-all duration-200",
                      "bg-secondary/20 border border-border hover:bg-secondary/40",
                      workspaceType === type.id &&
                        "bg-secondary border-muted-foreground/50",
                    )}
                    disabled={isLoading}
                    onClick={() => {
                      setWorkspaceType(type.id);
                      setTimeout(() => setStep(2), 400);
                    }}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in zoom-in-95 duration-700 text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-12 tracking-tight">
                What would you like to manage?
              </h1>

              <div className="flex flex-wrap justify-center gap-6">
                {MANAGE_TYPES.map((type) => (
                  <button
                    key={type.id}
                    className={cn(
                      "px-10 py-4 rounded-full text-lg font-medium transition-all duration-200",
                      "bg-secondary/20 border border-border hover:bg-secondary/40",
                      manageType === type.id &&
                        "bg-secondary border-muted-foreground/50",
                    )}
                    disabled={isLoading}
                    onClick={() => setManageType(type.id)}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in zoom-in-95 duration-700 text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl font-bold mb-12 tracking-tight">
                Name your workspace
              </h1>

              <form onSubmit={handleSumbit} className="mt-16 space-y-10">
                <Input
                  placeholder="e.g Acme Inc."
                  value={workspaceName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setWorkspaceName(e.target.value)
                  }
                  className="h-14 text-xl px-6 rounded-xl text-center sm:text-left"
                  disabled={isLoading}
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>
      </main>

      <footer className="p-6 sm:px-10 flex flex-col gap-8 bg-background">
        <div className="w-full bg-secondary/50 h-0.75 rounded-full overflow-hidden">
          <div
            className={`bg-foreground h-full transition-all duration-1000 ease-out 
            shadow-[0_0_15px_rgba(255,255,255,0.2)] dark:shadow-[0_0_15px_rgba(255,255,255,0.4)]`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between h-16 max-w-7xl mx-auto w-full">
          <div>
            {step > 1 && (
              <Button
                variant={"outline"}
                size={"lg"}
                onClick={handleBack}
                className="px-8"
                disabled={isLoading}
              >
                <ArrowLeft />
                <span>Back</span>
              </Button>
            )}
          </div>


          <div className="flex gap-4">
             {step === 2 && (
               <Button
                variant={"outline"}
                size={"lg"}
                onClick={handleNext}
                className="px-8"
                disabled={isLoading || !manageType}
              >
                <span>Next</span>
                <ArrowRight />
              </Button>
             )}

             {step === 3 && (
               <Button
                variant={"outline"}
                size={"lg"}
                onClick={handleSumbit}
                className="px-8"
                disabled={isLoading || !workspaceName.trim()}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin"/>
                ) : (
                  <>
                    <span>Finish</span>
                    <Check />
                  </>
                )}
              </Button>
             )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OnboardingWizard;
