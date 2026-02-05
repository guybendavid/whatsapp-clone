import { render } from "react-dom";
import { ApolloProviderWrapper } from "#root/client/components/ApolloProvider";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found.");
}

render(<ApolloProviderWrapper />, root);
