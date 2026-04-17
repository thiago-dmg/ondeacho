import type { AppProps } from "next/app";
import "../styles/globals.css";
import { AuthGuard } from "../src/components/AuthGuard";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthGuard>
      <Component {...pageProps} />
    </AuthGuard>
  );
}
