<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardMenuItem from '@/components/DashboardMenuItem.vue'
import { getMenus } from '@/api/menu.api'
import { useAuthStore } from '@/stores/auth'
import type { SidebarMenu } from '@/types/menu.type'
import axios from 'axios'
import { menuIcons } from '@/lib/menu-icon'

type DataRecord = Record<string, unknown>

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const menus = ref<SidebarMenu[]>([])
const userName = ref('Admin')
const loading = ref(true)
const errorMessage = ref('')
const search = ref('')

const currentPath = computed(() => route.path)
const pageTitle = computed(() => {
  const match = findMenu(menus.value, route.path)
  return match?.label ?? (route.path === '/dashboard' ? 'Dashboard' : 'Dashboard')
})
const visibleMenus = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return menus.value
  return filterBySearch(menus.value, query)
})

function isRecord(value: unknown): value is DataRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function unwrapData(value: unknown): unknown {
  let current = value
  while (isRecord(current) && 'data' in current) current = current.data
  return current
}

function permissionNames(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.flatMap(permissionNames)
  if (!isRecord(value)) return []
  if (typeof value.name === 'string') return [value.name]
  if ('data' in value) return permissionNames(value.data)
  return []
}

function readChildren(record: DataRecord): unknown[] {
  const children = record.children ?? record.items ?? record.sub_menus ?? record.submenus
  return Array.isArray(children) ? children : []
}

function requiredPermissions(record: DataRecord): string[] {
  const values = [record.permission_name, record.required_permission, record.permission, record.permissions]
  return values.flatMap(permissionNames)
}

function normalizeMenuList(value: unknown, permissions: Set<string>): SidebarMenu[] {
  const unwrapped = unwrapData(value)
  let records: unknown[] = []
  if (Array.isArray(unwrapped)) records = unwrapped
  else if (isRecord(unwrapped)) {
    const list = unwrapped.menus ?? unwrapped.items ?? unwrapped.data
    if (Array.isArray(list)) records = list
  }

  return records.flatMap((entry, index) => {
    if (!isRecord(entry)) return []
    const required = requiredPermissions(entry)
    if (required.length && !required.some((name) => permissions.has(name))) return []

    const labelValue = entry.label ?? entry.title ?? entry.name ?? entry.display_name
    const label = typeof labelValue === 'string' ? labelValue : ''
    if (!label) return []

    const childEntries = readChildren(entry)
    const children = normalizeMenuList(childEntries, permissions)
    const routeValue = entry.path ?? entry.route ?? entry.url ?? entry.href ?? entry.slug
    let path: string | undefined
    if (typeof routeValue === 'string' && routeValue.trim()) {
      const value = routeValue.trim()
      if (!/^https?:\/\//i.test(value)) path = value.startsWith('/') ? value : `/${value}`
    }

    const icon =
        typeof entry.icon === 'string'
            ? menuIcons[entry.icon]
            : undefined
            return [{ id: String(entry.id ?? entry.uuid ?? `${label}-${index}`), label, path, icon, children }]
        })
}

function findMenu(items: SidebarMenu[], path: string): SidebarMenu | undefined {
  for (const item of items) {
    if (item.path === path) return item
    const nested = findMenu(item.children, path)
    if (nested) return nested
  }
  return undefined
}

function filterBySearch(items: SidebarMenu[], query: string): SidebarMenu[] {
  return items.flatMap((item) => {
    const children = filterBySearch(item.children, query)
    if (item.label.toLowerCase().includes(query) || children.length) {
      return [{ ...item, children }]
    }
    return []
  })
}

async function loadDashboard() {
  loading.value = true
  errorMessage.value = ''
  const [menuResult, userResult] = await Promise.allSettled([
    getMenus(),
    authStore.refreshUser(),
  ])

  const unauthorized = [menuResult, userResult].some((result) =>
    result.status === 'rejected' &&
    axios.isAxiosError(result.reason) &&
    result.reason.response?.status === 401,
  )

  if (unauthorized) {
    authStore.clearSession()
    await router.replace({ name: 'login' })
    return
  }

  const name = authStore.user?.name
  if (name?.trim()) userName.value = name

  if (menuResult.status === 'fulfilled') {
    menus.value = normalizeMenuList(menuResult.value, new Set(authStore.permissions))
  } else {
    errorMessage.value = 'Unable to load the navigation menu. Please try again.'
  }

  loading.value = false
}

async function logout() {
  try {
    await authStore.logout()
  } finally {
    await router.replace({ name: 'login' })
  }
}

onMounted(loadDashboard)
</script>

<template>
  <div class="flex min-h-screen bg-white text-zinc-900">
    <aside class="hidden w-[204px] shrink-0 border-r border-zinc-200 bg-white md:flex md:flex-col">
      <div class="flex h-[55px] flex-col justify-center border-b border-zinc-200 px-5">
        <span class="text-[13px] font-bold leading-4">HI Mentor</span>
        <span class="text-[10px] text-zinc-500">{{ userName }}</span>
      </div>

      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-3" aria-label="Main navigation">
        <div v-if="loading" class="px-2.5 py-4 text-xs text-zinc-500">Loading menu…</div>
        <div v-else class="space-y-1">
          <DashboardMenuItem
            v-for="item in visibleMenus"
            :key="item.id"
            :item="item"
            :current-path="currentPath"
          />
        </div>
      </nav>

      <div class="border-t border-zinc-200 p-3">
        <button
          class="w-full rounded-md px-2.5 py-2 text-left text-[13px] text-zinc-600 hover:bg-zinc-100"
          type="button"
          @click="logout"
        >
          Sign out
        </button>
      </div>
    </aside>

    <div class="flex min-w-0 flex-1 flex-col">
      <header class="flex h-[55px] items-center justify-between border-b border-zinc-200 px-5">
        <span class="text-sm font-medium text-zinc-700">{{ pageTitle }}</span>
        <div class="flex items-center gap-4">
          <span class="text-sm text-zinc-500" aria-hidden="true">◉</span>
          <button class="relative text-sm text-zinc-600" type="button" aria-label="Notifications">
            ♧<span class="absolute -right-2 -top-2 rounded-full bg-red-500 px-1 text-[9px] leading-4 text-white">12</span>
          </button>
          <span class="flex size-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-[11px] text-zinc-600">
            {{ userName.slice(0, 2).toUpperCase() }}
          </span>
        </div>
      </header>

      <main class="flex-1 p-4 md:p-[18px]">
        <section class="min-h-[280px] rounded-xl border border-zinc-200 bg-white p-4 md:p-5">
          <div class="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 class="text-sm font-semibold">{{ pageTitle }}</h1>
              <p class="mt-1 text-xs text-zinc-500">Welcome back, {{ userName }}.</p>
            </div>
            <input
              v-model="search"
              type="search"
              placeholder="Search menu…"
              aria-label="Search menu"
              class="h-9 w-full rounded-lg border border-zinc-200 px-3 text-xs shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 md:w-72"
            />
          </div>

          <div v-if="errorMessage" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {{ errorMessage }}
            <button class="ml-2 underline" type="button" @click="loadDashboard">Retry</button>
          </div>
          <div v-else-if="!loading && !visibleMenus.length" class="rounded-lg border border-dashed border-zinc-200 p-8 text-center text-sm text-zinc-500">
            No menu items are available for your account.
          </div>
          <div v-else class="rounded-lg border border-zinc-100 bg-zinc-50/60 p-5 text-sm text-zinc-600">
            Choose an item from the navigation menu to get started.
          </div>
        </section>
      </main>
    </div>
  </div>
</template>
