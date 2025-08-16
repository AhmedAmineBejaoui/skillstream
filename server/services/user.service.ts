import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, userProfiles, instructors, type User, type UserProfile, type Instructor } from '@shared/schema';

export class UserService {
  async getUserById(id: number): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        profile: true,
        instructor: true
      }
    });
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return db.query.users.findFirst({
      where: eq(users.email, email),
      with: {
        profile: true,
        instructor: true
      }
    });
  }

  async getAllUsers(): Promise<User[]> {
    return db.query.users.findMany({
      with: {
        profile: true,
        instructor: true
      }
    });
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.id, id));
  }

  async createInstructor(userId: number, data: Partial<Instructor>): Promise<Instructor> {
    // First update user role
    await this.updateUser(userId, { role: 'instructor' });

    // Create instructor profile
    const [instructor] = await db.insert(instructors).values({
      userId,
      ...data
    }).returning();

    return instructor;
  }
}

export const userService = new UserService();
