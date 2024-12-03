'use server'

import { revalidatePath } from 'next/cache'

export async function fetchDashboardData() {
  // Add your data fetching logic here
  const data = await fetch('/api/admin/dashboard', {
    next: { revalidate: 60 } // Revalidate every minute
  }).then(res => res.json())
  
  return data
}

export async function fetchUserData() {
  const data = await fetch('/api/admin/users', {
    next: { revalidate: 60 }
  }).then(res => res.json())
  
  return data
}

export async function updateUserData(userData: any) {
  await fetch('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  })
  
  revalidatePath('/admin')
}
