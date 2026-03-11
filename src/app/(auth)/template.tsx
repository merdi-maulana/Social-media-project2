"use client";

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[460px] animate-auth-enter">{children}</div>
  );
}
