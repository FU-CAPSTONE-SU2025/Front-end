import AccountCounter from '../../components/admin/accountCounter';
import styles from '../../css/admin/account.module.css';

export default function AccountPage() {
  return (
    <div className={styles.container}>
      <AccountCounter/>
      <h1>My Account</h1>
      <p>This is the admin account page.</p>
       <p>Testing</p>
    </div>
  );
}