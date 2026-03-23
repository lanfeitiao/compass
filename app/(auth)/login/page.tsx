'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  async function signInWithGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    })
  }

  return (
    <Card className="w-full max-w-sm mx-4">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Compass</CardTitle>
        <CardDescription>Your life purpose & goal tracker</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={signInWithGoogle} className="w-full" size="lg">
          Sign in with Google
        </Button>
      </CardContent>
    </Card>
  )
}
