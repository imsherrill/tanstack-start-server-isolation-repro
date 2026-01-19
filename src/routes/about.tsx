// Page route that imports a client utility
// The utility only imports TYPES from shared module
// But shared module has a VALUE import from server code
import { createFileRoute } from "@tanstack/react-router";
import { useCurrency } from "../client"; // Import from barrel file

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const currency = useCurrency("EUR");
  return (
    <div>
      <h1>About</h1>
      <p>Currency: {currency}</p>
    </div>
  );
}
