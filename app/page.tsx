export default function Home() {
  const themeClasses = "bg-white text-neutral-900 border-neutral-200";

  return (
    <div className={`p-4 flex flex-col h-full gap-4 transition-colors ${themeClasses}`}>
      <div className="flex-1" />
      <footer className="pt-4 border-t border-neutral-200 text-xs text-neutral-500">
        © 2025 Dev Utils
      </footer>
    </div>
  );
}
