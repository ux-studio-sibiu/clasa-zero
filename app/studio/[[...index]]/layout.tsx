
export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <link rel="icon" type="image/jpeg" href="/favicon.jpg" />
      <head></head>
      <body className={`bg-zinc-900 text-white`}>{children}</body>
    </html>
  );
}
