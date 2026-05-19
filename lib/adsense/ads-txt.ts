import { ADSENSE_PUBLISHER_ID } from "./config"

/** ads.txt uses pub-XXXXXXXX (not ca-pub-XXXXXXXX) per Google / IAB spec */
function adsTxtPublisherId(id: string) {
  return id.startsWith("ca-pub-") ? id.slice(3) : id
}

/** Exact line from AdSense → Sites → ads.txt setup */
export const ADS_TXT_LINE = `google.com, ${adsTxtPublisherId(ADSENSE_PUBLISHER_ID)}, DIRECT, f08c47fec0942fa0`

export const ADS_TXT_BODY = `${ADS_TXT_LINE}\n`
