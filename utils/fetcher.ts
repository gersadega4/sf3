export default async function fetcher<T = unknown>(url: string): Promise<T> {
    const res = await fetch(url, { cache: "no-store" })
    if (!res.ok) {
      let msg = ""
      try {
        const data = await res.json()
        msg = data?.error || res.statusText
      } catch {
        msg = res.statusText
      }
      throw new Error(msg || `Request failed: ${res.status}`)
    }
    return res.json() as Promise<T>
  }
  