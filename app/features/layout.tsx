import { AdSenseScript } from "@/components/adsense/AdSenseScript"

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AdSenseScript />
      {children}
    </>
  )
}
