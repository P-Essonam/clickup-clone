import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { env } from "@/env"

export default function Home() {
  return (
    <div>
      <Button variant="destructive">Click me</Button>
      <ModeToggle />
      {env.NEXT_PUBLIC_APP_URL}
    </div>
  )
}