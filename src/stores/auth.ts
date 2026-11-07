import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/types/user.type'
import type { LoginPayload } from '@/types/auth.type'
import { loginApi, logoutApi, me } from '@/api/auth.api'

type DataRecord = Record<string, unknown>

function isRecord(value: unknown): value is DataRecord {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function findToken(value: unknown): string | null {
    if (!isRecord(value)) return null

    for (const key of ['access_token', 'accessToken', 'token', 'plainTextToken']) {
        const candidate = value[key]
        if (typeof candidate === 'string' && candidate.trim()) {
            return candidate.trim().replace(/^Bearer\s+/i, '')
        }
    }

    for (const key of ['data', 'auth', 'result']) {
        const nestedToken = findToken(value[key])
        if (nestedToken) return nestedToken
    }

    return null
}

function findUser(value: unknown): User | null {
    if (!isRecord(value)) return null

    if (isRecord(value.user)) return value.user as unknown as User
    if (isRecord(value.data)) return findUser(value.data)
    if (typeof value.email === 'string' && typeof value.name === 'string') {
        return value as unknown as User
    }

    return null
}

function permissionNames(value: unknown): string[] {
    if (typeof value === 'string') return [value]
    if (Array.isArray(value)) return value.flatMap(permissionNames)
    if (!isRecord(value)) return []
    if (typeof value.name === 'string') return [value.name]
    if ('data' in value) return permissionNames(value.data)
    return []
}

function collectPermissions(value: unknown): string[] {
    if (!isRecord(value)) return []
    const user = findUser(value)
    const permissions = [
        ...permissionNames(value.permissions),
        ...permissionNames(user?.permissions),
        ...permissionNames(user?.permission_names),
        ...permissionNames(user?.abilities),
    ]
    const roles = Array.isArray(user?.roles) ? user.roles : []
    for (const role of roles) {
        if (isRecord(role)) permissions.push(...permissionNames(role.permissions))
    }
    return [...new Set(permissions)]
}

function storedToken(): string | null {
    const value = localStorage.getItem('access_token')?.trim()
    if (!value || value === 'undefined' || value === 'null') return null
    return value.replace(/^Bearer\s+/i, '')
}

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const token = ref<string | null>(storedToken())
    const permissions = ref<string[]>([])
    const isAuthenticated = ref(!!token.value)

    const login = async (payload: LoginPayload) => {
        const response = await loginApi(payload)
        const accessToken = findToken(response)
        if (!accessToken) {
            throw new Error('Login response did not contain an access token.')
        }

        token.value = accessToken
        localStorage.setItem('access_token', accessToken)
        user.value = findUser(response)
        permissions.value = collectPermissions(response)
        isAuthenticated.value = true
    }

    const refreshUser = async () => {
        const response = await me()
        const currentUser = findUser(response)
        if (currentUser) user.value = currentUser
        permissions.value = collectPermissions(response)
        return user.value
    }

    const hasPermission = (permission: string) => permissions.value.includes(permission)

    const clearSession = () => {
        token.value = null
        user.value = null
        permissions.value = []
        isAuthenticated.value = false
        localStorage.removeItem('access_token')
    }

    const logout = async () => {
        try {
            await logoutApi()
        } finally {
            clearSession()
        }
    }

    return {
        user,
        token,
        permissions,
        isAuthenticated,
        hasPermission,
        login,
        refreshUser,
        clearSession,
        logout
    }
})