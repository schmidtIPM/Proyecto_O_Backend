import mongoose from 'mongoose';

export async function connectToDatabase() {
    const uri = 'mongodb://localhost:27017/Proyecto_O';
    await mongoose.connect(uri);
    console.log('Conectado a MongoDB');
}
