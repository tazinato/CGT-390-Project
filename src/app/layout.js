export const metadata = {
  title: "Website name",
  description: "Track movies, shows, games, and more",
};

import "./globals.css";
import Header from "../components/Header";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <main className="container">{children}</main>
      </body>
    </html>
  );
}