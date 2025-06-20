
import styles from "../../css/admin/background.module.css";
import { Outlet } from 'react-router';
import AdminNavBar from './adminNavBar';
export default function AdminLayout() {
  return (
    <>
     <div className={styles.body}>
       <AdminNavBar/>
        <Outlet />
        </div>
    </>
  )
}
