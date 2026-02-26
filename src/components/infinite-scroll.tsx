"use client";

import { useIntersectionOberser } from "@/hooks/use-intersection-observer";
import { Loader } from "lucide-react";
import React, { useEffect } from "react";

interface Props {
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  isLoading: boolean;
  loadMore: (numItems: number) => void;
  numItems?: number;
}

const InfiniteScroll = ({
  status,
  isLoading,
  loadMore,
  numItems = 20,
}: Props) => {
  const { targetRef, isIntersecting } = useIntersectionOberser({
    threshold: 0.5,
    rootMargin: "100px",
  });

  useEffect(() => {
    if (isIntersecting && status === "CanLoadMore" && !isLoading) {
      loadMore(numItems);
    }
  }, [isIntersecting, status, isLoading, loadMore, numItems]);

  return (
    <div className="flex w-full flex-col items-center">
      <div ref={targetRef} className="h-1" />
      {status == "LoadingMore" && (
        <div className="flex w-full items-center justify-center py-2">
          <Loader className="animate-spin size-4 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default InfiniteScroll;
