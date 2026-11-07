<script setup lang="ts">
import type { SidebarMenu } from '@/types/menu.type'
import { computed } from 'vue'

const props = defineProps<{
  item: SidebarMenu
  currentPath: string
}>()

const isActive = computed(() => props.item.path === props.currentPath)
</script>


<template>
  <div>
    <RouterLink
      v-if="item.path"
      :to="item.path"
      class="group flex min-h-9 items-center gap-2 rounded-md px-2.5 text-[13px] transition-colors"
      :class="isActive ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'"
    >
      <!-- Lucide Icon -->
      <component
        :is="item.icon"
        v-if="item.icon"
        :size="16"
        :stroke-width="1.8"
        class="shrink-0 opacity-80"
      />

      <!-- Fallback Icon -->
      <span
        v-else
        class="w-4 shrink-0 text-center text-xs opacity-80"
        aria-hidden="true"
      >
        ◦
      </span>

      <span class="truncate">{{ item.label }}</span>
    </RouterLink>

    <!-- Menu without route -->
    <div
      v-else
      class="px-2.5 py-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400"
    >
      {{ item.label }}
    </div>

    <!-- Submenu -->
    <div
      v-if="item.children.length"
      class="ml-1 mt-1 space-y-0.5 border-l border-zinc-100 pl-2"
    >
      <DashboardMenuItem
        v-for="child in item.children"
        :key="child.id"
        :item="child"
        :current-path="currentPath"
      />
    </div>
  </div>
</template>

