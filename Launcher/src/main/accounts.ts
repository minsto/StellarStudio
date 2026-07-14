import { existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync } from 'fs'
import { join } from 'path'
import { app, safeStorage } from 'electron'
import type { MicrosoftAuthResponse } from 'minecraft-java-core'
import { offlinePlayerUuid } from './offlineUuid.js'

/** Profil local sans Microsoft — lancement jeu en mode hors ligne (type Mojang auth). */
export type OfflineStoredAccount = {
  offline: true
  uuid: string
  name: string
}

export type AnyStoredAccount = MicrosoftAuthResponse | OfflineStoredAccount

export interface AccountsStore {
  activeUuid: string | null
  accounts: AnyStoredAccount[]
}

function userData(): string {
  return app.getPath('userData')
}

function storePath(): string {
  return join(userData(), 'accounts.json')
}

function legacyAccountPath(): string {
  return join(userData(), 'account.json')
}

function normalizeUuid(u: string): string {
  return u.replace(/-/g, '').toLowerCase()
}

export function isOfflineAccount(a: AnyStoredAccount | MicrosoftAuthResponse | null | undefined): a is OfflineStoredAccount {
  return a !== null && a !== undefined && 'offline' in a && (a as OfflineStoredAccount).offline === true
}

function isOfflineEntry(a: unknown): a is OfflineStoredAccount {
  return (
    typeof a === 'object' &&
    a !== null &&
    'offline' in a &&
    (a as OfflineStoredAccount).offline === true &&
    typeof (a as OfflineStoredAccount).uuid === 'string' &&
    typeof (a as OfflineStoredAccount).name === 'string'
  )
}

function isMicrosoftEntry(a: unknown): a is MicrosoftAuthResponse {
  return (
    typeof a === 'object' &&
    a !== null &&
    'refresh_token' in a &&
    typeof (a as MicrosoftAuthResponse).refresh_token === 'string'
  )
}

function migrateLegacyIfNeeded(): void {
  const sp = storePath()
  if (existsSync(sp)) return
  const lp = legacyAccountPath()
  if (!existsSync(lp)) return
  try {
    const acc = JSON.parse(readFileSync(lp, 'utf8')) as MicrosoftAuthResponse
    if (acc?.uuid && acc?.refresh_token) {
      // Passe par writeStore pour que le fichier soit chiffre des la migration.
      writeStore({ activeUuid: acc.uuid, accounts: [acc] })
      try {
        unlinkSync(lp)
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
}

function parseAccountsArray(raw: unknown): AnyStoredAccount[] {
  if (!Array.isArray(raw)) return []
  const out: AnyStoredAccount[] = []
  for (const item of raw) {
    if (isOfflineEntry(item)) out.push(item)
    else if (isMicrosoftEntry(item)) out.push(item)
  }
  return out
}

const ACCOUNTS_STORE_VERSION = 1

/**
 * Format sur disque d'`accounts.json`. Les tokens Microsoft (dont le refresh_token) sont chiffres
 * au repos via Electron `safeStorage` (DPAPI sur Windows, Keychain sur macOS, kwallet/libsecret sur Linux).
 * Si le chiffrement n'est pas disponible sur la machine, on retombe en clair (`enc: false`) pour ne pas
 * casser la connexion — mais le cas nominal est chiffre.
 */
type PersistedAccounts =
  | { v: number; enc: true; data: string }
  | { v: number; enc: false; data: unknown }

function coerceStore(raw: unknown): AccountsStore {
  if (!raw || typeof raw !== 'object') return { activeUuid: null, accounts: [] }
  const o = raw as Partial<AccountsStore>
  return {
    activeUuid: typeof o.activeUuid === 'string' ? o.activeUuid : null,
    accounts: parseAccountsArray(o.accounts)
  }
}

function encryptionAvailable(): boolean {
  try {
    return safeStorage.isEncryptionAvailable()
  } catch {
    return false
  }
}

function decodePersisted(text: string): AccountsStore {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return { activeUuid: null, accounts: [] }
  }

  if (parsed && typeof parsed === 'object' && 'enc' in (parsed as Record<string, unknown>)) {
    const p = parsed as PersistedAccounts
    if (p.enc === true && typeof p.data === 'string') {
      if (!encryptionAvailable()) return { activeUuid: null, accounts: [] }
      try {
        const json = safeStorage.decryptString(Buffer.from(p.data, 'base64'))
        return coerceStore(JSON.parse(json))
      } catch {
        // Blob illisible (autre machine/utilisateur, coffre indisponible) : on repart a vide.
        return { activeUuid: null, accounts: [] }
      }
    }
    if (p.enc === false) return coerceStore(p.data)
    return { activeUuid: null, accounts: [] }
  }

  // Ancien format en clair (AccountsStore brut) : lu tel quel, il sera rechiffre au prochain writeStore.
  return coerceStore(parsed)
}

export function loadStore(): AccountsStore {
  migrateLegacyIfNeeded()
  const sp = storePath()
  if (!existsSync(sp)) return { activeUuid: null, accounts: [] }
  try {
    return decodePersisted(readFileSync(sp, 'utf8'))
  } catch {
    return { activeUuid: null, accounts: [] }
  }
}

function writeStore(store: AccountsStore): void {
  mkdirSync(userData(), { recursive: true })
  const inner = JSON.stringify(store)
  let payload: PersistedAccounts
  try {
    if (encryptionAvailable()) {
      const encrypted = safeStorage.encryptString(inner)
      payload = { v: ACCOUNTS_STORE_VERSION, enc: true, data: encrypted.toString('base64') }
    } else {
      payload = { v: ACCOUNTS_STORE_VERSION, enc: false, data: store }
    }
  } catch {
    payload = { v: ACCOUNTS_STORE_VERSION, enc: false, data: store }
  }
  writeFileSync(storePath(), JSON.stringify(payload, null, 2), 'utf8')
}

/** Règles pseudo Minecraft Java (profil) : 3–16 caractères, [a-zA-Z0-9_]. */
const MINECRAFT_PROFILE_NAME_RE = /^[a-zA-Z0-9_]{3,16}$/

export type AccountMessagesLocale = 'fr' | 'en'

const PROFILE_NAME_MSG: Record<
  AccountMessagesLocale,
  { empty: string; length: string; chars: string; duplicate: string }
> = {
  fr: {
    empty: 'Pseudo vide.',
    length: 'Le pseudo doit faire entre 3 et 16 caractères.',
    chars:
      'Caractères autorisés : lettres (A–Z, a–z), chiffres et _ (pas d’espace ni de caractères spéciaux).',
    duplicate:
      'Ce pseudo est déjà utilisé par un autre compte du launcher (Microsoft ou hors ligne).'
  },
  en: {
    empty: 'Username is empty.',
    length: 'Username must be between 3 and 16 characters.',
    chars: 'Only letters (A–Z, a–z), numbers and underscore; no spaces or special characters.',
    duplicate:
      'This username is already used by another launcher account (Microsoft or offline).'
  }
}

function normalizeNameKey(name: string): string {
  return name.trim().toLowerCase()
}

/** Retire les profils hors ligne dont le pseudo correspond (insensible à la casse) à un compte Microsoft. */
function removeOfflineAccountsWithSameNameAs(store: AccountsStore, microsoftName: string): void {
  const key = normalizeNameKey(microsoftName)
  if (!key) return
  store.accounts = store.accounts.filter((a) => !(isOfflineAccount(a) && normalizeNameKey(a.name) === key))
}

export function addOrUpdateAccount(acc: MicrosoftAuthResponse): void {
  const store = loadStore()
  removeOfflineAccountsWithSameNameAs(store, acc.name)
  const idx = store.accounts.findIndex((a) => !isOfflineAccount(a) && normalizeUuid(a.uuid) === normalizeUuid(acc.uuid))
  if (idx >= 0) store.accounts[idx] = acc
  else store.accounts.push(acc)
  store.activeUuid = acc.uuid
  writeStore(store)
}

/**
 * Validation pseudo identique aux règles Mojang pour un nom de joueur Java (hors ligne ou affichage).
 */
export function validateMinecraftProfileName(
  name: string,
  locale: AccountMessagesLocale = 'fr'
): { ok: true; name: string } | { ok: false; error: string } {
  const m = PROFILE_NAME_MSG[locale]
  const t = name.trim()
  if (!t) return { ok: false, error: m.empty }
  if (t.length < 3 || t.length > 16) {
    return { ok: false, error: m.length }
  }
  if (!MINECRAFT_PROFILE_NAME_RE.test(t)) {
    return { ok: false, error: m.chars }
  }
  return { ok: true, name: t }
}

/** @deprecated utiliser validateMinecraftProfileName */
export function validateOfflineDisplayName(name: string): { ok: true; name: string } | { ok: false; error: string } {
  return validateMinecraftProfileName(name, 'fr')
}

export function addOfflineAccount(
  rawName: string,
  locale: AccountMessagesLocale = 'fr'
): { ok: true } | { ok: false; error: string } {
  const m = PROFILE_NAME_MSG[locale]
  const v = validateMinecraftProfileName(rawName, locale)
  if (!v.ok) return v
  const name = v.name
  const store = loadStore()
  const lower = normalizeNameKey(name)
  const dup = store.accounts.some((a) => normalizeNameKey(a.name) === lower)
  if (dup) {
    return { ok: false, error: m.duplicate }
  }

  const uuid = offlinePlayerUuid(name)
  const entry: OfflineStoredAccount = { offline: true, uuid, name }
  store.accounts.push(entry)
  store.activeUuid = uuid
  writeStore(store)
  return { ok: true }
}

export function setActiveUuid(uuid: string): { ok: true } | { ok: false; error: string } {
  const store = loadStore()
  const found = store.accounts.some((a) => normalizeUuid(a.uuid) === normalizeUuid(uuid))
  if (!found) return { ok: false, error: 'Compte introuvable.' }
  store.activeUuid = uuid
  writeStore(store)
  return { ok: true }
}

export function removeAccount(uuid: string): void {
  const store = loadStore()
  store.accounts = store.accounts.filter((a) => normalizeUuid(a.uuid) !== normalizeUuid(uuid))
  if (store.activeUuid && normalizeUuid(store.activeUuid) === normalizeUuid(uuid)) {
    store.activeUuid = store.accounts[0]?.uuid ?? null
  }
  writeStore(store)
}

/** Compte actif — Microsoft ou profil hors ligne. */
export function getActiveAccount(): AnyStoredAccount | null {
  const store = loadStore()
  if (!store.activeUuid) return store.accounts[0] ?? null
  return (
    store.accounts.find((a) => normalizeUuid(a.uuid) === normalizeUuid(store.activeUuid!)) ??
    store.accounts[0] ??
    null
  )
}

export function listAccountSummaries(): { uuid: string; name: string; offline: boolean }[] {
  return loadStore().accounts.map((a) => ({
    uuid: a.uuid,
    name: a.name,
    offline: isOfflineAccount(a)
  }))
}

export function findStoredAccountByUuid(uuid: string): AnyStoredAccount | null {
  const store = loadStore()
  const target = normalizeUuid(uuid)
  return store.accounts.find((a) => normalizeUuid(a.uuid) === target) ?? null
}

export function hasAnyAccount(): boolean {
  return loadStore().accounts.length > 0
}

export function updateAccountTokens(acc: MicrosoftAuthResponse): void {
  const store = loadStore()
  removeOfflineAccountsWithSameNameAs(store, acc.name)
  const idx = store.accounts.findIndex(
    (a) => !isOfflineAccount(a) && normalizeUuid(a.uuid) === normalizeUuid(acc.uuid)
  )
  if (idx >= 0) store.accounts[idx] = acc
  else {
    store.accounts.push(acc)
    if (!store.activeUuid) store.activeUuid = acc.uuid
  }
  writeStore(store)
}

/**
 * Objet authenticator pour minecraft-java-core (équivalent Mojang hors ligne).
 */
export function buildOfflineAuthenticator(acc: OfflineStoredAccount): Record<string, unknown> {
  const tok = normalizeUuid(acc.uuid)
  return {
    access_token: tok,
    client_token: tok,
    uuid: acc.uuid,
    name: acc.name,
    user_properties: '{}',
    meta: { online: false, type: 'Mojang' }
  }
}
