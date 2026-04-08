import mongoose from 'mongoose';

// Cached connection for Next.js (hot-reload safe)
const cached: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } = {
  conn: null,
  promise: null,
};

export default async function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI environment variable is not set');

    cached.promise = mongoose.connect(uri).then((m) => {
      cached.conn = m;
      return m;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
