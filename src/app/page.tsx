"use client";

import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { env } from "@/env"
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import Link from "next/link"

export default function Home() {

  const { signOut } = useAuth()
  return (
    <div className="size-full min-h-screen flex justify-center items-center">
      <Button>
        <Link href={"/dashboard"}> 
          Dashboard
        </Link>
      </Button>
      <Button
        variant={"destructive"}
        onClick={async() => await signOut()}
      >
          Sign out
      </Button>
      <ModeToggle />
    </div>
  )
}