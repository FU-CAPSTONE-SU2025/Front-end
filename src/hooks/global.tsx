import React from 'react'

type Props = {}

export default function global({}: Props) {
  return (
    <div>global</div>
  )
}
// This file is used to define global hooks, such as useAuth, useTheme, etc.
// It is also used to define global context providers, such as AuthProvider, ThemeProvider, etc.
// global state management, such as Zustand
// Try and spilt the gobal state depend on the roles if needed