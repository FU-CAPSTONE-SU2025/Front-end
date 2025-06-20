import React from 'react'
import StaffNavBar from './navBar'
import { Outlet } from 'react-router'

type Props = {}

export default function StaffLayout({}: Props) {
  return (
    <div>
        <StaffNavBar/>
        <Outlet/>
    </div>
  )
}