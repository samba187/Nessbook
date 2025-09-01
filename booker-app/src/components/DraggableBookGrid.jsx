import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BookCard from './BookCard';
import './DraggableBookGrid.css';

const SortableBookCard = ({ id, book, onEdit, onDelete, onView }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = () => {
    onEdit(book);
  };

  const handleDelete = () => {
    onDelete(book);
  };

  const handleView = () => {
    if (!book?._id) return;
    onView(book);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`sortable-book-card ${isDragging ? 'dragging' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <span className="drag-icon">⋮⋮</span>
      </div>
      <BookCard 
        book={book} 
        onEdit={handleEdit} 
        onDelete={handleDelete}
        onView={handleView}
        onClick={handleView}
      />
    </div>
  );
};

const DraggableBookGrid = ({ books, onBooksReorder, onEdit, onDelete, onView }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getKey = (book, index) => book._id || `${book.title}-${book.author || ''}-${index}`;

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const keys = books.map((b, i) => getKey(b, i));
      const oldIndex = keys.findIndex((k) => k === active.id);
      const newIndex = keys.findIndex((k) => k === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedBooks = arrayMove(books, oldIndex, newIndex);
      onBooksReorder(reorderedBooks);
    }
  };

  if (!books || books.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📚</div>
        <h3>Aucun livre trouvé</h3>
        <p>Commencez par ajouter votre premier livre !</p>
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={books.map((book, i) => getKey(book, i))} 
        strategy={rectSortingStrategy}
      >
        <div className="draggable-books-grid">
          {books.map((book, i) => {
            const id = getKey(book, i);
            return (
              <SortableBookCard
                key={id}
                id={id}
                book={book}
                onEdit={onEdit}
                onDelete={onDelete}
                onView={onView}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableBookGrid;
