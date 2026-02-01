import { Card } from '../Card/Card';
import { Button } from '../../atoms/Button/Button';

interface KanbanCardProps {
  title: string;
  description?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  title,
  description,
  onEdit,
  onDelete,
}) => (
  <Card variant="glass" padding="md" className="kanban-card">
    <div className="kanban-card__header">
      <h3 className="kanban-card__title">{title}</h3>
      <div className="kanban-card__actions">
        {onEdit && <Button variant="secondary" size="sm" onClick={onEdit}>Edit</Button>}
        {onDelete && <Button variant="danger" size="sm" onClick={onDelete}>Delete</Button>}
      </div>
    </div>
    {description && <p className="kanban-card__description">{description}</p>}
  </Card>
);