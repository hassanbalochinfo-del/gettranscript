import { AdSenseScript } from "@/components/adsense/AdSenseScript"

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  )
}
