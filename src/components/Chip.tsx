import styles from './Chip.module.css';

interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function Chip({ label, checked, onChange }: Props) {
  return (
    <label className={styles.chip}>
      <input type="checkbox" className={styles.input} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className={styles.face}>{label}</span>
    </label>
  );
}
