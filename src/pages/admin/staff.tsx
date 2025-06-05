import { staffs } from '../../../data/mockStaff';
import AccountCounter from '../../components/admin/accountCounter';
import styles from '../../css/admin/staff.module.css';

export default function StaffPage() {
  return (
    <div className={styles.container}>
      <AccountCounter 
        label={"Academic Staff"}
        staff={staffs}
      />
      <h1>Manage Staff</h1>
      <p>This is the staff management page.</p>
    </div>
  );
}