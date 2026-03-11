export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen relative flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(to bottom, #000000 0%, #0a0015 40%, #1a0040 65%, #4a00b0 85%, #7b2ff2 100%)",
      }}
    >
      <div className="absolute inset-0 w-full h-full bg-black/80 transition-all duration-300 md:bg-black/65 blur-2xl rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-3/5 md:-translate-y-2/3" />
      {children}
    </div>
  );
}
