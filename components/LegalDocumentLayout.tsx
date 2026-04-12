import Link from 'next/link'

export default function LegalDocumentLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string
  lastUpdated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#FAFAF8] px-6 py-10 pb-16">
      <div className="mx-auto max-w-2xl">
        <Link
          href="/"
          className="text-sm font-medium text-[#93C572] transition-colors hover:text-[#7bad5c]"
        >
          ← Retour à l’accueil
        </Link>
        <header className="mt-6 border-b border-[#E5E7EB] pb-6">
          <h1 className="text-2xl font-bold text-[#1F2937]">{title}</h1>
          <p className="mt-2 text-xs text-[#9CA3AF]">Dernière mise à jour : {lastUpdated}</p>
        </header>
        <article className="mt-8 space-y-4 text-sm leading-relaxed text-[#4B5563]">{children}</article>
      </div>
    </div>
  )
}
