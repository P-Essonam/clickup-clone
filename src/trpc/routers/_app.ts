import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { organizationRouter } from './organization-procedure';



export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  
});
// export type definition of API
export type AppRouter = typeof appRouter;