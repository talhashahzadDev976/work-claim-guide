export function Container({
  children,
  className = "",
  width = "hub",
}: {
  children: React.ReactNode;
  className?: string;
  width?: "hub" | "guide" | "narrow";
}) {
  const max = { hub: "max-w-[1120px]", guide: "max-w-[720px]", narrow: "max-w-[880px]" }[width];
  return <div className={`mx-auto w-full ${max} px-4 sm:px-6 ${className}`}>{children}</div>;
}
