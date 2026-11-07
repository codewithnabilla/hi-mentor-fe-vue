<script setup lang="ts">

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ref } from 'vue'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    await authStore.login({
      email: email.value,
      password: password.value
    })

    await router.replace({ name: 'dashboard' })
  } catch (error) {
    console.error('Login failed:', error)

    if(axios.isAxiosError(error)) {
      errorMessage.value = error.response?.data?.message ?? 'Invalid email or password.'
    } else {
      errorMessage.value = error instanceof Error ? error.message : 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 p-4">
    <Card class="w-full max-w-md">
      <CardHeader class="space-y-1">
        <CardTitle class="text-center text-2xl font-bold">
          Welcome Back
        </CardTitle>

        <CardDescription class="text-center">
          Please login to your account.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-5">

          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input 
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            required
            autocomplete="email"
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input
              id="password"
              v-model="password"
              type="password"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            />
          </div>

          <p
          v-if="errorMessage"
          class="text-sm font-medium text-destructive"
          >
          {{ errorMessage }}
          </p>

          <Button
            type="submit"
            class="w-full"
            :disabled="loading"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>