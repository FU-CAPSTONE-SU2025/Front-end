import React from 'react'
import { Outlet } from 'react-router'
import StaffNavBar from '../../pages/staff/navBar'
import styles from "../../css/admin/background.module.css";
type Props = {}
export default function StaffLayout({}: Props) {
  return (
    <>
       <StaffNavBar/>
        <Outlet />
    </>
  )
}