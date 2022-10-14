import { EntityManager, EntityRepository, MikroORM } from '@mikro-orm/core';
import options from './mikro-orm.config';

import { User } from "../entities/UserEntity";

/**
 * This demo makes use of Mikro ORM to manage the database connection and CRUD operations of our User entity (https://mikro-orm.io/)
 */

export const DI = {} as {
  orm: MikroORM,
  em: EntityManager,
  userRepository: EntityRepository<User>
};

/**
 * Initiate connection to the database
 */
export async function connect() {

  console.log(123455);
  options.clientUrl = process.env.DEMO_DATABASE
  console.log(`url database: ${options.clientUrl}`);

  DI.orm = await MikroORM.init(options);

  console.log(1111111);
  DI.em = DI.orm.em;
}