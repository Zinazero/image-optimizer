import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), process.env.NODE_ENV === 'production' ? '.env.production' : '.env'),
});

import app from './server';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Image optimizer running on port ${PORT}`);
});
