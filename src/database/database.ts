import mongoose from 'mongoose';

export async function connectToDatabase() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/Proyecto_O';
  if (!uri) {
    throw new Error('Uri no definido');
  }
  try {
    await mongoose.connect(uri);
    console.log('Conectado a MongoDB');
  } catch (err) {
    console.error('Error al conectar a MongoDB:', err);
    process.exit(1);
  }
}
// connectToDatabase();