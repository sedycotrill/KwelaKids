
import { Button } from "@/components/ui/button";

function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-foreground">
      <h1 className="text-3xl font-bold">Kwelakids</h1>

      <p className="text-muted-foreground">
        Welcome to Kwelakids!
      </p>

      <Button onClick={() => alert("Kwelakids Button is working!")}>
        Test Button
      </Button>
    </main>
  );
}

export default App;
