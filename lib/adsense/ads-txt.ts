import { ADSENSE_PUBLISHER_ID } from "./config"

/** Single authorized seller line — required by Google AdSense / ads.txt spec */
export const ADS_TXT_LINE = `google.com, ${ADSENSE_PUBLISHER_ID}, DIRECT, f08c47fec0942fa0`

/** ads.txt file body (served at /ads.txt on every domain) */
export const ADS_TXT_BODY = `${ADS_TXT_LINE}\n`
