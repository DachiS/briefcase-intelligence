// src/lib/flitt.ts
import crypto from 'crypto'

const FLITT_MERCHANT_ID = parseInt(process.env.FLITT_MERCHANT_ID || '1549901')
const FLITT_SECRET_KEY = process.env.FLITT_SECRET_KEY || 'test'
const FLITT_API_URL = 'https://pay.flitt.com/api'

export function generateSignature(params: Record<string, string | number>): string {
  // Filter out signature, null, undefined, empty string
  // Note: 0 values must be included (per Flitt docs: "make sure that a parameter with a value of 0 is not null")
  const filtered: Record<string, string> = {}
  for (const [k, v] of Object.entries(params)) {
    if (k === 'signature') continue
    if (v === null || v === undefined || v === '') continue
    filtered[k] = String(v)
  }
  const sorted = Object.keys(filtered).sort()
  const values = [FLITT_SECRET_KEY, ...sorted.map(k => filtered[k])]
  const str = values.join('|')
  console.log('[Flitt] Signature string:', str)
  return crypto.createHash('sha1').update(str).digest('hex')
}

export async function createFlittToken(params: Record<string, string | number>): Promise<{ token: string; payment_id?: string }> {
  const requestParams: Record<string, string | number> = {
    merchant_id: FLITT_MERCHANT_ID,
    ...params,
  }

  const signature = generateSignature(requestParams)

  const body = { request: { ...requestParams, signature } }
  console.log('[Flitt] Token request body:', JSON.stringify(body))

  const res = await fetch(`${FLITT_API_URL}/checkout/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await res.json()
  console.log('[Flitt] Token response:', JSON.stringify(data))

  if (data.response?.response_status !== 'success') {
    throw new Error(JSON.stringify(data.response))
  }

  return {
    token: data.response.token,
    payment_id: data.response.payment_id,
  }
}

export function verifyCallbackSignature(params: Record<string, string>): boolean {
  const received = params.signature
  const check = { ...params }
  delete check.signature
  delete check.response_signature_string
  const expected = generateSignature(check)
  return received === expected
}
