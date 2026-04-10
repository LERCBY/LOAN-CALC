import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import LoanCalculator from "@/pages/LoanCalculator";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LoanCalculator />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
