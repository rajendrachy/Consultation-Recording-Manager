import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation',
      required: [true, 'A note must belong to a consultation'],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A note must have an author'],
    },
    content: {
      type: String,
      required: [true, 'Note content cannot be empty'],
    },
  },
  {
    timestamps: true,
  }
);

noteSchema.index({ consultation: 1 });

const Note = mongoose.model('Note', noteSchema);
export default Note;
