import AuthLegalFooter from '@/components/AuthLegalFooter'

/** Layout vertical : contenu centré + footer légal (écrans auth). */
export default function AuthScreenWithFooter({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAFAF8]">
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      <AuthLegalFooter />
    </div>
  )
}
