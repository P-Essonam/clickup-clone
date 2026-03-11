import { withAuth } from "@workos-inc/authkit-nextjs";
import React from "react";
import { preloadQuery } from "convex/nextjs";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import ListPageHeader from "@/features/lists/components/list-page-header";

interface Props {
  children: React.ReactNode;
  params: Promise<{
    listId: string;
  }>;
}

const layout = async ({ children, params }: Props) => {
  const { listId } = await params;
  const { accessToken } = await withAuth({ ensureSignedIn: true });

  const preloadedGetListWithSpace = await preloadQuery(
    api.lists.getListWithSpace,
    { listId: listId as Id<"lists"> },
    { token: accessToken },
  );

  return (
    <div className="flex h-full flex-col">
      <ListPageHeader preloadedGetListWithSpace={preloadedGetListWithSpace} />
      {children}
    </div>
  );
};

export default layout;
