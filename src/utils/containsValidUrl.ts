export default function containsValidUrl(content: string): boolean {
  if (content.length === 0 || typeof content != 'string') return false;

  // see https://stackoverflow.com/questions/1500260/detect-urls-in-text-with-javascript
  const validUrlRegex =
    /(\bhttps?:\/\/[-A-Z0-9+&@#%?=~_|!:,.;]*[-A-Z0-9+&@#%=~_|])/gi;
  return validUrlRegex.test(content);
}
