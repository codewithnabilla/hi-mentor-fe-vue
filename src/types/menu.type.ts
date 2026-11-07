import type { Component } from 'vue'

export interface SidebarMenu {
  id: string
  label: string
  path?: string
  icon?: Component
  children: SidebarMenu[]
}
