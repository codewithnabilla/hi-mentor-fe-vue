import type { Component } from 'vue'

import {
  LayoutDashboard,
  Users,
  User,
  Shield,
  KeyRound,
  Menu,
  Building2,
  GraduationCap,
  BookOpen,
  Calendar,
  FileBarChart2,
  Folder,
  ShieldCheck,
  BriefcaseBusiness,
} from 'lucide-vue-next'

export const menuIcons: Record<string, Component> = {
  Dashboard: LayoutDashboard,
  People: Users,
  Person: User,
  AdminPanelSettings: Shield,
  Key: KeyRound,
  Menu,
  Business: Building2,
  School: GraduationCap,
  Groups: BookOpen,
  CalendarMonth: Calendar,
  Assessment: FileBarChart2,
  Folder,
  Permission: ShieldCheck,
  Career: BriefcaseBusiness,
}