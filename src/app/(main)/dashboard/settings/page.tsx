import GeneralSettings from "@/features/general/components/general-settings";
import React from "react";

const page = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">General Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings and preferences.
        </p>
      </div>

      <GeneralSettings />
    </div>
  );
};

export default page;
