import styles from "../../css/admin/background.module.css";
import layoutStyles from "../../css/admin/adminLayout.module.css";
import { Outlet } from 'react-router';
import AdminNavBar from './adminNavBar';
import Notification from '../common/Notification';

export default function AdminLayout() {
  return (
    <>
     <div className={styles.body}>
       <AdminNavBar/>
        <Outlet />
        {/* Sticky floating notification button */}
        <div className={layoutStyles.floatingNotification}>
          <Notification variant="admin" />
        </div>
        </div>
    </>
  )
}
