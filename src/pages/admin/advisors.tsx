import { advisors } from '../../../data/mockAdvisor';
import AccountCounter from '../../components/admin/accountCounter';
import styles from '../../css/admin/advisors.module.css';

export default function AdvisorsPage() {
  return (
    <div className={styles.container}>
           <AccountCounter 
        label={"Advisor"}
        advisor={advisors}
      />
      <h1>Manage Advisors</h1>
      <p>This is the advisor management page.</p>
    </div>
  );
}