import 'dotenv/config';
import { app } from './app';
import { sequelize } from './models';

const port = 3000;

sequelize
  .sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://127.0.0.1:${port}`);
    });
  })
  .catch((error) => console.error('Failed to sync DB: ', error));
