import { managers } from '../../../data/mockManager';
import AccountCounter from '../../components/admin/accountCounter';
import styles from '../../css/admin/managers.module.css';

export default function ManagersPage() {
  return (
    <div className={styles.container}>
      <AccountCounter 
        label={"Manager"}
        manager={managers}
      />
      <h1>Manage Managers</h1>
      <p>This is the manager management page.</p>
    </div>
  );
}