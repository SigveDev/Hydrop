import {
  Client,
  TablesDB,
  ID,
  type Models,
  Permission,
  Role,
} from 'node-appwrite'
import type {
  WaterIntake,
  UserSettings,
  Friendships,
  UserProfiles,
} from './appwrite.types'

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT!)
  .setProject(process.env.APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!)

const tablesDB = new TablesDB(client)

export const db = {
  waterIntake: {
    create: (
      data: Omit<WaterIntake, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<WaterIntake>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'water_intake',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<WaterIntake>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'water_intake',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<WaterIntake, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<WaterIntake>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'water_intake',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'water_intake',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<WaterIntake>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'water_intake',
        queries,
      }),
  },
  userSettings: {
    create: (
      data: Omit<UserSettings, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<UserSettings>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_settings',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<UserSettings>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_settings',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<UserSettings, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<UserSettings>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_settings',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_settings',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<UserSettings>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_settings',
        queries,
      }),
  },
  friendships: {
    create: (
      data: Omit<Friendships, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<Friendships>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'friendships',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<Friendships>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'friendships',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<Friendships, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<Friendships>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'friendships',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'friendships',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<Friendships>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'friendships',
        queries,
      }),
  },
  userProfiles: {
    create: (
      data: Omit<UserProfiles, keyof Models.Row>,
      options?: { rowId?: string; permissions?: string[] },
    ) =>
      tablesDB.createRow<UserProfiles>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_profiles',
        rowId: options?.rowId ?? ID.unique(),
        data,
        permissions: [
          Permission.write(Role.user(data.createdBy)),
          Permission.read(Role.user(data.createdBy)),
          Permission.update(Role.user(data.createdBy)),
          Permission.delete(Role.user(data.createdBy)),
        ],
      }),
    get: (id: string) =>
      tablesDB.getRow<UserProfiles>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_profiles',
        rowId: id,
      }),
    update: (
      id: string,
      data: Partial<Omit<UserProfiles, keyof Models.Row>>,
      options?: { permissions?: string[] },
    ) =>
      tablesDB.updateRow<UserProfiles>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_profiles',
        rowId: id,
        data,
        ...(options?.permissions ? { permissions: options.permissions } : {}),
      }),
    delete: (id: string) =>
      tablesDB.deleteRow({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_profiles',
        rowId: id,
      }),
    list: (queries?: string[]) =>
      tablesDB.listRows<UserProfiles>({
        databaseId: process.env.APPWRITE_DB_ID!,
        tableId: 'user_profiles',
        queries,
      }),
  },
}
