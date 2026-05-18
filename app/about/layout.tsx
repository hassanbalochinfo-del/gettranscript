import { AdSenseScript } from "@/components/adsense/AdSenseScript"

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  )
}
