import SlideshowGenerator from "@/components/slideshow-generator"
import { SimplePasswordGate } from "@/components/simple-password-gate"

export default function EditorPage() {
  return (
    <SimplePasswordGate>
      <main className="min-h-screen gradient-bg">
        <SlideshowGenerator />
      </main>
    </SimplePasswordGate>
  )
}
