import { SignIn } from '@clerk/nextjs'

export default function Page() {
    return (
        <SignIn appearance={{
            elements: {
                rootBox: "mx-auto",
                card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-zinc-400",
                socialButtonsBlockButton: "bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-sm normal-case",
                footerActionText: "text-zinc-400",
                footerActionLink: "text-blue-500 hover:text-blue-400 font-medium",
                identityPreviewText: "text-white",
                identityPreviewEditButtonIcon: "text-zinc-400",
                formFieldLabel: "text-zinc-300",
                formFieldInput: "bg-zinc-800 border-zinc-700 text-white focus:ring-blue-500/20",
                dividerLine: "bg-zinc-800",
                dividerText: "text-zinc-500"
            }
        }} />
    )
}