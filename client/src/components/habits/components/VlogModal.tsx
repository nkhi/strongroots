import type { Vlog } from '../../../types';
import styles from '../HabitTracker.module.css';

interface VlogModalProps {
  vlog: Vlog;
  onClose: () => void;
}

export default function VlogModal({ vlog, onClose }: VlogModalProps) {
  return (
    <div className={styles.vlogModalOverlay} onClick={onClose}>
      <div className={styles.vlogModalContent} onClick={(e) => e.stopPropagation()}>
        <div dangerouslySetInnerHTML={{ __html: vlog.embedHtml }} />
      </div>
    </div>
  );
}
