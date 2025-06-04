import { students } from '../../../data/mockStudent';
import AccountCounter from '../../components/admin/accountCounter';
import styles from '../../css/admin/students.module.css';

export default function StudentsPage() {
  return (
    <div className={styles.container}>
        <AccountCounter 
        label={"Student"}
        student={students}
      />
      <h1>Manage Students</h1>
      <p>This is the student management page.</p>
    </div>
  );
}