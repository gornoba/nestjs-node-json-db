import { DB_MODULES } from 'src/common/config/db.config';

export type Entity = (typeof DB_MODULES)[number];
