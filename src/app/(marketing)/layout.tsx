export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white text-black overflow-x-hidden">
      {children}
    </div>
  );
}
