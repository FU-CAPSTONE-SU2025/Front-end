import { Outlet } from 'react-router'
import StaffNavBar from '../../pages/staff/navBar'
type Props = {}
export default function StaffLayout({}: Props) {
  return (
    <>
       <StaffNavBar/>
        <Outlet />
    </>
  )
}